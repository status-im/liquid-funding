import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Formik } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { FundingContext } from '../../context'
import TextDisplay from '../base/TextDisplay'
import Icon from '../base/icons/IconByName'
import { convertTokenAmountUsd, formatPercent } from '../../utils/prices'
import { getAmountFromPledgesInfo } from '../../utils/pledges'
import { useProjectData } from './hooks'
import { getMediaType, getMediaSrc, formatProjectId } from '../../utils/project'
import { getDateCreated } from '../../utils/dates'
import { toBN } from '../../utils/conversions'
import { getTokenLabel, getTokenByAddress } from '../../utils/currencies'
import MediaView from '../base/MediaView'
import StatusTextField from '../base/TextField'
import { getProfileById, pledgeLifetimeReceived } from './queries'
import styles from './styles/FundProject'
import Loading from '../base/Loading'
import BreadCrumb from '../base/BreadCrumb'
import FundStepper from './FundStepper'


const { addGiverAndDonate } = LiquidPledging.methods

const NOT_SUBMITTED = 'Not Submitted'
const SUBMITTED = 'Submitted'
const CONFIRMED = 'Confirmed'

const useStyles = makeStyles(styles)
const getProjectId = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return idProject
}
const addProjectSucessMsg = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return `Project created with ID of ${idProject}, will redirect to your new project page in a few seconds`
}
const STEPS = ['Connect', 'Authorize Amount', 'Fund', 'Confirmation']
function stepperProgress(values, projectData, submissionState) {
  console.log({values, projectData})
  if (submissionState === CONFIRMED) return 4
  if (submissionState === SUBMITTED) return 3
  if (!projectData.account) return 0
  const { manifest: { goalToken }, authorization } = projectData
  const { amount } = values
  const { chainReadibleFn } = getTokenByAddress(goalToken)
  const weiAmount = amount ? chainReadibleFn(amount) : '0'
  const isAuthorized = toBN(authorization).gte(toBN(weiAmount))
  if (!isAuthorized) return 1
  return 2
}
const optimisticUpdate = (client, pledgesInfo, weiAmount) => {
  const { __typename } = pledgesInfo
  const updatedLifetimeReceived = toBN(weiAmount).add(toBN(pledgesInfo.lifetimeReceived)).toString()
  const id = `${__typename}:${pledgesInfo.id}`
  client.writeFragment({
    id,
    fragment: pledgeLifetimeReceived,
    data: {
      lifetimeReceived: updatedLifetimeReceived,
      __typename
    }
  })
}
const SubmissionSection = ({ classes, projectData, projectId, profileData, startPolling, client }) => {
  const { account, enableEthereum, openSnackBar, prices } = useContext(FundingContext)
  const [submissionState, setSubmissionState] = useState(NOT_SUBMITTED)
  const { projectAge, projectAssets, manifest } = projectData
  const { pledgesInfos, projectInfo } = profileData
  const pledgesInfo = pledgesInfos[0]
  const tokenLabel = getTokenLabel(projectInfo.goalToken)
  const totalPledged = getAmountFromPledgesInfo(pledgesInfo)
  const isVideo = useMemo(() => getMediaType(projectAssets), [projectAssets, projectId])
  const mediaUrl = useMemo(() => getMediaSrc(projectAssets), [projectAssets, projectId])
  const createdDate = getDateCreated(projectAge)
  const percentToGoal = manifest ? formatPercent(Number(totalPledged) / Number(manifest.goal)) : formatPercent(0)
  const isCreator = projectData.creator === account
  return (
    <Formik
      initialValues={{
        amount: '',
      }}
      onSubmit={async (values, { resetForm }) => {
        const activeStep = stepperProgress(values, projectData, submissionState)
        if (!activeStep) return enableEthereum()
        const { amount } = values
        const { goalToken } = manifest
        const { chainReadibleFn } = getTokenByAddress(goalToken)
        const userAccount = account ? account : await enableEthereum()
        const weiAmount = chainReadibleFn(amount)
        const args = [projectId, userAccount, goalToken, weiAmount]
        const toSend = addGiverAndDonate(...args)
        const estimatedGas = await toSend.estimateGas()
        toSend
          .send({gas: estimatedGas + 100})
          .on('transactionHash', (hash) => {
            optimisticUpdate(client, pledgesInfo, weiAmount)
            setSubmissionState(SUBMITTED)
            openSnackBar('success', `Submitted funding request to chain. TX Hash: ${hash}`)
          })
          .then(async res => {
            console.log({res})
            startPolling(10000)
            setSubmissionState(CONFIRMED)
            openSnackBar('success', 'Funding Confirmed')
          })
          .catch(e => {
            openSnackBar('error', 'An error has occured')
            console.log({e})
          })
          .finally(() => {
            client.resetStore()
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
      }) => {
        const { firstHalf, secondHalf, fullWidth } = classes
        const usdValue = manifest ? convertTokenAmountUsd(manifest.goalToken, values.amount, prices) : 0
        const activeStep = stepperProgress(values, projectData, submissionState)

        return (
          <form onSubmit={handleSubmit} className={classes.submissionRoot}>
            {manifest && <div className={classnames(firstHalf)}>
              <BreadCrumb
                className={fullWidth}
                trail={[manifest.title]}
              />
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
              <MediaView className={classes.fullWidth} isVideo={isVideo} source={mediaUrl} imgClass={classnames(classes.imgClass)} />
              <TextDisplay
                name="Full description"
                text={manifest.description}
                isMarkdown={true}
              />
            </div>}
            {manifest && <div className={classnames(secondHalf)}>
              <div className={classes.edit}>{isCreator ? 'Edit' : ''}</div>
              <Typography className={classes.projectTitle} component="h2" gutterBottom>
                {`${totalPledged.toLocaleString()} ${tokenLabel}`} pledged
              </Typography>
              <Typography className={classnames(classes.fullWidth, classes.goal)}>
                {`${percentToGoal} of ${Number(manifest.goal).toLocaleString()} goal`}
              </Typography>
              <Typography className={classnames(classes.fullWidth, classes.usdText)}>
                {`${totalPledged ? convertTokenAmountUsd(manifest.goalToken, totalPledged, prices) : '$0'} of ${convertTokenAmountUsd(manifest.goalToken, manifest.goal, prices)} USD`}
              </Typography>
              {!!activeStep && <div className={classnames(fullWidth, classes.amount)}>
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
              </div>}
              <Button type="submit" color="primary" variant="contained" className={classnames(classes.formButton)}>{STEPS[activeStep]}</Button>
              <FundStepper steps={STEPS} activeStep={activeStep} />
            </div>}
          </form>
        )
      }
      }
    </Formik>
  )
}

function FundProject({ match, history }) {
  const projectId = match.params.id
  const classes = useStyles()
  const { loading, error, data, stopPolling, startPolling, client } = useQuery(getProfileById, {
    variables: { id: formatProjectId(projectId) }
  });
  const projectData = useProjectData(projectId, data)

  useEffect(() => {
    stopPolling()
  }, [data])

  if (loading) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
  if(!data.profile) return <Typography className={classes.noProject}>Project Not Found</Typography>

  return (
    <div className={classes.root}>
      <SubmissionSection
        classes={classes}
        client={client}
        history={history}
        projectData={projectData}
        projectId={projectId}
        profileData={data.profile}
        startPolling={startPolling}
      />
    </div>
  )
}

export default FundProject
