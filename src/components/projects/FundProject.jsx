import React, { useContext, useMemo } from 'react'
import { Formik } from 'formik'
import classnames from 'classnames'
import { useQuery } from '@apollo/react-hooks'
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
import { getMediaType, getMediaSrc, formatProjectId } from '../../utils/project'
import { getDateCreated, convertToHours } from '../../utils/dates'
import { getTokenLabel, getTokenByAddress } from '../../utils/currencies'
import MediaView from '../base/MediaView'
import StatusTextField from '../base/TextField'
import { getProfileById } from './queries'
import styles from './styles/FundProject'

const { addGiverAndDonate } = LiquidPledging.methods

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
              <MediaView className={classes.fullWidth} isVideo={isVideo} source={mediaUrl} imgClass={classes.imgClass} />
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

function FundProject({ classes, match, history, projectAddedEvents, pledges }) {
  const projectId = match.params.id
  const { loading, error, data } = useQuery(getProfileById, {
    variables: { id: formatProjectId(projectId) }
  });
  const projectData = useProjectData(projectId, projectAddedEvents, data)

  if (loading) return <div>Loading</div>
  if (error) return <div>{JSON.stringify(error)}</div>
  if(!data.profile) return <Typography className={classes.noProject}>Project Not Found</Typography>

  console.log({loading,error,data})

  const commitTime = convertToHours(data.profile.commitTime)
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
