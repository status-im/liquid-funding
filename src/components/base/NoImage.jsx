import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PhotoIcon from './icons/Photo.jsx'

const useStyles = makeStyles(({
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(147, 155, 161, 0.1)',
    minHeight: '15em',
    gridColumn: '1 / 7'
  },
  icon: {},
  subText: {
    color: '#939BA1',
    fontSize: '0.9375rem'
  }
}))

function NoImage(){
  const classes = useStyles()
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <PhotoIcon />
      </div>
      <div className={classes.subText}>No image available</div>
    </div>
  )
}

export default NoImage
