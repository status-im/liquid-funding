import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Link } from 'react-router-dom'
import assemble from '../images/assemble-high-res.png'
import github from './image/github-logo.png'
import statusGrey from './image/status-grey.png'
import statusLogoText from './image/status-logo-text.png'
import classNames from 'classnames'
import Typography from '@material-ui/core/Typography'
import { Divider} from '@material-ui/core'

const style = ({
  breakpoints: { up }
}) => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: 'repeat(4, 4rem) repeat(4, 2rem)',
    height: '12rem',
    marginTop: '5rem',
    [up('md')]: {
      gridTemplateRows: '4rem 3rem repeat(5, 2rem) 4rem'
    }
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
    gridColumn: '6 / 10',
    [up('md')]: {
      gridColumn: '18 / 21',
    }
  },
  midRight: {
    gridColumn: '34 / 42',
    [up('md')]: {
      gridColumn: '25 / 32'
    }
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
    [up('md')]: {
      gridRow: 2
    },
    fontSize: '17px',
    fontWeight: 'bold',
    color: '#172348',
    gridRow: 4
  },
  text: {
    color: '#5C667D',
    fontSize: '17px'
  },
})

const useStyle = makeStyles(style)
const Footer = () => {
  const classes = useStyle()
  const { middle, midRight, text, header, link } = classes
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
      <a href="https://github.com/status-im/liquid-funding" className={classNames(link, classes.github)}>
        <img src={github} className={classes.github} />
      </a>
      <a href="https://status.im" className={classNames(link, classes.statusGrey)}>
        <img src={statusGrey} className={classes.statusGrey} />
      </a>
      <Typography className={classNames(middle, text)}>Assemble</Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://status.im" className={classNames(text, link)}>
           Status
        </a>
      </Typography>
      <Typography className={classNames(middle, text)}>fund</Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://keycard.tech/" className={classNames(text, link)}>
           Keycard
        </a>
      </Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://dap.ps/" className={classNames(text, link)}>
          dap.ps
        </a>
      </Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://embark.status.im/" className={classNames(text, link)}>
          Embark
        </a>
      </Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://nimbus.team" className={classNames(text, link)}>
          Nimbus
        </a>
      </Typography>
      <Typography className={classNames(midRight, text)}>
        <a href="https://vac.dev" className={classNames(text, link)}>
          Vac
        </a>
      </Typography>
    </div>
  )
}
export default Footer
