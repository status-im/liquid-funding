import React, { Fragment } from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/styles'
import Button from '@material-ui/core/Button'
import Check from '@material-ui/icons/Check'
import CircularProgress from '@material-ui/core/CircularProgress'

const useStyles = makeStyles(theme => ({
  check: {
    color: theme.palette.primary[500]
  },
  formButton: {
    gridColumnStart: '1',
    gridColumnEnd: '13',
    minHeight: '50px',
    marginTop: '1.5rem',
    borderRadius: '8px',
    backgroundColor: theme.palette.primary[500],
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary['hov'],
    }
  },
  disabledButton: {
    backgroundColor: 'none'
  },
  buttonContent: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
    fontSize: '5.4vw',
    [theme.breakpoints.up('md')]: {
      fontSize: '14px'
    }
  },
  progress: {
    color: theme.palette.primary[500],
    animationDuration: '350ms'
  }
}))

function StatusButton(props) {
  const { className, disabled, buttonText, confirmed, loading, onClick } = props
  const classes = useStyles()
  const { check, formButton, disabledButton, buttonContent, progress } = classes
  return (
    <Fragment>
      <Button className={classnames(formButton, className)} disabled={disabled} type="submit" variant="contained" classes={{ disabled: disabledButton }} onClick={onClick}>
        <div className={buttonContent}>
          {confirmed && <Check className={check} />}
          {loading && <CircularProgress className={progress} size={24} disableShrink />}
          {buttonText || ''}
        </div>
      </Button>
    </Fragment>
  )
}

export default StatusButton
