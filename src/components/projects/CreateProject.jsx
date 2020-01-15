/*eslint complexity: ["error", 25]*/
import React, { createRef, useState, useContext, memo } from 'react'
import { Formik } from 'formik'
import classnames from 'classnames'
import ReactMarkdown from 'react-markdown'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import Button from '@material-ui/core/Button'
import InputAdornment from '@material-ui/core/InputAdornment'
import { withStyles } from '@material-ui/core/styles'
import { withRouter } from "react-router-dom"
import useWindowSize from '@rehooks/window-size'
import { isEmpty } from 'ramda'
import * as Yup from 'yup'
import { uploadFilesToIpfs, pinToGateway, formatMedia, isWeb } from '../../utils/ipfs'
import { FundingContext } from '../../context'
import {ZERO_ADDRESS} from '../../utils/address'
import CurrencySelect from '../base/CurrencySelect'
import StatusTextField from '../base/TextField'
import IconTextField from '../base/IconTextField'
import Icon from '../base/icons/IconByName'
import { convertTokenAmountUsd } from '../../utils/prices'
import { generateChatRoom, setMediaType } from '../../utils/project'
import MediaView from '../base/MediaView'
import { isVideo } from '../../utils/images'
import BreadCrumb from '../base/BreadCrumb'
import { errorStrings } from '../../constants/errors'
import StatusButton from '../base/Button'


const { addProject } = LiquidPledging.methods
const { TOO_LONG, REQUIRED } = errorStrings

const NOT_SUBMITTED = 'Not Submitted'
const SUBMITTED = 'Submitted'
const CONFIRMED = 'Confirmed'

const hoursToSeconds = hours => hours * 60 * 60

const validationSchema = Yup.object().shape({
  title: Yup.string().max(20, TOO_LONG).required(REQUIRED),
  subtitle: Yup.string().max(120, TOO_LONG),
  creator: Yup.string().required(REQUIRED),
  goal: Yup.number().required(REQUIRED).positive().integer(),
  goalToken: Yup.string().required(REQUIRED)
});

const styles = theme => ({
  adornmentText: {
    cursor: 'pointer',
    color: '#4360DF'
  },
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridRowGap: '3ch',
    fontFamily: theme.typography.fontFamily,
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
  columnStart: {
    gridColumnStart: '1',
  },
  formControl: {
    gridColumnStart: '6'
  },
  formButton: {
    gridColumnStart: '6',
    gridColumnEnd: '13',
    height: '50px',
    [theme.breakpoints.down('sm')]: {
      marginTop: '5rem'
    }
  },
  textField: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  firstHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridRowGap: '2rem',
    gridColumnStart: '1',
    gridColumnEnd: '8',
  },
  halfsRows: {
    gridTemplateRows: '7rem 5em auto'
  },
  chatRoom: {
    display: 'grid',
    gridColumnStart: 1,
    gridColumnEnd: 13,
    justifyItems: 'start',
    gridAutoFlow: 'column',
    paddingLeft: '5px',
    gridTemplateColumns: 'repeat(12, 1fr)'
  },
  chatRoomIcon: {
    justifySelf: 'auto'
  },
  chatText: {
    marginTop: '15px',
    color: '#000000',
    gridColumn: '3 / 13'
  },
  secondHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridRowGap: '2rem',
    gridColumnStart: '9',
    gridColumnEnd: '13',
    height: 'fit-content'
  },
  markdown: {
    display: 'grid',
    margin: '16px 0 8px 0',
    padding: '10%'
  },
  markdownPreview: {
    gridColumnStart: 12
  },
  textInput: {
    fontSize: '2rem'
  },
  fullWidth: {
    gridColumn: '1 / 13'
  },
  threeFourthWidth: {
    gridColumn: '1 / 10',
    [theme.breakpoints.down('sm')]: {
      gridColumn: '1 / 13'
    }
  },
  breadCrumb: {
    color: '#939BA1'
  },
  icon: {
    background: '#ECEFFC'
  },
  preview: {
    fontSize: '20px'
  }
})


const createJSON = values => {
  const {
    title,
    subtitle,
    creator,
    repo,
    avatar,
    goal,
    goalToken,
    media,
    isPlaying,
    description
  } = values

  const manifest = {
    title,
    subtitle,
    creator,
    repo,
    avatar: formatMedia(avatar),
    goal,
    goalToken,
    description,
    chatRoom: generateChatRoom(title),
    media: {
      isPlaying,
      type: setMediaType(media)
    }
  }

  if (isWeb(media)) Object.assign(manifest.media, { url: formatMedia(media) })
  else Object.assign(manifest.media, { file: formatMedia(media) })
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
  const [submissionState, setSubmissionState] = useState(NOT_SUBMITTED)
  const { account, currencies, enableEthereum, openSnackBar, prices } = useContext(FundingContext)
  const windowSize = useWindowSize()
  const isSmall = windowSize.innerWidth < 800
  return (
    <Formik
      initialValues={{
        title: '',
        subtitle: '',
        creator: '',
        repo: '',
        avatar: '',
        media: '',
        goal: '',
        goalToken: '',
        isPlaying: false,
        description: '',
        commitTime: 24
      }}
      validationSchema={validationSchema}
      onSubmit={async (values, { resetForm }) => {
        const { title, commitTime } = values
        let user = account;
        if (!user) user = await enableEthereum()
        const manifest = createJSON(values)
        const contentHash = await uploadFilesToIpfs(uploads, manifest)
        uploadFilesToIpfs(uploads, manifest, true)
        const args = [title, contentHash, user, 0, hoursToSeconds(commitTime), ZERO_ADDRESS]
        console.log({args})
        addProject(...args)
          .estimateGas({ from: user })
          .then(async gas => {
            addProject(...args)
              .send({ from: user, gas: gas + 100 })
              .on('transactionHash', (hash) => {
                setSubmissionState(SUBMITTED)
                openSnackBar('success', `Submitted request to chain. TX Hash: ${hash}`)
              })
              .then(async res => {
                pinToGateway(contentHash)
                console.log({res})
                setSubmissionState(CONFIRMED)
                openSnackBar('success', addProjectSucessMsg(res))
                setTimeout(() => {
                  history.push(`/fund-project/${getProjectId(res)}?new=true`)
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
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
        setStatus,
        status,
        isSubmitting
      }) => {
        const { firstHalf, secondHalf, fullWidth, halfsRows } = classes
        const { goalToken, goal } = values
        const usdValue = convertTokenAmountUsd(goalToken, goal, prices, currencies)
        const showSpinner = submissionState === SUBMITTED
        const disableButton = showSpinner || !isEmpty(errors)
        const buttonText = showSpinner ? 'Awaiting confirmation' : 'Publish'
        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            <div className={classnames(firstHalf, halfsRows, {
              [classes.fullWidth]: isSmall
            })}>
              <BreadCrumb
                className={fullWidth}
                trail={['Create new']}
              />
              <StatusTextField
                className={fullWidth}
                isRequired={true}
                idFor="Project Name"
                name="title"
                label="Name"
                bottomRightLabel="Max 20"
                bottomRightError={touched.title && errors.title === TOO_LONG}
                errorBorder={(touched.title && errors.title === REQUIRED) || (touched.title && errors.title === TOO_LONG)}
                placeholder="e.g. ‘Tribute to Talk’ or ‘Bob’"
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
                bottomRightError={errors.subtitle === TOO_LONG}
                errorBorder={errors.subtitle === TOO_LONG}
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
                errorBorder={touched.creator && errors.creator === REQUIRED}
                placeholder="Contract Person"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.creator || ''}
              />
              <div className={classes.chatRoom}>
                <Icon name="oneOnOneChat" />
                <div className={classes.chatText}>{`Join ${generateChatRoom(values.title)}`}</div>
              </div>
              <IconTextField
                iconName="boxArrow"
                idFor="repo"
                name="repo"
                placeholder="Code Repo"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.repo || ''}
              />
              <IconTextField
                iconName="photo"
                endAdornment={(
                  <InputAdornment position="start">
                    <span
                      className={classes.adornmentText}
                      onClick={() => {
                        const activeField = 'media'
                        setStatus({ ...status, activeField })
                        uploadInput.click()
                      }
                      }
                    >Browse
                    </span>
                  </InputAdornment>
                )}
                className={fullWidth}
                idFor="media"
                name="media"
                placeholder="Upload media or enter url"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.media || ''}
              />
              {values.media && <MediaView isVideo={isVideo(uploads.media[0])} className={fullWidth} source={URL.createObjectURL(uploads.media[0])} />}
              {status && status.showPreview &&
               <div className={classnames(classes.markdown, fullWidth)}>
                 <div
                   className={classnames(
                     classes.adornmentText,
                     classes.preview,
                     classes.markdownPreview
                   )}
                   onClick={() => {
                     setStatus({ ...status, showPreview: false })
                   }}
                 >
                   Hide preview
                 </div>
                 <div>
                   <ReactMarkdown source={values.description} />
                 </div>
               </div>}
              {(!status || !status.showPreview) && <StatusTextField
                className={fullWidth}
                InputProps={{
                  style: { height: '10em' }
                }}
                idFor="Full description"
                name="description"
                label="Full description"
                bottomLeftLabel="Markdown available"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.description || ''}
                multiline={true}
                topRight={
                  <span
                    className={classnames(classes.adornmentText, classes.preview)}
                    onClick={() => {
                      setStatus({ ...status, showPreview: true })
                    }}
                  >
                    Preview
                  </span>
                }
              />}
            </div>
            <div className={classnames(secondHalf, halfsRows, {
              [classes.fullWidth]: isSmall
            })}>
              <StatusButton
                className={classnames(classes.formButton, {
                  [classes.fullWidth]: isSmall
                })}
                disabled={disableButton}
                buttonText={buttonText}
                confirmed={submissionState === CONFIRMED}
                loading={showSpinner}
              />
              {false && <Button type="submit" disabled={!isEmpty(errors)} color="primary" variant="contained" className={classnames(classes.formButton, {
                [classes.columnStart]: showSpinner,
                [classes.fullWidth]: isSmall
              })}>{isSubmitting ? 'Awaiting confirmations' : 'Publish'}</Button>}
              <CurrencySelect
                className={classes.threeFourthWidth}
                InputProps={{
                  classes: {
                    input: classes.textInput
                  }
                }}
                id="goalToken"
                label="Token"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.goalToken}
                publishing
              />
              <StatusTextField
                className={classnames(classes.threeFourthWidth)}
                isRequired={true}
                multiline={true}
                idFor="goal"
                name="goal"
                label="Enter your funding goal"
                placeholder="Amount e.g. 10000"
                bottomLeftLabel={usdValue}
                errorBorder={touched.goal && errors.goal}
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
export default withRouter(memo(StyledProject))
