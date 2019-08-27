import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import ReactMarkdown from 'react-markdown'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(24, [col] 1fr)',
    gridTemplateRows: '2rem',
    gridColumnStart: 1,
    gridColumnEnd: 13
  },
  margin: {
    margin: theme.spacing(1)
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
}))

function TextDisplay({ name, text, rootClass, textClass, isMarkdown }) {
  const classes = useStyles()
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
  name: PropTypes.string,
  text: PropTypes.string,
  rootClass: PropTypes.string,
  textClass: PropTypes.string,
  isMarkdown: PropTypes.bool
}

export default TextDisplay
