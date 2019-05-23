/*global web3*/
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import LPVault from '../../embarkArtifacts/contracts/LPVault'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import { useProjectData, useProfileData, usePledgesAuthorizations } from './hooks'
import { Button, Divider, Typography, Card, CardActions, CardContent, FormControlLabel, Switch } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import Paper from '@material-ui/core/Paper'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import { toEther } from '../../utils/conversions'
import { getTokenLabel } from '../../utils/currencies'

const { mWithdraw, withdraw } = LiquidPledging.methods
const { confirmPayment } = LPVault.methods
const { utils } = web3

const encodePledges = pledges => pledges.map(p => {
  // .substring is to remove the 0x prefix on the toHex result
  return (
    '0x' +
    utils.padLeft(utils.toHex(p.amount).substring(2), 48) +
    utils.padLeft(utils.toHex(p.id).substring(2), 16)
  );
});

const PLEDGED = 'Pledged'
const PAYING = 'Paying'
const PAID = 'Paid'
const pledgeTypes = {
  0: PLEDGED,
  1: PAYING,
  2: PAID
}
const buttonText = {
  0: 'Submit for withdraw',
  1: 'Confirm withdraw',
  2: 'Already paid'
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

function SimplePledge({ classes, pledge, values, handleChange, pledgeType }) {
  const [commitTime, setCommitTime] = useState(0);
  const pledgeId = `pledge.${pledge.id}`
  const keys = Object.keys(values)
  const value = keys.find(k => values[k].id === pledgeId)

  useEffect(() => {
    getCommitTime(pledge, setCommitTime)
  }, [pledge])

  const notPaid = pledgeTypes[pledgeType] !== PAID
  const notPaying = pledgeTypes[pledgeType] !== PAYING
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
          Pledge Status: {pledgeTypes[pledge.pledgeState]}
        </Typography>
        {notPaid && <Typography variant="h6" component="h3" className={classes.subText}>
          Commit Time: {commitTime}
        </Typography>}
      </CardContent>
      {notPaid && <CardActions style={{ justifyContent: 'center' }}>
        <FormControlLabel
          control={
            <Switch
              name={`pledge.${pledge.id}`}
              checked={value}
              onChange={handleChange}
              value="checkedA"
            />
          }
          label={notPaying ? 'Withdraw' : 'Confirm'}
        />
      </CardActions>}
    </Card>
  );
}

SimplePledge.propTypes = {
  classes: PropTypes.object.isRequired,
  pledge: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  pledgeType: PropTypes.number.isRequired
};
const PledgeInfo = withStyles(styles)(SimplePledge);

const Title = ({ className, manifest }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>{manifest && manifest.title}</div>
    <div style={{ alignSelf: 'center', fontSize: '1.2rem', fontWeight: 200 }}>{manifest && `By ${manifest.creator}`}</div>
    <Divider />
  </div>
)

const getSendFn = (pledgeType, filteredPledges) => {
  if (pledgeTypes[pledgeType] === PLEDGED) {
    return filteredPledges.length > 1 ? mWithdraw : withdraw
  }
  return confirmPayment

}
const getArgs = (pledgeType, filteredPledges) => {
  if (pledgeTypes[pledgeType] === PLEDGED) {
    const formattedPledges = filteredPledges.map(pledge => ({ amount: pledge.amount, id: pledge.idPledge }))
    if (filteredPledges.length > 1) return [encodePledges(formattedPledges)]
    const withdrawArgs = [formattedPledges[0].id, formattedPledges[0].amount]
    return withdrawArgs
  }
  const { idPayment } = filteredPledges.filter(p => !!p)[0].authorization.returnValues
  return [idPayment]
}
const SubmissionSection = ({ classes, openSnackBar, syncWithRemote, pledges, pledgeType }) => {
  return (
    <Formik
      onSubmit={async(values) => {
        const { pledge } = values
        const filteredPledges = Object.keys(pledge)
          .filter(p => !!pledge[p])
          .map(pledge => pledges.find(p => p.id === pledge))
        const sendFn = getSendFn(pledgeType, filteredPledges)
        const args = getArgs(pledgeType, filteredPledges)
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
            syncWithRemote()
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
            {pledges.map(pledge => <PledgeInfo key={pledge.id} pledge={pledge} values={values} handleChange={handleChange} pledgeType={pledgeType} />)}
            {pledgeTypes[pledgeType] !== PAID && <Button type="submit" color="primary" variant="contained" style={{height: '50px', width: '100%'}}>{buttonText[pledgeType]}</Button>}
          </form>
        )
      }
      }
    </Formik>
  )
}

const useStyles = makeStyles({
  root: {
    gridColumnEnd: '13',
    gridColumnStart: '1',
  },
})

function CenteredTabs({ pledged, paying, paid, pledgeType, setPledgeType }) {
  const classes = useStyles();

  function handleChange(event, newValue) {
    setPledgeType(newValue);
  }

  return (
    <Paper className={classes.root}>
      <Tabs
        value={pledgeType}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab label={`Pledged (${pledged})`} />
        <Tab label={`Paying (${paying})`} />
        <Tab label={`Paid (${paid})`} />
      </Tabs>
    </Paper>
  );
}

function ProjectPledges({classes, match, projectAddedEvents, pledges, authorizedPayments}) {
  const [pledgeType, setPledgeType] = useState(0)
  const projectId = match.params.id
  const {  manifest, delegateProfiles, openSnackBar, syncWithRemote } = useProjectData(projectId, projectAddedEvents)
  const delegatePledges = useProfileData(delegateProfiles)
  const enrichedPledges = usePledgesAuthorizations(pledges, authorizedPayments).filter(p => Number(p.amount) > 0)
  const pledged = enrichedPledges.filter(p => p.pledgeState === 0)
  const paying = enrichedPledges.filter(p => p.pledgeState === 1)
  const paid = enrichedPledges.filter(p => p.pledgeState === 2)
  const selectedPledges = {
    0: pledged,
    1: paying,
    2: paid
  }
  return (
    <div className={classes.root}>
      <Title className={classes.title} manifest={manifest} />
      <CenteredTabs
        pledged={pledged.length}
        paying={paying.length}
        paid={paid.length}
        pledgeType={pledgeType}
        setPledgeType={setPledgeType}
      />
      <SubmissionSection
        classes={classes}
        profiles={delegateProfiles}
        delegatePledges={delegatePledges}
        projectId={projectId}
        openSnackBar={openSnackBar}
        syncWithRemote={syncWithRemote}
        pledges={selectedPledges[pledgeType]}
        pledgeType={pledgeType}
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

