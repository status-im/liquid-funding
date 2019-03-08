import React from 'react'
import web3 from 'Embark/web3'
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
    margin: '1.75rem 4.5rem',
    fontFamily: theme.typography.fontFamily
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

const SubmissionSection = ({ classes }) => (
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
          value={values.adminType || ''}
        />
      </form>
    )}
  </Formik>
)

function BackProject({classes, match, profile, projectAddedEvents}) {
  const projectId = match.params.id
  const { projectAge, projectAssets, manifest, delegateProfiles } = useProjectData(projectId, profile, projectAddedEvents)
  console.log({delegateProfiles})
  return (
    <div className={classes.root}>
      <Title className={classes.title} manifest={manifest} />
      <SubmissionSection classes={classes}/>
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
  ).observe()
}))(StyledProject))
