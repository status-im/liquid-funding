import React, { Fragment, useState } from 'react'
import classnames from 'classnames'
import Typography from '@material-ui/core/Typography'
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import { useQuery } from '@apollo/react-hooks'
import { formatProjectId } from '../utils/project'
import { getProfileWithPledges } from './projects/queries'
import { getTokenLabel, getHumanAmountFormatter } from '../utils/currencies'
import { toDecimal } from '../utils/conversions'
import { getDateFromTimestamp } from '../utils/dates'
import Loading from './base/Loading'

const styles = theme => ({
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
    gridColumn: '31 / 34'
  },
  select: {
    gridColumn: '34 / 36'
  },
  checkBox: {
    paddingTop: 0,
    alignItems: 'normal',
    '&:hover': {
      backgroundColor: 'transparent'
    },
    '& svg': {
      background: 'radial-gradient(#EEF2F5, transparent)'
    }
  },
  checked: {
    '&&:hover': {
      backgroundColor: 'transparent'
    }
  },
  formButton: {
    gridColumnStart: '27',
    gridColumnEnd: '36',
    height: '50px',
    marginTop: '1.5rem',
    borderRadius: '8px',
    backgroundColor: theme.palette.primary[500],
    color: 'white',
    '&:hover': {
      backgroundColor: "#34489f",
    }
  },
  disabledButton: {
    backgroundColor: 'none'
  }
})

const useStyles = makeStyles(styles)

function TableHeader({ allSelected, selectAll }) {
  const classes = useStyles()
  const { tableHeader } = classes
  return (
    <Fragment>
      <Typography className={classnames(tableHeader, classes.headerStatus)}>Status</Typography>
      <Typography className={classnames(tableHeader, classes.headerAmount)}>Amount</Typography>
      <Typography className={classnames(tableHeader, classes.headerId)}>Pledge ID</Typography>
      <Typography className={classnames(tableHeader, classes.headerFunded)}>Funded on</Typography>
      <Typography className={classnames(tableHeader, classes.headerSelect)}>Select all</Typography>
      <Checkbox classes={{ root: classnames(classes.select, classes.checkBox), checked: classes.checked }} checked={allSelected} onChange={selectAll} color="primary" disableRipple labelPlacement="start" label="start"  />
    </Fragment>
  )
}

function TableRow({ pledge, amtFormatter, tokenLabel, selectedPledges, setSelected }) {
  const classes = useStyles()
  const { id, amount, creationTime, pledgeState } = pledge
  const isSelected = selectedPledges ? selectedPledges.includes(id) : false
  const handleChange = () => {
    if (isSelected) return setSelected(selectedPledges.filter(p => p !== id))
    setSelected([...selectedPledges, id])
  }
  return (
    <Fragment>
      <Typography className={classes.rowStatus}>{pledgeState}</Typography>
      <Typography className={classes.rowAmount}>{amtFormatter(amount)} {tokenLabel}</Typography>
      <Typography className={classes.rowId}>{toDecimal(id)}</Typography>
      <Typography className={classes.rowFunded}>{getDateFromTimestamp(creationTime, true)}</Typography>
      <Checkbox classes={{ root: classnames(classes.select, classes.checkBox), checked: classes.checked }} color="primary" disableRipple checked={isSelected} onChange={handleChange} />
    </Fragment>
  )
}

function Pledges({ match }) {
  const classes = useStyles()
  const [selectedPledges, setSelected] = useState([])
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
  const allSelected = selectedPledges.length === pledges.length
  const selectAll = () => {
    if (allSelected) return setSelected([])
    setSelected(pledges.map(p => p.id))
  }

  return (
    <div className={classes.main}>
      <TableHeader allSelected={allSelected} selectAll={selectAll} />
      {pledges.map(p => (
        <TableRow
          key={p.id}
          pledge={p}
          amtFormatter={amtFormatter}
          tokenLabel={tokenLabel}
          selectedPledges={selectedPledges}
          setSelected={setSelected}
        />
      ))}
      <Button  type="submit" variant="contained" className={classnames(classes.formButton)} classes={{ disabled: classes.disabledButton }}>
        Submit for withdrawl
      </Button>
    </div>
  )
}

export default Pledges
