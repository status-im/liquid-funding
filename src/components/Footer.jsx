import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import assemble from '../images/assemble-high-res.png'
import github from './image/github-logo.png'
import statusGrey from './image/status-grey.png'
import statusLogoText from './image/status-logo-text.png'
import twitter from './image/twitter-logo-button.png'
import classNames from 'classnames'
import Typography from '@material-ui/core/Typography'
import { Divider} from '@material-ui/core'

const style = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem 3rem repeat(4, 2rem) 4rem',
    height: '12rem',
    marginTop: '5rem',
  },
  assemble: {
    width: '2.5em',
    height: '2.5em',
    marginRight: '0.4em'
  },
  link: {
    textDecoration: 'none'
  },
  logoLink: {
    gridColumn: '6 / 10',
    color: '#000000'
  },
  flex: {
    display: 'flex'
  },
  github: {
    gridColumn: '6 / 7'
  },
  statusGrey: {
    gridColumn: '8 / 9'
  },
  twitter: {
    gridColumn: '10 / 11'
  },
  divider: {
    gridColumn: '6 / 42'
  },
  middle: {
    gridColumn: '18 / 21',
  },
  midRight: {
    gridColumn: '25 / 32'
  },
  end: {
    gridColumn: '34 / 42',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  statusLogoText: {
    height: '2.2rem'
  },
  header: {
    fontSize: '17px',
    fontWeight: 'bold',
    color: '#172348'
  },
  text: {
    color: '#5C667D',
    fontSize: '17px'
  },
})

const useStyle = makeStyles(style)
const Footer = () => {
  const classes = useStyle()
  const { middle, midRight, text, header } = classes
  return (
    <div className={classes.main}>
      <Divider className={classes.divider} />
      <Link to="/" className={classNames(classes.flex, classes.link, classes.logoLink)}>
        <img src={assemble} className={classes.assemble} />
        <Typography variant="h6">assemble</Typography>
      </Link>
      <Typography className={classNames(header, middle)}>Assemble</Typography>
      <Typography className={classNames(header, midRight)}>Status Network</Typography>
      <Typography className={classNames(classes.end, text)}>
        We are part of
        <img src={statusLogoText} className={classes.statusLogoText} />
      </Typography>
      <img src={github} className={classes.github} />
      <img src={statusGrey} className={classes.statusGrey} />
      <img src={twitter} className={classes.twitter} />
      <Typography className={classNames(middle, text)}>Assemble</Typography>
      <Typography className={classNames(midRight, text)}>Status</Typography>
      <Typography className={classNames(middle, text)}>fund</Typography>
      <Typography className={classNames(midRight, text)}>Keycard</Typography>
      <Typography className={classNames(midRight, text)}>Embark</Typography>
      <Typography className={classNames(midRight, text)}>Teller</Typography>
      <Typography className={classNames(midRight, text)}>Nimbus</Typography>
    </div>
  )
}
export default Footer
