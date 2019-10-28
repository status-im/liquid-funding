import React, { useContext, useState, useMemo, useEffect } from 'react'
import { Formik } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import SwapProxy from '../../embarkArtifacts/contracts/SwapProxy'
import Typography from '@material-ui/core/Typography'
import { FundingContext } from '../../context'
import TextDisplay from '../base/TextDisplay'
import Icon from '../base/icons/IconByName'
import * as Yup from 'yup'
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
import CurrencySelect from '../base/CurrencySelect'
import Loading from '../base/Loading'
import BreadCrumb from '../base/BreadCrumb'
import FundStepper from './FundStepper'
import StatusButton from '../base/Button'
import { errorStrings } from '../../constants/errors'

const { REQUIRED, NOT_NUMBER } = errorStrings
const schema = Yup.object().shape({
  amount: Yup.number().typeError(NOT_NUMBER).required(REQUIRED).positive()
})
const { addGiverAndDonate } = LiquidPledging.methods
const { fundWithETH, fundWithToken } = SwapProxy.methods

const NOT_SUBMITTED = 'Not Submitted'
const AUTHORIZATION_SUBMITTED = 'Authorization Submitted'
const SUBMITTED = 'Submitted'
const CONFIRMED = 'Confirmed'
const APPROVED = 'Approved'
const NOT_CONNECTED = 0
const NOT_APPROVED = 1
const IS_APPROVED = 2
const IS_SUBMITTED = 3
const IS_CONFIRMED = 4
const IS_ETH = 'ETH'

const useStyles = makeStyles(styles)
const getProjectId = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return idProject
}
const addProjectSucessMsg = response => {
  const { events: { ProjectAdded: { returnValues: { idProject } } } } = response
  return `Project created with ID of ${idProject}, will redirect to your new project page in a few seconds`
}
const STEPS = ['Connect', 'Authorize Amount', 'Fund', 'Confirm']
const buttonText = ['Connect', 'Authorize Amount', 'Fund', 'Submitted', 'Confirmed']
function stepperProgress(values, projectData, submissionState, currencies) {
  const { amount, fundToken } = values
  if (submissionState === CONFIRMED) return IS_CONFIRMED
  if (submissionState === AUTHORIZATION_SUBMITTED) return NOT_APPROVED
  if (submissionState === SUBMITTED) return IS_SUBMITTED
  if (submissionState === APPROVED || fundToken === IS_ETH) return IS_APPROVED
  if (!projectData.account) return NOT_CONNECTED
  const { manifest: { goalToken }, authorization } = projectData
  const { chainReadibleFn } = getTokenByAddress(goalToken, currencies)
  const sanitizedAmount = amount.replace(/\D/g,'')
  const weiAmount = sanitizedAmount ? chainReadibleFn(sanitizedAmount) : '0'
  const isAuthorized = Number(authorization) >= Number(weiAmount)
  if (!isAuthorized) return NOT_APPROVED
  return IS_APPROVED
}

function generateSend(projectId, goalToken, fundToken, amount, account) {
  if (fundToken === IS_ETH) {
    return fundWithETH(projectId, goalToken)
      .send({from: account, value: amount})
  }
  if (fundToken.toLowerCase() === goalToken.toLowerCase()) {
    return addGiverAndDonate(projectId, goalToken, amount)
      .send({from: account})
  }
  return fundWithToken(projectId, fundToken, amount, goalToken)
    .send({from: account})
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
  const { account, currencies, enableEthereum, openSnackBar, prices } = useContext(FundingContext)
  const [submissionState, setSubmissionState] = useState(NOT_SUBMITTED)
  const { projectAge, projectAssets, manifest } = projectData
  const { pledgesInfos, projectInfo } = profileData
  const pledgesInfo = pledgesInfos[0]
  const tokenLabel = currencies ? getTokenLabel(projectInfo.goalToken, currencies) : ''
  const totalPledged = currencies ? getAmountFromPledgesInfo(pledgesInfo, currencies) : 0
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
      validate={values => {
        const activeStep = stepperProgress(values, projectData, submissionState, currencies)
        if (!activeStep) return
        return schema.validate(values)
          .catch(function(err) {
            let errors = {}
            const { errors: errs, params: { path } } = err
            errors[path] = errs[0]
            throw errors
          })
      }}
      onSubmit={async (values, { resetForm }) => {
        const activeStep = stepperProgress(values, projectData, submissionState, currencies)
        if (!activeStep) return enableEthereum()
        const { amount, fundToken } = values
        const { goalToken } = manifest
        const { chainReadibleFn, setAllowance } = getTokenByAddress(goalToken, currencies)
        const userAccount = account ? account : await enableEthereum()
        const weiAmount = chainReadibleFn(amount)
        if (activeStep === NOT_APPROVED) {
          const toSend = goalToken === fundToken ? setAllowance(weiAmount, LiquidPledging) : setAllowance(weiAmount)
          setSubmissionState(AUTHORIZATION_SUBMITTED)
          return toSend
            .send({ from: account })
            .then(async res => {
              console.log({res})
              setSubmissionState(APPROVED)
            })
            .catch(e => console.log({e})).finally(() => resetForm())
        }

        const send = generateSend(projectId, goalToken, fundToken, weiAmount, userAccount)
        send
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
          })

        console.log({amount, getProjectId, addProjectSucessMsg, account, openSnackBar})
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
      }) => {
        const { firstHalf, secondHalf, fullWidth } = classes
        const usdValue = manifest ? convertTokenAmountUsd(values.fundToken || manifest.goalToken, values.amount, prices, currencies) : 0
        const activeStep = stepperProgress(values, projectData, submissionState, currencies)
        const showSpinner = activeStep === IS_SUBMITTED || submissionState === AUTHORIZATION_SUBMITTED
        const disableButton = submissionState === AUTHORIZATION_SUBMITTED || activeStep >= IS_SUBMITTED

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
                  <div className={classes.chatText}>{`Join ${manifest.chatRoom.toLowerCase()}`}</div>
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
                {`${totalPledged ? convertTokenAmountUsd(manifest.goalToken, totalPledged, prices, currencies) : '$0'} of ${convertTokenAmountUsd(manifest.goalToken, manifest.goal, prices, currencies)} USD`}
              </Typography>
              {!!activeStep && <div className={classnames(fullWidth, classes.amount)}>
                <CurrencySelect
                  className={classes.amountLayout}
                  InputProps={{
                    classes: {
                      input: classes.textInput
                    }
                  }}
                  id="fundToken"
                  label="Token"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.fundToken}
                />
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
                  errorText={touched.amount && errors.amount}
                  disabled={activeStep >= IS_SUBMITTED}
                  value={values.amount || ''}
                />
                <div className={classes.amountText}>{getTokenLabel(values.fundToken || manifest.goalToken, currencies)}</div>
              </div>}
              <StatusButton
                disabled={disableButton}
                buttonText={buttonText[activeStep]}
                confirmed={activeStep === IS_CONFIRMED}
                loading={showSpinner}
              />
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
  const { currencies } = useContext(FundingContext)
  const { loading, error, data, stopPolling, startPolling, client } = useQuery(getProfileById, {
    variables: { id: formatProjectId(projectId) }
  });
  const projectData = useProjectData(projectId, data)

  useEffect(() => {
    stopPolling()
  }, [data])

  if (loading || !currencies) return <Loading />
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
