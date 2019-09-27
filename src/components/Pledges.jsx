import React, { Fragment } from 'react'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

const styles = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem 4rem 3rem 0.5fr 1fr 0.3fr'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.8)',
    fontSize: '0.9rem',
    gridRow: '4 / 5'
  },
  headerStatus: {
    gridColumn: '3 / 12'
  },
  headerAmount: {
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

function Pledges() {
  const classes = useStyles()
  return (
    <div className={classes.main}>
      <TableHeader />
    </div>
  )
}

export default Pledges
