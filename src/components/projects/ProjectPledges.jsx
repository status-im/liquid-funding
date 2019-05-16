import React from 'react'
import PropTypes from 'prop-types'
import { Formik } from 'formik'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import { useProjectData, useProfileData } from './hooks'
import { Button, Divider, Typography, Card, CardActions, CardContent, FormControlLabel, Switch } from '@material-ui/core'
import { toEther, toWei } from '../../utils/conversions'
import { getTokenLabel } from '../../utils/currencies'


// create form with cards showing multiple pledges, allow each to be selected and use mWithdraw to submit a withdrawal for them all

const { transfer } = LiquidPledging.methods

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
    textAlign: 'center'
  },
  switchSelect: {
    display: 'grid',
    gridColumnStart: '3',
    gridColumnEnd: '9'
  },
  submissionRoot: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  textField: {
    width: '100%'
  }
})

function SimplePledge({ classes, pledge, values, handleChange }) {
  const pledgeId = `pledge.${pledge.id}`
  const keys = Object.keys(values)
  const value = keys.find(k => values[k].id === pledgeId)
  console.log({values})

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography className={classes.title} color="primary" gutterBottom>
          {toEther(pledge.amount)} {getTokenLabel(pledge.token)}
        </Typography>
        <Typography variant="h5" component="h2" className={classes.subText}>
          Pledge ID: {pledge.idPledge}
        </Typography>
        <Typography component="p" className={classes.subText}>
          commit time {pledge.commitTime}
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
const SubmissionSection = ({ classes, delegatePledges, projectId, openSnackBar, pledges }) => {
  return (
    <Formik
      initialValues={{ amount: '', delegateProfile: '', delegatePledge: '' }}
      onSubmit={async(values, { resetForm }) => {
        const { amount, delegateProfile, delegatePledge } = values
        const dPledge = delegatePledges.find(d => d.idPledge === delegatePledge)
        const pledge = await dPledge.pledge.fetch()
        const args = [delegateProfile.idProfile, delegatePledge, toWei(amount), projectId]
        console.log({values, args, pledge, delegatePledge})
        const toSend = transfer(...args)
        const estimatedGas = await toSend.estimateGas()
        console.log({estimatedGas, openSnackBar, resetForm})

      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        //handleBlur,
        handleSubmit,
        setFieldValue: _setFieldValue,
        setStatus: _setStatus,
        status: _status
      }) => {
        const filterPledges = delegateProfile => delegatePledges.filter(
          d => d.profile.id === delegateProfile.id && d.pledgeData.amount !== '0' && d.pledgeData.pledgeState === 0 && d.pledgeData.intendedProject === 0
        )
        const filteredPledges = values.delegateProfile ? filterPledges(values.delegateProfile) : null
        console.log({filteredPledges})
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {pledges.map(pledge => <PledgeInfo key={pledge.id} pledge={pledge} values={values} handleChange={handleChange} />)}
            <Button type="submit" color="primary" variant="contained" style={{height: '50px', width: '100%'}}>Submit for
               Funding</Button>
          </form>
        )
      }
      }
    </Formik>
  )
}

function ProjectPledges({classes, match, delegates: _delegates, projectAddedEvents, delegateAddedEvents: _delegateAddedEvents, pledges}) {
  const projectId = match.params.id
  const {  manifest, delegateProfiles, openSnackBar } = useProjectData(projectId, projectAddedEvents)
  const delegatePledges = useProfileData(delegateProfiles)
  console.log('pledges', {pledges})
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
    Q.where('intended_project', match.params.id)
  ).observe()
}))(StyledPledges))

