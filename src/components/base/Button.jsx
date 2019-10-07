import React, { Fragment } from 'react'
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
  },
  buttonContent: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '50%'
  },
  progress: {
    color: theme.palette.primary[500],
    animationDuration: '350ms'
  }
}))

function StatusButton(props) {
  const { disabled, buttonText, confirmed, loading } = props
  const classes = useStyles()
  const { check, formButton, disabledButton, buttonContent, progress } = classes
  return (
    <Fragment>
      <Button disabled={disabled} type="submit" variant="contained" className={formButton} classes={{ disabled: disabledButton }}>
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
