import React, { Fragment } from 'react'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from '@apollo/react-hooks'
import { formatProjectId } from '../utils/project'
import { getProfileWithPledges } from './projects/queries'
import { getTokenLabel, getHumanAmountFormatter } from '../utils/currencies'
import { toDecimal } from '../utils/conversions'
import { getDateFromTimestamp } from '../utils/dates'
import Loading from './base/Loading'

const styles = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.8)',
    fontSize: '0.9rem',
  },
  headerStatus: {
    gridColumn: '6 / 12'
  },
  rowStatus: {
    gridColumn: '6 / 12'
  },
  headerAmount: {
    gridColumn: '12 / 18'
  },
  rowAmount: {
    gridColumn: '12 / 18'
  },
  headerId: {
    gridColumn: '18 / 24'
  },
  rowId: {
    gridColumn: '18 / 24'
  },
  headerFunded: {
    gridColumn: '24 / 30'
  },
  rowFunded: {
    gridColumn: '24 / 30'
  },
  headerSelect: {
    gridColumn: '31 / 35'
  },
  select: {
    gridColumn: '35 / 37'
  },
  checkBox: {
    '&:hover': {
      backgroundColor: 'transparent'
    }
  }
})

const useStyles = makeStyles(styles)

function TableHeader() {
  const classes = useStyles()
  const { tableHeader } = classes
  return (
    <Fragment>
      <Typography className={classnames(tableHeader, classes.headerStatus)}>Status</Typography>
      <Typography className={classnames(tableHeader, classes.headerAmount)}>Amount</Typography>
      <Typography className={classnames(tableHeader, classes.headerId)}>Pledge ID</Typography>
      <Typography className={classnames(tableHeader, classes.headerFunded)}>Funded on</Typography>
      <Typography className={classnames(tableHeader, classes.headerSelect)}>Select all</Typography>
      <Checkbox className={classnames(classes.select, classes.checkBox)} color="primary" disableRipple labelPlacement="start" label="start" />
    </Fragment>
  )
}

function TableRow({ pledge, amtFormatter, tokenLabel }) {
  const classes = useStyles()
  const { id, amount, creationTime, pledgeState } = pledge
  return (
    <Fragment>
      <Typography className={classes.rowStatus}>{pledgeState}</Typography>
      <Typography className={classes.rowAmount}>{amtFormatter(amount)} {tokenLabel}</Typography>
      <Typography className={classes.rowId}>{toDecimal(id)}</Typography>
      <Typography className={classes.rowFunded}>{getDateFromTimestamp(creationTime, true)}</Typography>
      <Checkbox className={classnames(classes.select, classes.checkBox)} color="primary" disableRipple />
    </Fragment>
  )
}

function Pledges({ match }) {
  const classes = useStyles()
  const projectId = match.params.id
  const { loading, error, data } = useQuery(getProfileWithPledges, {
    variables: { id: formatProjectId(projectId) }
  });

  console.log({loading, error, data})
  if (loading) return <Loading />
  if (error) return <div>{`Error! ${error.message}`}</div>
  const { pledges, projectInfo: { goalToken } } = data.profile
  const amtFormatter = getHumanAmountFormatter(goalToken)
  const tokenLabel = getTokenLabel(goalToken)

  return (
    <div className={classes.main}>
      <TableHeader />
      {pledges.map(p =>
        <TableRow
          key={p.id}
          pledge={p}
          amtFormatter={amtFormatter}
          tokenLabel={tokenLabel}
        />
      )}
    </div>
  )
}

export default Pledges
