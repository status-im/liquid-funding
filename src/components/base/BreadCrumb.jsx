import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import { Link } from 'react-router-dom'
import classnames from 'classnames'

const useStyles = makeStyles({
  main: {
    color: '#939BA1',
    fontSize: '1.125rem'
  },
  link: {
    textDecoration: 'none',
    color: '#939BA1'
  }
})

function BreadCrumb({ className, start, trail }){
  const classes = useStyles()
  const trailString = trail ? ` > ${trail.join(' > ')}` : ''
  return (
    <div className={classnames(classes.main, className)}>
      <Link className={classes.link} to={'/'}>
        {start || 'All projects'}
      </Link>
      {<span>{trailString}</span>}
    </div>
  )
}

BreadCrumb.propTypes = {
  className: PropTypes.string,
  trail: PropTypes.array
}

export default BreadCrumb
