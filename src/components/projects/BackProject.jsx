import React from 'react'
import { Formik } from 'formik'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import { useProjectData, useProfileData } from './hooks'
import {TextField, Button, MenuItem, Divider, Typography, Link} from '@material-ui/core'
import { toEther, toWei } from '../../utils/conversions'
import { getTokenLabel } from '../../utils/currencies'

const { transfer } = LiquidPledging.methods

const styles = theme => ({
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
  submissionRoot: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  textField: {
    width: '100%'
  }
})

const Title = ({ className, manifest }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>{manifest && manifest.title}</div>
    <div style={{ alignSelf: 'center', fontSize: '1.2rem', fontWeight: 200 }}>{manifest && `By ${manifest.creator}`}</div>
    <Divider />
  </div>
)
const SubmissionSection = ({ classes, profiles, delegatePledges, projectId, openSnackBar }) => {
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

        toSend
          .send({gas: estimatedGas + 1000})
          .then(async res => {
            console.log({res})
            const { events: { Transfer } } = res
            if (Array.isArray(Transfer)) {
              Transfer.forEach(async t => {
                const { to, amount } = t.returnValues
                await pledge.transferTo(to, amount, projectId)
              })
            } else {
              const { to, amount } = Transfer.returnValues
              await pledge.transferTo(to, amount, projectId)
            }
          })
          .catch(e => {
            openSnackBar('error', 'An error has occured with the transaction')
            console.log({e})
          })
          .finally(() => {
            openSnackBar('success', 'project backed!')
            resetForm()
          })
      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue: _setFieldValue,
        setStatus: _setStatus,
        status: _status
      }) => {
        const filterPledges = delegateProfile => delegatePledges.filter(
          d => d.profile.id === delegateProfile.id && d.pledgeData.amount !== '0' && d.pledgeData.pledgeState === 0 && d.pledgeData.intendedProject === 0
        )
        const filteredPledges = values.delegateProfile ? filterPledges(values.delegateProfile) : null
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {profiles && profiles.length === 0 &&
             <Typography color="error">
               Please create a Delegate profile before backing -
               <Link href="/#/create-delegate"> Delegate creation page</Link>
             </Typography>}
            <TextField
              className={classes.textField}
              id="delegateProfile"
              name="delegateProfile"
              select
              label="Select Delegate Profile"
              placeholder="Select Delegate Profile"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!profiles || profiles.length === 0}
              value={values.delegateProfile || ''}
            >
              {profiles && profiles.map((profile, index) => {
                const filteredPledges = filterPledges(profile)
                const numPledges = filteredPledges.length
                const amount = filteredPledges.reduce((cv,pv) => cv + Number(pv.pledgeData.amount) ,0)
                const token = numPledges ? filteredPledges[0].pledgeData.token : ''
                return (
                  <MenuItem style={{display: 'flex', alignItems: 'center'}} key={`profile-${index}`} value={profile}>
                    {profile.name} - {numPledges} Pledges - {toEther(amount.toString())} {getTokenLabel(token)}
                  </MenuItem>
                )
              })}
            </TextField>
            {filteredPledges && <TextField
              className={classes.textField}
              id="delegatePledge"
              name="delegatePledge"
              select
              label="Select Pledge for Funding"
              placeholder="Select Pledge for Funding"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.delegatePledge || ''}
            >
              {filteredPledges.map(pledge => (
                <MenuItem style={{display: 'flex', alignItems: 'center'}} key={pledge.idPledge} value={pledge.idPledge}>
                  {`Pledge no: ${pledge.idPledge} - Amount: ${toEther(pledge.pledgeData.amount)} ${getTokenLabel(pledge.pledgeData.token)}`}
                </MenuItem>
              ))}
            </TextField>}
            {values.delegatePledge && <TextField
              autoFocus
              margin="normal"
              id="amount"
              name="amount"
              label="Amount to transfer"
              placeholder="Amount to transfer"
              variant="outlined"
              autoComplete="off"
              fullWidth
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.amount || ''}
            />}
            {values.amount &&
             <Button type="submit" color="primary" variant="contained" style={{height: '50px', width: '100%'}}>Submit for
               Funding</Button>}
          </form>
        )
      }
      }
    </Formik>
  )
}

function BackProject({classes, match, delegates: _delegates, projectAddedEvents, delegateAddedEvents: _delegateAddedEvents}) {
  const projectId = match.params.id
  const {  manifest, delegateProfiles, openSnackBar } = useProjectData(projectId, projectAddedEvents)
  const delegatePledges = useProfileData(delegateProfiles)
  return (
    <div className={classes.root}>
      <Title className={classes.title} manifest={manifest} />
      <SubmissionSection
        classes={classes}
        profiles={delegateProfiles}
        delegatePledges={delegatePledges}
        projectId={projectId}
        openSnackBar={openSnackBar}
      />
    </div>
  )
}

const StyledProject = withStyles(styles)(BackProject)
export default withDatabase(withObservables([], ({ database, match }) => ({
  profile: database.collections.get('profiles').query(
    Q.where('id_profile', match.params.id)
  ).observe(),
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe(),
  delegateAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'DelegateAdded')
  ).observe()
}))(StyledProject))
