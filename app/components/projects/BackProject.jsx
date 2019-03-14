import React from 'react'
import { Formik } from 'formik'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { withStyles } from '@material-ui/core/styles'
import { useProjectData } from './hooks'
import Divider from '@material-ui/core/Divider'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

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

const SubmissionSection = ({ classes, profiles }) => (
  <Formik
    initialValues={{ delegateProfile: ''}}
    onSubmit={console.log}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      setFieldValue,
      setStatus,
      status
    }) => (
      <form onSubmit={handleSubmit} className={classes.submissionRoot}>
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
          value={values.delegateProfile || ''}
        >
          {profiles && profiles.map(profile => (
            <MenuItem style={{ display: 'flex', alignItems: 'center' }} key={profile.name} value={profile.name}>
              {profile.name}
            </MenuItem>
          ))}
        </TextField>
      </form>
    )}
  </Formik>
)

function BackProject({classes, match, profile, projectAddedEvents, delegateAddedEvents}) {
  const projectId = match.params.id
  const { projectAge, projectAssets, manifest, delegateProfiles } = useProjectData(projectId, profile, projectAddedEvents)
  console.log({delegateAddedEvents})
  return (
    <div className={classes.root}>
      <Title className={classes.title} manifest={manifest} />
      <SubmissionSection classes={classes} profiles={delegateProfiles} />
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
