import React, { Fragment } from 'react'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from '@apollo/react-hooks'
import { formatProjectId } from '../utils/project'
import { getProfileWithPledges } from './projects/queries'
import Loading from './base/Loading'

const styles = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem 4rem 3rem 0.5fr 1fr 0.3fr'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.8)',
    fontSize: '0.9rem',
  },
  headerStatus: {
    gridColumn: '3 / 12'
  },
  rowStatus: {
    gridColumn: '3 / 12'
  },
  headerAmount: {
    gridColumn: '12 / 30'
  },
  rowAmount: {
    gridColumn: '12 / 30'
  },
  headerId: {
    gridColumn: '30 / 35'
  },
  headerFunded: {
    gridColumn: '35 / 40'
  },
  headerSelect: {
    gridColumn: '40 / 44'
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
    </Fragment>
  )
}

function TableRow({ pledge }) {
  const classes = useStyles()
  return (
    <Fragment>
      <div className={classes.rowStatus}>{pledge.pledgeState}</div>
      <div className={classes.rowAmount}>{pledge.amount}</div>
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
  const { pledges } = data.profile

  return (
    <div className={classes.main}>
      <TableHeader />
      {pledges.map(p => <TableRow key={p.id} pledge={p} />)}
    </div>
  )
}

export default Pledges
