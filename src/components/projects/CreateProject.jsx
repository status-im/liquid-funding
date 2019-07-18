import React, { createRef, useState, useContext } from 'react'
import { Formik } from 'formik'
import classnames from 'classnames'
import ReactMarkdown from 'react-markdown'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import CloudUpload from '@material-ui/icons/CloudUpload'
import { withStyles } from '@material-ui/core/styles'
import { uploadFilesToIpfs, formatMedia, isWeb } from '../../utils/ipfs'
import { FundingContext } from '../../context'
import {ZERO_ADDRESS} from '../../utils/address'
import CurrencySelect from '../base/CurrencySelect'
import StatusTextField from '../base/TextField'

const { addProject } = LiquidPledging.methods


const hoursToSeconds = hours => hours * 60 * 60
const helperText = 'The length of time the Project has to veto when the project delegates to another delegate and they pledge those funds to a project'

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
    gridColumnStart: '6',
    gridColumnEnd: '13',
    height: '50px'
  },
  textField: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  firstHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '7rem',
    gridRowGap: '2rem',
    gridColumnStart: '1',
    gridColumnEnd: '8',
  },
  secondHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '7rem',
    gridRowGap: '2rem',
    gridColumnStart: '8',
    gridColumnEnd: '13',
    height: 'fit-content'
  },
  markdown: {
    borderStyle: 'solid',
    borderWidth: 'thin',
    borderColor: 'darkgray',
    margin: '16px 0 8px 0',
    padding: '10%'
  },
  textInput: {
    fontSize: '2rem'
  },
  fullWidth: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  breadCrumb: {
    color: '#939BA1'
  }
})


const createJSON = values => {
  const {
    title,
    subtitle,
    creator,
    avatar,
    goal,
    goalToken,
    video,
    isPlaying,
    description
  } = values

  const manifest = {
    title,
    subtitle,
    creator,
    avatar: formatMedia(avatar),
    goal,
    goalToken,
    description,
    media: {
      isPlaying,
      type: 'video'
    }
  }

  if (isWeb(video)) Object.assign(manifest.media, { url: formatMedia(video) })
  else Object.assign(manifest.media, { file: formatMedia(video) })
  return JSON.stringify(manifest, null, 2)
}

let uploadInput = createRef()
const getProjectId = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return idProject
}
const addProjectSucessMsg = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return `Project created with ID of ${idProject}, will redirect to your new project page in a few seconds`
}
const SubmissionSection = ({ classes, history }) => {
  const [uploads, setUploads] = useState({})
  const { account, openSnackBar } = useContext(FundingContext)
  return (
    <Formik
      initialValues={{
        title: '',
        subtitle: '',
        creator: '',
        avatar: '',
        goal: '',
        goalToken: '',
        video: '',
        isPlaying: true,
        description: '',
        commitTime: 24
      }}
      onSubmit={async (values, { resetForm }) => {
        const { title, commitTime } = values
        const manifest = createJSON(values)
        const contentHash = await uploadFilesToIpfs(uploads, manifest, true)
        const args = [title, contentHash, account, 0, hoursToSeconds(commitTime), ZERO_ADDRESS]
        addProject(...args)
          .estimateGas({ from: account })
          .then(async gas => {
            addProject(...args)
              .send({ from: account, gas: gas + 100 })
              .then(res => {
                // cache locally
                uploadFilesToIpfs(uploads, manifest)
                console.log({res})
                openSnackBar('success', addProjectSucessMsg(res))
                setTimeout(() => {
                  history.push(`/project/${getProjectId(res)}`)
                  resetForm()
                }, 5000)
              })
              .catch(e => openSnackBar('error', e))
          })
        console.log({manifest, values, uploads, contentHash})

      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setStatus,
        status,
        isSubmitting
      }) => {
        const { firstHalf, secondHalf, fullWidth } = classes
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            <div className={firstHalf}>
              <div className={classnames(classes.breadCrumb, fullWidth)}>
                {'All projects and delegates > Create new'}
              </div>
              <StatusTextField
                className={fullWidth}
                isRequired={true}
                idFor="Project Name"
                name="title"
                label="Project Name"
                bottomRightLabel="Max 20"
                placeholder="Project Name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title || ''}
              />
              <StatusTextField
                className={fullWidth}
                idFor="Short Description"
                name="subtitle"
                label="Short Description"
                bottomRightLabel="Max 120"
                placeholder="Short Description"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.subtitle || ''}
                multiline={true}
              />
              <StatusTextField
                className={fullWidth}
                isRequired={true}
                idFor="creator"
                name="creator"
                label="Contact Person"
                bottomLeftLabel="Name of the primary contact"
                placeholder="Short Description"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.creator || ''}
              />
              <TextField
                className={classes.textField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CloudUpload
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const activeField = 'avatar'
                          setStatus({ ...status, activeField })
                          uploadInput.click()
                        }
                        }
                      />
                    </InputAdornment>
                  ),
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <CloudUpload
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const activeField = 'video'
                          setStatus({ ...status, activeField })
                          uploadInput.click()
                        }
                        }
                      />
                    </InputAdornment>
                  ),
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
                    id="isPlaying"
                    checked={values.isPlaying}
                    onChange={handleChange}
                    value={values.isPlaying}
                  />
                }
                label="Autoplay video?"
              />
              <StatusTextField
                className={fullWidth}
                InputProps={{
                  style: { height: '100%' }
                }}
                idFor="Full description"
                name="description"
                label="Full description"
                bottomLeftLabel="Markdown available"
                placeholder="Full description"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.description || ''}
                multiline={true}
              />
              <StatusTextField
                className={fullWidth}
                isRequired={true}
                idFor="commitTime"
                name="commitTime"
                label="Commit Time (Hours)"
                bottomLeftLabel={helperText}
                placeholder="Commit Time (hours)"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.commitTime || ''}
              />
            </div>
            <div className={secondHalf}>
              <Button type="submit" color="primary" variant="contained" className={classnames(classes.formButton)}>{isSubmitting ? 'Ethereum Submission In Progress' : 'Create Project'}</Button>
              <CurrencySelect
                className={fullWidth}
                InputProps={{
                  classes: {
                    input: classes.textInput
                  }
                }}
                id="goalToken"
                label="Select Token"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.goalToken}
              />
              <TextField
                className={fullWidth}
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
              <input
                ref={(input) => {
                  uploadInput = input
                }}
                type="file"
                multiple
                onChange={
                  (e) => {
                    const file = e.target.files
                    const {activeField} = status
                    setFieldValue(activeField, file[0]['name'])
                    setUploads({...uploads, [activeField]: file})
                    setStatus({
                      ...status,
                      activeField: null
                    })
                  }
                }
                style={{display: 'none'}}
              />
              <div className={classes.markdown}>
                <ReactMarkdown source={values.description} />
              </div>
            </div>
          </form>
        )
      }
      }
    </Formik>
  )
}

function CreateProject({ classes, history }) {
  return (
    <div className={classes.root}>
      <SubmissionSection classes={classes} history={history} />
    </div>
  )
}

const StyledProject = withStyles(styles)(CreateProject)
export default StyledProject
