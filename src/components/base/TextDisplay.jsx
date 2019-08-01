import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/'

const styles = theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(24, [col] 1fr)',
    gridTemplateRows: '2rem',
    gridColumnStart: 1,
    gridColumnEnd: 13
  },
  margin: {
    margin: theme.spacing.unit
  },
  name: {
    gridColumnStart: 1,
    gridColumnEnd: 25,
    fontSize: '15px',
    color: '#939BA1'
  },
  text: {
    fontSize: '15px',
    gridColumnStart: 4
  }
})

function TextDisplay({ classes, name, text, rootClass }) {
  return (
    <div className={classnames(classes.container, rootClass)} >
      <div className={classes.name}>{name}</div>
      <div className={classes.text}>{text}</div>
    </div>
  )
}

TextDisplay.defaultProps = {
  name: '',
  text: ''
}

TextDisplay.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string,
  text: PropTypes.string,
  rootClass: PropTypes.object
}

export default withStyles(styles)(TextDisplay)
