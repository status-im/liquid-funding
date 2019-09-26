import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'

const style = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    height: '12rem',
    marginTop: '5rem',
    background: 'rgba(147, 155, 161, 0.4)'
  },
  link: {
    textDecoration: 'none',
    color: '#939BA1',
    fontSize: '16px',
    gridColumnStart: '4',
    marginTop: '2rem'
  }
})

const useStyle = makeStyles(style)
const Footer = () => {
  const classes = useStyle()
  return (
    <div className={classes.main}>
      <Link to="/about" className={classes.link}>About</Link>
    </div>
  )
}
export default Footer
