import React, { useContext, useMemo } from 'react'
import { Formik } from 'formik'
import classnames from 'classnames'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import { FundingContext } from '../../context'
import TextDisplay from '../base/TextDisplay'
import Icon from '../base/icons/IconByName'
import { convertTokenAmountUsd } from '../../utils/prices'
import { getAmountsPledged } from '../../utils/pledges'
import { useProjectData } from './hooks'
import { getMediaType, getMediaSrc } from '../../utils/project'
import { getDateCreated, convertToHours } from '../../utils/dates'
import { getTokenLabel, getTokenByAddress } from '../../utils/currencies'
import MediaView from '../base/MediaView'
import StatusTextField from '../base/TextField'

const { addGiverAndDonate } = LiquidPledging.methods


const styles = theme => ({
  adornmentText: {
    cursor: 'pointer',
    color: '#4360DF'
  },
  amount: {
    marginTop: '3rem',
    display: 'grid'
  },
  amountLayout: {
    gridColumnStart: 1,
    gridColumnEnd: 5
  },
  amountText: {
    gridColumnStart: 6,
    alignSelf: 'center',
    color: '#939BA1'
  },
  amountInput: {
    textAlign: 'right'
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
  edit: {
    gridColumnStart: 12,
    color: '#4360DF',
    fontSize: '15px'
  },
  formControl: {
    gridColumnStart: '6'
  },
  formButton: {
    gridColumnStart: '1',
    gridColumnEnd: '13',
    height: '50px',
    marginTop: '1.5rem',
    borderRadius: '8px'
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
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridColumnStart: 1,
    gridColumnEnd: 13,
    justifyItems: 'start',
    gridAutoFlow: 'column',
    paddingLeft: '5px'
  },
  chatLink: {
    gridColumnStart: 3,
    gridColumnEnd: 13,
    textDecoration: 'none'
  },
  halfText: {
    gridColumnStart: 4
  },
  chatRoomIcon: {
    justifySelf: 'auto'
  },
  chatText: {
    marginTop: '15px',
    color: '#4360DF'
  },
  secondHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '9rem',
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
  usdText: {
    color: '#939BA1',
    fontSize: '12px'
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


const getProjectId = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return idProject
}
const addProjectSucessMsg = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return `Project created with ID of ${idProject}, will redirect to your new project page in a few seconds`
}
const SubmissionSection = ({ classes, projectData, projectId, pledges, commitTime }) => {
  const { account, openSnackBar, prices } = useContext(FundingContext)
  const { projectAge, projectAssets, manifest } = projectData
  const amountsPledged = useMemo(() => getAmountsPledged(pledges), [pledges, projectId])
  const isVideo = useMemo(() => getMediaType(projectAssets), [projectAssets, projectId])
  const mediaUrl = useMemo(() => getMediaSrc(projectAssets), [projectAssets, projectId])
  const createdDate = getDateCreated(projectAge)
  const totalPledged = amountsPledged[0] ? amountsPledged[0][1] : 0
  const percentToGoal = manifest ? (Number(totalPledged) / Number(manifest.goal)) * 100 : 0
  const isCreator = projectData.creator === account

  return (
    <Formik
      initialValues={{
        amount: '',
      }}
      onSubmit={async (values, { resetForm }) => {
        const { amount } = values
        const { goalToken } = manifest
        const { chainReadibleFn } = getTokenByAddress(goalToken)
        const args = [projectId, account, goalToken, chainReadibleFn(amount)]
        const toSend = addGiverAndDonate(...args)
        const estimatedGas = await toSend.estimateGas()
        console.log({estimatedGas})

        toSend
          .send({gas: estimatedGas + 100})
          .then(async res => {
            console.log({res})
            openSnackBar('success', 'Successfully funded project')
          })
          .catch(e => {
            openSnackBar('error', 'An error has occured with the transaction')
            console.log({e})
          })
          .finally(() => {
            openSnackBar('success', 'project backed!')
            resetForm()
          })

        console.log({amount, resetForm, getProjectId, addProjectSucessMsg, account, openSnackBar})
      }}
    >
      {({
        values,
        errors: _errors,
        touched: _touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting
      }) => {
        const { firstHalf, secondHalf, fullWidth } = classes
        const usdValue = manifest ? convertTokenAmountUsd(manifest.goalToken, values.amount, prices) : 0
        //start project view

        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {manifest && <div className={firstHalf}>
              <div className={classnames(classes.breadCrumb, fullWidth)}>
                {`All projects > ${manifest.title}`}
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
                <a className={classes.chatLink} href={`https://get.status.im/chat/public/${manifest.chatRoom.replace('#', '')}`}>
                  <div className={classes.chatText}>{`Join ${manifest.chatRoom}`}</div>
                </a>
              </div>
              <div className={classes.chatRoom}>
                <Icon name="boxArrow" />
                <a className={classes.chatLink} href={manifest.code}>
                  <div className={classes.chatText}>{manifest.code}</div>
                </a>
              </div>
              <MediaView className={classes.fullWidth} isVideo={isVideo} source={mediaUrl} />
              <TextDisplay
                name="Full description"
                text={manifest.description}
                isMarkdown={true}
              />
              <TextDisplay
                name="Commit time (hours)"
                text={commitTime.toString()}
              />
            </div>}
            {manifest && <div className={secondHalf}>
              <div className={classes.edit}>{isCreator ? 'Edit' : ''}</div>
              <Typography className={classes.projectTitle} component="h2" gutterBottom>
                {`${totalPledged.toLocaleString()} ${amountsPledged[0] ? amountsPledged[0][0] : ''}`} pledged
              </Typography>
              <Typography className={classes.fullWidth}>
                {`${percentToGoal}% of ${Number(manifest.goal).toLocaleString()} goal`}
              </Typography>
              <Typography className={classnames(classes.fullWidth, classes.usdText)}>
                {`${totalPledged ? convertTokenAmountUsd(manifest.goalToken, totalPledged, prices) : '$0'} of ${convertTokenAmountUsd(manifest.goalToken, manifest.goal, prices)} USD`}
              </Typography>
              <div className={classnames(fullWidth, classes.amount)}>
                <StatusTextField
                  className={classes.amountLayout}
                  inputClass={classes.amountInput}
                  isRequired={true}
                  idFor="amount"
                  name="amount"
                  placeholder="Enter amount"
                  bottomRightLabel={usdValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.amount || ''}
                />
                <div className={classes.amountText}>{getTokenLabel(manifest.goalToken)}</div>
              </div>
              <Button type="submit" color="primary" variant="contained" className={classnames(classes.formButton)}>{isSubmitting ? 'Ethereum Submission In Progress' : 'Fund'}</Button>
            </div>}
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
    Q.or(
      Q.where('intended_project', match.params.id),
      Q.where('owner_id', match.params.id)
    )
  ).observe()
}))(StyledProject))
