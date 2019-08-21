import React, { Fragment, useContext } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import classnames from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import styles from './styles/ListProjects'
import { getProjects } from './queries'
import Loading from '../base/Loading'
import { convertTokenAmountUsd, percentToGoal } from '../../utils/prices'
import { getTokenLabel } from '../../utils/currencies'
import { getAmountFromWei } from '../../utils/pledges'
import { getDateFromTimestamp } from '../../utils/dates'
import { FundingContext } from '../../context'

function FundingDetail({ classes, pledgesInfos, goal, goalToken }) {
  const { cellText, headerDetails, centerText } = classes
  const { prices } = useContext(FundingContext)
  const pledgeInfo = pledgesInfos.find(p => p.token.toUpperCase() === goalToken.toUpperCase())
  const { lifetimeReceived } = pledgeInfo
  const lifetimeHumanReadible = getAmountFromWei(goalToken, lifetimeReceived)
  const fundedPercent = percentToGoal(lifetimeHumanReadible, goal)
  const goalAmount = Number(goal).toLocaleString()
  const tokenLabel = getTokenLabel(goalToken)
  const topText = `${fundedPercent} of ${goalAmount}${tokenLabel}`
  const usdValue = convertTokenAmountUsd(goalToken, lifetimeHumanReadible, prices)
  return (
    <div className={classnames(cellText, headerDetails, centerText)}>
      <Typography>{topText}</Typography>
      <Typography className={classes.usdValue}>{`${usdValue} USD`}</Typography>
    </div>
  )
}

function Cell({ spacerClass, textClass, text }) {
  return (
    <Fragment>
      <div className={spacerClass} />
      <Typography className={textClass}>{text}</Typography>
    </Fragment>
  )
}

function ListProjects({ classes }) {
  const { tableHeader, cellText, cellColor, nameSpacer } = classes
  const { loading, error, data } = useQuery(getProjects)
  if (loading) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
  console.log({classes, loading, error, data})
  const { profiles } = data
  return (
    <div className={classes.main}>
      <Typography className={classnames(classes.title, classes.fullWidth)}>
        Liquid Funding
      </Typography>
      <Typography className={classnames(classes.subTitle, classes.fullWidth)}>
        Fund. Build. Together.
      </Typography>
      <Typography className={classes.tableTitle}>
        All Projects
      </Typography>
      <Cell spacerClass={nameSpacer} textClass={classnames(tableHeader, classes.headerName)} text="Name" />
      <Typography className={classnames(tableHeader, classes.headerDescription)}>Description</Typography>
      <Typography className={classnames(tableHeader, classes.headerDetails)}>Funding details</Typography>
      <Typography className={classnames(tableHeader, classes.headerContact)}>Contact person</Typography>
      <Typography className={classnames(tableHeader, classes.dateCreated)}>Date created</Typography>
      {profiles.map((profile, i) => {
        const { id, profileId, projectInfo: { title, subtitle, goal, goalToken, creator, creationTime }, pledgesInfos } = profile
        console.log({i, profile})
        const creationDate = getDateFromTimestamp(creationTime)
        return (
          <Fragment key={id}>
            <Cell spacerClass={classnames(nameSpacer, cellColor)} textClass={classnames(classes.headerName, cellText)} text={title} />
            <Typography className={classnames(classes.headerDescription, cellText, classes.cellDescription)}>{subtitle}</Typography>
            <FundingDetail classes={classes} pledgesInfos={pledgesInfos} goal={goal} goalToken={goalToken} />
            <Typography className={classnames(classes.headerContact, cellText, classes.cellDescription)}>{creator}</Typography>
            <Typography className={classnames(classes.dateCreated, cellText, classes.cellDescription)}>{creationDate}</Typography>
            <Link to={`/fund-project/${profileId}`} className={classnames(classes.readMore, cellText)}>
              <Typography className={classnames(classes.blue, classes.px15)}>Read more</Typography>
            </Link>
          </Fragment>
        )
      })}
    </div>
  )
}

export default withStyles(styles)(ListProjects)
