import React from 'react'
import { Formik } from 'formik'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridRowGap: '3ch',
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
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridColumnStart: '1',
    gridColumnEnd: '13',
    gridRowGap: '2ch',
  },
  formControl: {
    gridColumnStart: '6'
  },
  formButton: {
    gridColumnStart: '1',
    gridColumnEnd: '13',
    height: '50px'
  },
  textField: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  textInput: {
    fontSize: '2rem'
  }
})

const Title = ({ className }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>Create Project</div>
    <Divider />
  </div>
)

const SubmissionSection = ({ classes }) => {
  return (
    <Formik
      initialValues={{ projectName: '' }}
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
      }) => {
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="projectName"
              name="projectName"
              label="Enter Project Name"
              placeholder="Enter Project Name"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.projectName || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="subTitle"
              name="subTitle"
              label="Enter a sub heading description for your project"
              placeholder="Enter a sub heading description for your project"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.subTitle || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="creator"
              name="creator"
              label="Enter the project creator"
              placeholder="Enter the project creator"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.creator || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="avatar"
              name="avatar"
              label="Upload or enter link to creator avatar"
              placeholder="upload or enter link to creator avatar"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.avatar || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="goal"
              name="goal"
              label="Enter your funding goal"
              placeholder="Enter your funding goal"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.goal || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="goalToken"
              name="goalToken"
              label="Select Token"
              placeholder="Select Token"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.token || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="video"
              name="video"
              label="Upload video or enter url"
              placeholder="Upload video or enter url"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.video || ''}
            />
            <FormControlLabel
              className={classes.formControl}
              control={
                <Switch
                  id="autoPlay"
                      checked={values.autoPlay}
                      onChange={handleChange}
                      value={values.autoPlay}
                />
              }
              label="Autoplay video?"
            />
            <TextField
              className={classes.textField}
              id="description"
              name="description"
              multiline
              label="Enter extended description here"
              placeholder="Enter extended description here"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.description || ''}
            />
            <Button color="primary" variant="contained" className={classes.formButton}>Create Project</Button>
          </form>
        )
      }
      }
    </Formik>
  )
}

function CreateProject({ classes }) {
  return (
    <div className={classes.root}>
      <Title className={classes.title} />
      <SubmissionSection classes={classes} />
    </div>
  )
}

const StyledProject = withStyles(styles)(CreateProject)
export default StyledProject
