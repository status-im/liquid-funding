import React, { useContext, useState, useMemo, useEffect, memo } from 'react'
import { Formik } from 'formik'
import { makeStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import idx from 'idx'
import queryString from 'query-string'
import { useQuery } from '@apollo/react-hooks'
import LiquidPledging from '../../embarkArtifacts/contracts/LiquidPledging'
import SwapProxy from '../../embarkArtifacts/contracts/SwapProxy'
import { Link } from 'react-router-dom'
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
import { getTokenLabel, getTokenByAddress } from '../../utils/currencies'
import MediaView from '../base/MediaView'
import StatusTextField from '../base/TextField'
import { getProfileById } from './queries'
import styles from './styles/FundProject'
import CurrencySelect from '../base/CurrencySelect'
import Loading from '../base/Loading'
import BreadCrumb from '../base/BreadCrumb'
import FundStepper from './FundStepper'
import StatusButton from '../base/Button'
import { errorStrings } from '../../constants/errors'

const { REQUIRED, NOT_NUMBER } = errorStrings
const schema = Yup.object().shape({
  amount: Yup.number().typeError(NOT_NUMBER).required(REQUIRED)
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
async function stepperProgress(values, projectData, submissionState, currencies) {
  if (!values.fundToken) return IS_APPROVED
  const { amount, fundToken } = values
  if (Number(amount) === 0) return NOT_APPROVED
  if (submissionState === CONFIRMED) return IS_CONFIRMED
  if (submissionState === AUTHORIZATION_SUBMITTED) return NOT_APPROVED
  if (submissionState === SUBMITTED) return IS_SUBMITTED
  if (fundToken === IS_ETH) return IS_APPROVED
  if (!projectData.account) return NOT_CONNECTED
  const { chainReadibleFn, getAllowance } = getTokenByAddress(fundToken, currencies)
  const { manifest: { goalToken } } = projectData
  const spender = fundToken.toLowerCase() === goalToken.toLowerCase() ? LiquidPledging._address : SwapProxy._address
  const authorization = await getAllowance(spender)
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

const SubmissionSection = ({ classes, projectData, projectId, profileData, startPolling, client }) => {
  const { account, currencies, enableEthereum, openSnackBar, prices } = useContext(FundingContext)
  const [submissionState, setSubmissionState] = useState(NOT_SUBMITTED)
  const [activeStep, setActiveStep] = useState()
  const [values, setValues] = useState({})
  useEffect(() => {
    async function getProgress() {
      const progress = await stepperProgress(values, projectData, submissionState, currencies)
      setActiveStep(progress)
    }
    getProgress()
  }, [values, projectData, submissionState, currencies])
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
      validate={async values => {
        const activeStep = await stepperProgress(values, projectData, submissionState, currencies)
        if (!activeStep) return
        return schema.validate(values)
          .catch(function(err) {
            let errors = {}
            const { errors: errs, params: { path } } = err
            errors[path] = errs[0]
            throw errors
          })
      }}
      onSubmit={async (values) => {
        const activeStep = await stepperProgress(values, projectData, submissionState, currencies)
        if (!activeStep) return enableEthereum()
        const { amount, fundToken } = values
        const { goalToken } = manifest
        const { chainReadibleFn } = getTokenByAddress(goalToken, currencies)
        const userAccount = account ? account : await enableEthereum()
        const weiAmount = chainReadibleFn(amount)
        if (activeStep === NOT_APPROVED) {
          const { setAllowance } = getTokenByAddress(fundToken, currencies)
          const toSend = goalToken === fundToken ? setAllowance(weiAmount, LiquidPledging) : setAllowance(weiAmount)
          setSubmissionState(AUTHORIZATION_SUBMITTED)
          let estimated
          try {
            estimated = await toSend.estimateGas({ from: account })
          } catch(e) {
            return openSnackBar('error', `${e.message}`)
          }
          return toSend
            .send({ from: account, gas: estimated+100 })
            .on('transactionHash', (hash) => {
              setSubmissionState(AUTHORIZATION_SUBMITTED)
              openSnackBar('success', `Submitted approve request to chain. TX Hash: ${hash}`)
            })
            .then(async res => {
              console.log({res})
              if (Number(amount) !== 0) setSubmissionState(APPROVED)
              else setSubmissionState(NOT_APPROVED)
            })
            .catch(e => console.log({e}))

        }

        const args = [projectId, goalToken, fundToken, weiAmount, userAccount]
        console.log({args})
        generateSend(...args)
          .on('transactionHash', (hash) => {
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
        setValues(values)
        const { firstHalf, secondHalf, fullWidth } = classes
        const usdValue = manifest ? convertTokenAmountUsd(values.fundToken || manifest.goalToken, values.amount, prices, currencies) : 0
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
              <Link to={`/update-project/${projectId}`} className={classes.link}>
                <div className={classes.edit}>{isCreator ? 'Edit' : ''}</div>
              </Link>
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
              {activeStep !== IS_CONFIRMED && <StatusButton
                disabled={disableButton}
                buttonText={disableButton ? 'Submitted' : buttonText[activeStep]}
                confirmed={activeStep === IS_CONFIRMED}
                loading={showSpinner}
              />}
              <FundStepper steps={STEPS} activeStep={activeStep} />
            </div>}
          </form>
        )
      }
      }
    </Formik>
  )
}

function FundProject({ match, history, location: { search } }) {
  const projectId = match.params.id
  const classes = useStyles()
  const [queryParams, setQueryParams] = useState({})
  const { account, currencies } = useContext(FundingContext)
  const { loading, error, data, stopPolling, startPolling, client } = useQuery(getProfileById, {
    variables: { id: formatProjectId(projectId) }
  });
  const projectData = useProjectData(projectId, data)

  useEffect(() => {
    stopPolling()
  }, [data])

  useEffect(() => {
    const queryParams = queryString.parse(search)
    if (queryParams.new) {
      startPolling(3000)
      setQueryParams({ ...queryParams })
    }

    if (data && data.profile) {
      stopPolling()
      return setQueryParams({})
    }
  }, [data && data.profile])

  if (loading || !currencies || queryParams.new) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
  if(!data.profile) return <Typography className={classes.noProject}>Project Not Found</Typography>
  const isCreator = projectData.creator === account

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
      {!!Number(idx(data, _ => _.profile.pledgesInfos[0].lifetimeReceived)) && isCreator && <div className={classes.pledgesLink}>
        <Typography>This project received pledges. You have funds available to withdraw.</Typography>
        <Link to={`/pledges/${projectId}`} className={classes.link}>
          <StatusButton buttonText="View Pledges" />
        </Link>
      </div>}
    </div>
  )
}

export default memo(FundProject)
