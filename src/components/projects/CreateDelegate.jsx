/*global Buffer*/
import React, { createRef, useState, useContext } from 'react'
import { Formik } from 'formik'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import TextField from '@material-ui/core/TextField'
import Divider from '@material-ui/core/Divider'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import CloudUpload from '@material-ui/icons/CloudUpload'
import { withStyles } from '@material-ui/core/styles'
import { formatForIpfs, uploadToIpfsGateway, formatMedia, isWeb } from '../../utils/ipfs'
import { FundingContext } from '../../context'
import {ZERO_ADDRESS} from '../../utils/address'
import CurrencySelect from '../base/CurrencySelect'

const { addDelegate } = LiquidPledging.methods


const hoursToSeconds = hours => hours * 60 * 60
const helperText = 'The length of time in hours the Delegate can be vetoed. Whenever this delegate is in a delegate chain the time allowed to veto any event must be greater than or equal to this time'

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

const Title = ({ className }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>Create Delegate</div>
    <Divider />
  </div>
)

let uploadInput = createRef()
const getDelegateId = response => {
  const { events: { DelegateAdded: { returnValues: { idDelegate } } } } = response
  return idDelegate
}
const addDelegateSucessMsg = response => {
  const { events: { DelegateAdded: { returnValues: { idDelegate } } } } = response
  return `Delegate created with ID of ${idDelegate}, will redirect to your new delegate page in a few seconds`
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
        let fileLists = []
        Object.keys(uploads).forEach(k => {
          fileLists = [...fileLists, formatForIpfs(uploads[k][0])]
        })
        fileLists.push({
          path: '/root/manifest.json', content: Buffer.from(manifest)
        })
        const contentHash = await uploadToIpfsGateway(fileLists)
        const args = [title, contentHash, hoursToSeconds(commitTime), ZERO_ADDRESS]
        addDelegate(...args)
          .estimateGas({ from: account })
          .then(async gas => {
            addDelegate(...args)
              .send({ from: account, gas: gas + 100 })
              .then(res => {
                console.log({res})
                openSnackBar('success', addDelegateSucessMsg(res))
                setTimeout(() => {
                  history.push(`/delegate/${getDelegateId(res)}`)
                  resetForm()
                }, 5000)
              })
              .catch(e => openSnackBar('error', e))
          })
        console.log({manifest, values, uploads, fileLists, contentHash})

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
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
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
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="title"
              name="title"
              label="Enter Delegate Name"
              placeholder="Enter Delegate Name"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.title || ''}
            />
            <TextField
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              id="subtitle"
              name="subtitle"
              label="Enter a sub heading description for your delegate profile"
              placeholder="Enter a sub heading description for your delegate profile"
              margin="normal"
              variant="outlined"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.subtitle || ''}
            />
            <TextField
              id="commitTime"
              name="commitTime"
              className={classes.textField}
              InputProps={{
                classes: {
                  input: classes.textInput
                }
              }}
              label="Commit time in hours"
              placeholder="Commit time in hours"
              margin="normal"
              variant="outlined"
              helperText={helperText}
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.commitTime || ''}
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
              label="Enter the delegate creator (optional)"
              placeholder="Enter the delegate creator (optional)"
              margin="normal"
              variant="outlined"
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
              label="Upload or enter link to delegate avatar"
              placeholder="upload or enter link to delegate avatar"
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
            <CurrencySelect
              className={classes.textField}
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
            <Button type="submit" color="primary" variant="contained" className={classes.formButton}>{isSubmitting ? 'Ethereum Submission In Progress' : 'Create Delegate'}</Button>
          </form>
        )
      }
      }
    </Formik>
  )
}

function CreateDelegate({ classes, history }) {
  return (
    <div className={classes.root}>
      <Title className={classes.title} />
      <SubmissionSection classes={classes} history={history} />
    </div>
  )
}

const StyledDelegate = withStyles(styles)(CreateDelegate)
export default StyledDelegate
