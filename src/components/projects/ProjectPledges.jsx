/*global web3*/
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import { useProjectData, useProfileData, usePledgesAuthorizations } from './hooks'
import { Button, Divider, Typography, Card, CardActions, CardContent, FormControlLabel, Switch } from '@material-ui/core'
import { toEther, /*toWei*/ } from '../../utils/conversions'
import { getTokenLabel } from '../../utils/currencies'

// create form with cards showing multiple pledges, allow each to be selected and use mWithdraw to submit a withdrawal for them all

const { mWithdraw, withdraw } = LiquidPledging.methods
const { utils } = web3

const encodePledges = pledges => pledges.map(p => {
  // .substring is to remove the 0x prefix on the toHex result
  return (
    '0x' +
    utils.padLeft(utils.toHex(p.amount).substring(2), 48) +
    utils.padLeft(utils.toHex(p.id).substring(2), 16)
  );
});

const pledgeStateMap = {
  0: 'Pledged',
  1: 'Paying',
  2: 'Paid'
}

const getCommitTime = async (pledge, setState) => {
  const { commitTime } = pledge
  const profile = await pledge.profile.fetch()
  if (!profile || Number(commitTime) === 0) return 0
  const time = Number(commitTime) + Number(profile.commitTime)
  const date = new Date(time * 1000)
  setState(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}`)
}

const styles = theme => ({
  card: {
    minWidth: 275,
  },
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridRowGap: '36px',
    fontFamily: theme.typography.fontFamily,
    [theme.breakpoints.up('sm')]: {
      margin: '1.75rem 4.5rem'
    }
  },
  title: {
    display: 'grid',
    fontSize: '2.5rem',
    gridColumnStart: '1',
    gridColumnEnd: '13',
    gridRowStart: '1',
    gridRowEnd: '6',
    textAlign: 'center'
  },
  subText: {
    textAlign: 'center',
    marginBottom: '0.5em'
  },
  switchSelect: {
    display: 'grid',
    gridColumnStart: '3',
    gridColumnEnd: '9'
  },
  submissionRoot: {
    display: 'grid',
    gridRowGap: '36px',
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  textField: {
    width: '100%'
  }
})

function SimplePledge({ classes, pledge, values, handleChange }) {
  const [commitTime, setCommitTime] = useState(0);
  const pledgeId = `pledge.${pledge.id}`
  const keys = Object.keys(values)
  const value = keys.find(k => values[k].id === pledgeId)

  useEffect(() => {
    getCommitTime(pledge, setCommitTime)
  }, [pledge])

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="primary" gutterBottom>
          {toEther(pledge.amount)} {getTokenLabel(pledge.token)}
        </Typography>
        <Typography variant="h5" component="h2" className={classes.subText}>
          Pledge ID: {pledge.idPledge}
        </Typography>
        <Typography variant="h6" component="h3" className={classes.subText}>
          Pledge Status: {pledgeStateMap[pledge.pledgeState]}
        </Typography>
        <Typography variant="h6" component="h3" className={classes.subText}>
          Commit Time: {commitTime}
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              name={`pledge.${pledge.id}`}
              checked={value}
              onChange={handleChange}
              value="checkedA"
            />
          }
          label="withdraw"
        />
      </CardActions>
    </Card>
  );
}

SimplePledge.propTypes = {
  classes: PropTypes.object.isRequired,
  pledge: PropTypes.object.isRequired
};
const PledgeInfo = withStyles(styles)(SimplePledge);

const Title = ({ className, manifest }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>{manifest && manifest.title}</div>
    <div style={{ alignSelf: 'center', fontSize: '1.2rem', fontWeight: 200 }}>{manifest && `By ${manifest.creator}`}</div>
    <Divider />
  </div>
)
const SubmissionSection = ({ classes, projectId, openSnackBar, pledges }) => {
  return (
    <Formik
      onSubmit={async(values, { resetForm }) => {
        const { pledge } = values
        const filteredPledges = Object.keys(pledge)
          .filter(p => !!pledge[p])
          .map(pledge => pledges.find(p => p.id === pledge))
          .map(pledge => ({ amount: pledge.amount, id: pledge.idPledge }))
        const encodedPledges = encodePledges(filteredPledges)
        console.log({openSnackBar, resetForm, values, projectId, filteredPledges, encodePledges, pledges, mWithdraw})
        const args = filteredPledges.length > 1 ? [encodedPledges] : [filteredPledges[0].id, filteredPledges[0].amount]
        const sendFn = filteredPledges.length > 1 ? mWithdraw : withdraw
        const toSend = sendFn(...args)
        const estimatedGas = await toSend.estimateGas()
        console.log({estimatedGas})
        toSend.send({gas: estimatedGas})
          .then(async res => {
            console.log({res})
          })
          .catch(e => {
            openSnackBar('error', 'An error has occured with the transaction')
            console.log({e})
          })
          .finally(() => {
            openSnackBar('success', 'Withdraws initiated')
            resetForm()
          })


      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        handleSubmit,
        setFieldValue: _setFieldValue,
        setStatus: _setStatus,
        status: _status
      }) => {
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {pledges.map(pledge => <PledgeInfo key={pledge.id} pledge={pledge} values={values} handleChange={handleChange} />)}
            <Button type="submit" color="primary" variant="contained" style={{height: '50px', width: '100%'}}>Submit for
              withdraw</Button>
          </form>
        )
      }
      }
    </Formik>
  )
}

function ProjectPledges({classes, match, delegates: _delegates, projectAddedEvents, delegateAddedEvents: _delegateAddedEvents, pledges, authorizedPayments}) {
  const projectId = match.params.id
  const {  manifest, delegateProfiles, openSnackBar } = useProjectData(projectId, projectAddedEvents)
  const delegatePledges = useProfileData(delegateProfiles)
  const enrichedPledges = usePledgesAuthorizations(pledges, authorizedPayments)
  console.log('pledges', {pledges, authorizedPayments, enrichedPledges})
  return (
    <div className={classes.root}>
      <Title className={classes.title} manifest={manifest} />
      <SubmissionSection
        classes={classes}
        profiles={delegateProfiles}
        delegatePledges={delegatePledges}
        projectId={projectId}
        openSnackBar={openSnackBar}
        pledges={pledges}
      />
    </div>
  )
}

const StyledPledges = withStyles(styles)(ProjectPledges)
export default withDatabase(withObservables([], ({ database, match }) => ({
  profile: database.collections.get('profiles').query(
    Q.where('id_profile', match.params.id)
  ).observe(),
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe(),
  delegateAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'DelegateAdded')
  ).observe(),
  pledges: database.collections.get('pledges').query(
    Q.or(
      Q.where('intended_project', match.params.id),
      Q.where('owner_id', match.params.id)
    )
  ).observe(),
  authorizedPayments: database.collections.get('vault_events').query(
    Q.where('event', 'AuthorizePayment')
  ).observe()
}))(StyledPledges))

