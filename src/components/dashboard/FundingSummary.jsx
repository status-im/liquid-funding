import React from 'react'
import PropTypes from 'prop-types'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { getDepositWithdrawTotals, getPledgesWaitingCommit } from '../../selectors/pledging'
import { getTokenAddress } from '../../utils/currencies'

const styles = {
  card: {
    minWidth: 275,
  },
  cardTitle: {
    paddingBottom: '1rem'
  },
  fundingSummaries: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
  linearColorPrimary: {
    backgroundColor: '#b2dfdb',
  },
  linearBarColorPrimary: {
    backgroundColor: '#00695c',
  },
  titleText: {
    textAlign: 'center',
    paddingTop: '2rem'
  }
}

const getNet = (deposits, withdraws) => Number(deposits) - Number(withdraws)
const getValue = (deposits, withdraws) => (getNet(deposits, withdraws) / Number(deposits)) * 100
function SimpleCard(props) {
  const { classes, title, transfers, pledges, vaultEvents } = props

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" className={classes.cardTitle}>
          {title}
        </Typography>
        {!!transfers && !!pledges.length &&
        Object.entries(getDepositWithdrawTotals({transfers, pledges, vaultEvents}))
          .map(token => {
            const [name, amounts] = token
            const {deposits, withdraws} = amounts
            const address = getTokenAddress(name)
            const pledgesForCommit = getPledgesWaitingCommit({pledges}).filter(p => p.token === address)
            return (
              <Card key={name}>
                <Typography variant="h5" className={classes.titleText}>
                  {name}
                </Typography>
                <CardContent className={classes.fundingSummaries}>
                  <Typography variant="h3">
                    {Number(deposits) - Number(withdraws || 0)}
                  </Typography>
                  <Typography variant="h6" key={name + 'total'} className={classes.pos} color="textSecondary">
                    Remaining In Pledges
                  </Typography>
                  <Typography variant="h3">
                    {deposits}
                  </Typography>
                  <Typography variant="h6" key={name + 'withdraw'} className={classes.pos} color="textSecondary">
                    Funded
                  </Typography>
                  <Typography variant="h3">
                    {withdraws || 0}
                  </Typography>
                  <Typography variant="h6" key={name + 'deposit'} className={classes.pos} color="textSecondary">
                    Withdrawn
                  </Typography>
                  <Typography variant="h3">
                    {pledgesForCommit.length}
                  </Typography>
                  <Typography variant="h6" key={name + 'veto/approve'} className={classes.pos} color="textSecondary">
                    Pledges that can be vetoed / approved
                  </Typography>
                </CardContent>
                <LinearProgress
                  classes={{
                    colorPrimary: classes.linearColorPrimary,
                    barColorPrimary: classes.linearBarColorPrimary,
                  }}
                  color="primary"
                  variant="buffer"
                  value={getValue(deposits, withdraws)}
                  valueBuffer={100}
                />
              </Card>
            )
          })}
      </CardContent>
    </Card>
  )
}

SimpleCard.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  pledges: PropTypes.array.isRequired,
  transfers: PropTypes.array.isRequired,
  vaultEvents: PropTypes.array.isRequired
}

const styledCard =  withStyles(styles)(SimpleCard)
export default withDatabase(withObservables([], ({ database }) => ({
  transfers: database.collections.get('lp_events').query(
    Q.where('event', 'Transfer')
  ).observe(),
  vaultEvents : database.collections.get('vault_events').query().observe()
}))(styledCard))

