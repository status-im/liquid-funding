import React, { useState, useContext, useMemo } from 'react'
import { Formik } from 'formik'
import classnames from 'classnames'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { uploadFilesToIpfs, pinToGateway, formatMedia, isWeb } from '../../utils/ipfs'
import { FundingContext } from '../../context'
import {ZERO_ADDRESS} from '../../utils/address'
import CurrencySelect from '../base/CurrencySelect'
import StatusTextField from '../base/TextField'
import TextDisplay from '../base/TextDisplay'
import Icon from '../base/icons/IconByName'
import { convertTokenAmountUsd } from '../../utils/prices'
import { getAmountsPledged } from '../../utils/pledges'
import { useProjectData } from './hooks'
import { getNumberOfBackers, getMediaType, getMediaSrc } from '../../utils/project'
import { getDateCreated, convertToHours } from '../../utils/dates'

const { addProject } = LiquidPledging.methods


const hoursToSeconds = hours => hours * 60 * 60
const generateChatRoom = title => `#status-${title.replace(/\s/g, '')}`


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
  projectTitle:{
    fontSize: '28px',
    gridColumnStart: 1,
    gridColumnEnd: 13
  },
  projectSubTitle:{
    fontSize: '15px',
    gridColumnStart: 1,
    gridColumnEnd: 13
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
  chatRoom: {
    display: 'grid',
    gridColumnStart: 1,
    gridColumnEnd: 13,
    justifyItems: 'start',
    gridAutoFlow: 'column',
    paddingLeft: '5px'
  },
  halfText: {
    gridColumnStart: 4
  },
  chatRoomIcon: {
    justifySelf: 'auto'
  },
  chatText: {
    marginTop: '15px',
    color: '#939BA1'
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
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  breadCrumb: {
    color: '#939BA1'
  },
  icon: {
    background: '#ECEFFC'
  },
  preview: {
    fontSize: '20px'
  },
  contact: {
    gridColumnStart: '1',
    gridColumnEnd: '6'
  },
  created: {
    gridColumnStart: '7',
    gridColumnEnd: '13'
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
    video,
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
      type: 'video'
    }
  }

  if (isWeb(video)) Object.assign(manifest.media, { url: formatMedia(video) })
  else Object.assign(manifest.media, { file: formatMedia(video) })
  return JSON.stringify(manifest, null, 2)
}

const getProjectId = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return idProject
}
const addProjectSucessMsg = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return `Project created with ID of ${idProject}, will redirect to your new project page in a few seconds`
}
const SubmissionSection = ({ classes, history, projectData, projectId, pledges, commitTime }) => {
  const [uploads, setUploads] = useState({})
  const { account, openSnackBar, prices } = useContext(FundingContext)
  const { projectAge, projectAssets, manifest } = projectData
  const amountsPledged = useMemo(() => getAmountsPledged(pledges), [pledges, projectId])
  const numberOfBackers = useMemo(() => getNumberOfBackers(pledges), [pledges, projectId])
  const mediaType = useMemo(() => getMediaType(projectAssets), [projectAssets, projectId])
  const mediaUrl = useMemo(() => getMediaSrc(projectAssets), [projectAssets, projectId])
  const createdDate = getDateCreated(projectAge)
  console.log({createdDate, projectAge, projectAssets, manifest, amountsPledged, numberOfBackers, mediaType, mediaUrl})

  return (
    <Formik
      initialValues={{
        title: '',
        subtitle: '',
        creator: '',
        repo: '',
        avatar: '',
        video: '',
        goal: '',
        goalToken: '',
        isPlaying: false,
        description: '',
        commitTime: 24
      }}
      onSubmit={async (values, { resetForm }) => {
        const { title, commitTime } = values
        const manifest = createJSON(values)
        const contentHash = await uploadFilesToIpfs(uploads, manifest)
        const args = [title, contentHash, account, 0, hoursToSeconds(commitTime), ZERO_ADDRESS]
        addProject(...args)
          .estimateGas({ from: account })
          .then(async gas => {
            addProject(...args)
              .send({ from: account, gas: gas + 100 })
              .then(res => {
                // upload to gateway
                uploadFilesToIpfs(uploads, manifest, true)
                pinToGateway(contentHash)
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
        const { goalToken, goal } = values
        const usdValue = convertTokenAmountUsd(goalToken, goal, prices)
        //start project view

        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {manifest && <div className={firstHalf}>
              <div className={classnames(classes.breadCrumb, fullWidth)}>
                {'All projects > title here'}
              </div>
              <Typography className={classes.projectTitle} component="h2" gutterBottom>
                {manifest && manifest.title}
              </Typography>
              <Typography className={classes.projectSubTitle} component="h2" gutterBottom>
                {manifest && manifest.subtitle}
              </Typography>
              <TextDisplay
                name="Contact Person"
                text={manifest.creator}
                rootClass={classes.contact}
                textClass={classes.halfText}
              />
              <TextDisplay
                name="Profile created on"
                text={createdDate}
                rootClass={classes.created}
                textClass={classes.halfText}
              />
              <div className={classes.chatRoom}>
                <Icon name="oneOnOneChat" />
                <div className={classes.chatText}>{`Join ${manifest.chatRoom}`}</div>
              </div>
              <div className={classes.chatRoom}>
                <Icon name="boxArrow" />
                <div className={classes.chatText}>{manifest.code}</div>
              </div>
              <TextDisplay
                name="Full description"
                text={manifest.description}
                isMarkdown={true}
              />
              <TextDisplay
                name="Commit time (hours)"
                text={commitTime}
              />
            </div>}
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
                label="Token"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.goalToken}
              />
              <StatusTextField
                className={fullWidth}
                isRequired={true}
                idFor="goal"
                name="goal"
                label="Enter your funding goal"
                placeholder="Enter your funding goal"
                bottomLeftLabel={usdValue}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.goal || ''}
              />
              <input
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

function FundProject({ classes, match, history, projectAddedEvents, pledges, profile }) {
  const projectId = match.params.id
  const projectData = useProjectData(projectId, projectAddedEvents)
  const commitTime = convertToHours(profile[0].commitTime)
  return (
    <div className={classes.root}>
      <SubmissionSection
        classes={classes}
        history={history}
        projectData={projectData}
        projectId={projectId}
        pledges={pledges}
        commitTime={commitTime}
      />
    </div>
  )
}

const StyledProject = withStyles(styles)(FundProject)
export default withDatabase(withObservables(['match'], ({ database, match }) => ({
  profile: database.collections.get('profiles').query(
    Q.where('id_profile', match.params.id)
  ).observe(),
  transfers: database.collections.get('lp_events').query(
    Q.where('event', 'Transfer')
  ).observe(),
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe(),
  pledges: database.collections.get('pledges').query(
    Q.where('intended_project', match.params.id)
  ).observe()
}))(StyledProject))
