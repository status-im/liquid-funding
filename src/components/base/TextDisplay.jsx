import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import ReactMarkdown from 'react-markdown'
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
  markdown: {
    gridColumnStart: 2,
    gridColumnEnd: 25
  },
  name: {
    gridColumnStart: 1,
    gridColumnEnd: 25,
    fontSize: '15px',
    color: '#939BA1'
  },
  text: {
    fontSize: '15px',
    gridColumnStart: 2
  }
})

function TextDisplay({ classes, name, text, rootClass, textClass, isMarkdown }) {
  return (
    <div className={classnames(classes.container, rootClass)} >
      <div className={classes.name}>{name}</div>
      {!isMarkdown && <div className={classnames(classes.text, textClass)}>{text}</div>}
      {isMarkdown &&
       <div className={classes.markdown}>
         <ReactMarkdown source={text} />
       </div>
      }
    </div>
  )
}

TextDisplay.defaultProps = {
  name: '',
  text: '',
  isMarkdown: false
}

TextDisplay.propTypes = {
  classes: PropTypes.object.isRequired,
  name: PropTypes.string,
  text: PropTypes.string,
  rootClass: PropTypes.object,
  textClass: PropTypes.object,
  isMarkdown: PropTypes.bool
}

export default withStyles(styles)(TextDisplay)
