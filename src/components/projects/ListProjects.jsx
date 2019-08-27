import React, { Fragment, useContext } from 'react'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Fab from '@material-ui/core/Fab'
import AddIcon from '@material-ui/icons/Add'
import classnames from 'classnames'
import { useQuery } from '@apollo/react-hooks'
import useStyles from './styles/ListProjects'
import { getProjects } from './queries'
import Loading from '../base/Loading'
import { convertTokenAmountUsd, percentToGoal } from '../../utils/prices'
import { getTokenLabel } from '../../utils/currencies'
import { getAmountFromWei } from '../../utils/pledges'
import { getDateFromTimestamp } from '../../utils/dates'
import { FundingContext } from '../../context'

const isOdd = num => num % 2
function FundingDetail({ classes, pledgesInfos, goal, goalToken, cellStyling }) {
  const { headerDetails, leftAlign } = classes
  const { prices } = useContext(FundingContext)
  const pledgeInfo = pledgesInfos.find(p => p.token.toUpperCase() === goalToken.toUpperCase())
  const lifetimeReceived = pledgeInfo ? pledgeInfo.lifetimeReceived : '0'
  const lifetimeHumanReadible = getAmountFromWei(goalToken, lifetimeReceived)
  const fundedPercent = percentToGoal(lifetimeHumanReadible, goal)
  const goalAmount = Number(goal).toLocaleString()
  const tokenLabel = getTokenLabel(goalToken)
  const topText = `${fundedPercent} of ${goalAmount}${tokenLabel}`
  const usdValue = convertTokenAmountUsd(goalToken, lifetimeHumanReadible, prices)
  return (
    <div className={classnames(cellStyling, headerDetails, leftAlign)}>
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

function TableHeader({ classes }) {
  const { tableHeader, nameSpacer } = classes
  return (
    <Fragment>
      <Cell spacerClass={nameSpacer} textClass={classnames(tableHeader, classes.headerName)} text="Name" />
      <Typography className={classnames(tableHeader, classes.headerDescription)}>Description</Typography>
      <Typography className={classnames(tableHeader, classes.headerDetails)}>Funding details</Typography>
      <Typography className={classnames(tableHeader, classes.headerContact)}>Contact person</Typography>
      <Typography className={classnames(tableHeader, classes.dateCreated)}>Date created</Typography>
    </Fragment>
  )
}

function ListProjects() {
  const classes = useStyles()
  const { cellText, cellColor, nameSpacer } = classes
  const { loading, error, data } = useQuery(getProjects)
  if (loading) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
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
      <TableHeader classes={classes} />
      {profiles.map((profile, i) => {
        const { id, profileId, creationTime, projectInfo: { title, subtitle, goal, goalToken, creator }, pledgesInfos } = profile
        const cellStyling = isOdd(i) ? classnames(cellText) : classnames(cellText, classes.cellColor)
        const spaceClass = isOdd(i) ? nameSpacer : classnames(nameSpacer, cellColor)
        const creationDate = getDateFromTimestamp(creationTime)
        const profileUrl = `/fund-project/${profileId}`
        return (
          <Fragment key={id}>
            <Cell spacerClass={spaceClass} textClass={classnames(classes.headerName, cellStyling)} text={title} />
            <Link to={profileUrl} className={classnames(classes.headerDescription, cellStyling, classes.cellDescription)}>
              <Typography className={classes.px16}>{subtitle}</Typography>
            </Link>
            <FundingDetail classes={classes} pledgesInfos={pledgesInfos} goal={goal} goalToken={goalToken} cellStyling={cellStyling} />
            <Typography className={classnames(classes.headerContact, cellStyling, classes.cellDescription)}>{creator}</Typography>
            <Typography className={classnames(classes.dateCreated, cellStyling, classes.cellDescription)}>{creationDate}</Typography>
            <Link to={profileUrl} className={classnames(classes.readMore, cellStyling)}>
              <Typography className={classnames(classes.blue, classes.px15)}>Read more</Typography>
            </Link>
          </Fragment>
        )
      })}
      <Divider className={classes.divider} />
      <Link to={`/create-project`} className={classes.fabLink}>
        <Fab className={classes.fab}>
          <AddIcon className={classes.addIcon}/>
        </Fab>
        <Typography className={classes.fabText}>Add your own project</Typography>
      </Link>
    </div>
  )
}

export default ListProjects
