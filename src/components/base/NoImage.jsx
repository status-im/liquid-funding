import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import PhotoIcon from './icons/Photo.jsx'

const styles = theme => ({
  theme,
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
})

function NoImage({ classes }){
  return (
    <div className={classes.main}>
      <div className={classes.icon}>
        <PhotoIcon />
      </div>
      <div className={classes.subText}>No image available</div>
    </div>
  )
}

NoImage.propTypes = {
  classes: PropTypes.object
}

export default withStyles(styles)(NoImage)
