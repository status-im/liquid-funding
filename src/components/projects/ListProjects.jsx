import React, { Fragment, useContext, useState } from 'react'
import useWindowSize from '@rehooks/window-size'
import { Link } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'
import Fab from '@material-ui/core/Fab'
import Button from '@material-ui/core/Button'
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
import ProjectsHeader from './ProjectsHeader'

const isOdd = num => num % 2
function FundingDetail({ classes, pledgesInfos, goal, goalToken, cellStyling }) {
  const { headerDetails, leftAlign } = classes
  const { currencies, prices } = useContext(FundingContext)
  const windowSize = useWindowSize()
  const isSmall = windowSize.innerWidth < 800
  const largeStyle = classnames(cellStyling, headerDetails, leftAlign)
  const smallStyle = classnames(cellStyling)
  if (!currencies) return (
    <div className={isSmall ? smallStyle : largeStyle}>
      <Typography>Loading...</Typography>
    </div>
  )
  const pledgeInfo = pledgesInfos.find(p => p.token.toUpperCase() === goalToken.toUpperCase())
  const lifetimeReceived = pledgeInfo ? pledgeInfo.lifetimeReceived : '0'
  const lifetimeHumanReadible = getAmountFromWei(goalToken, lifetimeReceived, currencies)
  const fundedPercent = percentToGoal(lifetimeHumanReadible, goal)
  const goalAmount = Number(goal).toLocaleString()
  const tokenLabel = getTokenLabel(goalToken, currencies)
  const topText = `${fundedPercent} of ${goalAmount}${tokenLabel}`
  const usdValue = convertTokenAmountUsd(goalToken, lifetimeHumanReadible, prices, currencies)
  return (
    <div className={isSmall ? smallStyle : largeStyle}>
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

function TableRows({ profiles, classes }) {
  const { cellText, cellColor, nameSpacer } = classes
  return (
    <Fragment>
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
              <Typography className={classnames(classes.green, classes.px15)}>Read more</Typography>
            </Link>
          </Fragment>
        )
      })}
    </Fragment>
  )
}

function TableCards({ profiles, classes }) {
  const { cardText } = classes
  return (
    <Fragment>
      {profiles.map((profile, i) => {
        const { id, profileId, projectInfo: { title, subtitle, goal, goalToken, creator }, pledgesInfos } = profile
        const cellStyling = isOdd(i) ? classnames(cardText) : classnames(cardText, classes.cellColor)
        const lightText = classnames(cellStyling, classes.cardLightText)
        const profileUrl = `/fund-project/${profileId}`
        return (
          <Fragment key={id}>
            <Typography className={classnames(cellStyling, classes.cardTitle)}>{title}</Typography>
            <Typography className={classnames(cellStyling, classes.cardSubTitle)}>{subtitle}</Typography>
            <Typography className={lightText}>{`By ${creator}`}</Typography>
            <FundingDetail classes={classes} pledgesInfos={pledgesInfos} goal={goal} goalToken={goalToken} cellStyling={classnames(lightText, classes.cardAmount)} />
            <Link to={profileUrl} className={classnames(classes.cardLink, cellStyling, classes.cardMore, classes.paddingNone)}>
              <Typography className={classnames(lightText, classes.paddingNone)}>Read more</Typography>
            </Link>
          </Fragment>
        )

      })}
    </Fragment>
  )
}

const OFFSET = 5
function ListProjects() {
  const classes = useStyles()
  const [offset, setOffset] = useState(0)
  const windowSize = useWindowSize()
  const { loading, error, data, fetchMore } = useQuery(
    getProjects,
    {
      variables: {
        offset,
        limit: 5,
        orderDirection: 'desc'
      }
    }
  )
  if (loading) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
  const { profiles } = data
  const { innerWidth } = windowSize
  const isSmall = innerWidth < 800
  const fabStyle = isSmall ? classnames(classes.fabLink, classes.fabSmall) : classes.fabLink
  const titleStyle = isSmall ? classes.tableTitleSmall : classes.tableTitle
  return (
    <div className={classes.main}>
      <ProjectsHeader className={titleStyle} />
      {!isSmall && <TableHeader classes={classes} />}
      {!isSmall ? <TableRows profiles={profiles} classes={classes} /> : <TableCards profiles={profiles} classes={classes} />}
      <Divider className={classes.divider} />
      {!!offset && <Button onClick={() => {
        fetchMore({
          variables: {
            offset: offset - OFFSET
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return Object.assign({}, prev, {
              profiles: [...fetchMoreResult.profiles]
            });
          }
        })
        setOffset(offset-OFFSET)
      }} className={classnames(classes.previousButton, classes.green)}>{'< Previous'}</Button>}
      {profiles.length === OFFSET && <Button onClick={() => {
        fetchMore({
          variables: {
            offset: offset + OFFSET
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            return Object.assign({}, prev, {
              profiles: [...fetchMoreResult.profiles]
            });
          }
        })
        setOffset(offset+OFFSET)
      }} className={classnames(classes.nextButton, classes.green)}>{'Next >'}</Button>}
      <Link to={`/create-project`} className={fabStyle}>
        <Fab className={classes.fab}>
          <AddIcon className={classes.addIcon}/>
        </Fab>
        <Typography className={classes.fabText}>Assemble a project</Typography>
      </Link>
    </div>
  )
}

export default ListProjects
