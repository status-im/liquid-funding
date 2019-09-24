import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'

const styles = () => ({
  check: {
    fill: 'none',
    stroke: 'green',
    strokeWidth: 20,
    strokeLinecap: 'round',
    strokeDasharray: 180,
    strokeDashoffset: 180,
    animation: '$draw 2s infinite ease',
  },
  '@keyframes draw': {
    to: {
      strokeDashoffset: 0,
    }
  }
})
const useStyles = makeStyles(styles)

const SVG = () => {
  const classes = useStyles()

  return (
    <svg viewBox="0 0 100 100">
      <path x="0" y="0" width="100%" height="100%" className={classnames(classes.check)} d="M10,50 l25,40 l95,-70" />
    </svg>
  )
}

export default SVG
