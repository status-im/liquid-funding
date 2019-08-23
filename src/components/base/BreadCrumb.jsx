import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

const styles = theme => ({
  theme,
  main: {
    color: '#939BA1'
  },
  link: {
    textDecoration: 'none',
    color: '#939BA1'
  }
})

function BreadCrumb({ classes, className, trail }){
  const trailString = trail ? ` > ${trail.join(' > ')}` : ''
  return (
    <div className={classnames(classes.main, className)}>
      <Link className={classes.link} to={'/'}>
        All projects
      </Link>
      {<span>{trailString}</span>}
    </div>
  )
}

BreadCrumb.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  trail: PropTypes.array
}

export default withStyles(styles)(BreadCrumb)
