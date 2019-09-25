import React from 'react'
import classnames from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import BreadCrumb from './base/BreadCrumb'
import Typography from '@material-ui/core/Typography'
import Icon from './base/icons/IconByName'
import NewInternet  from '../images/new_internet.png'

const style = () => ({
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem 4rem 8rem 5rem 5rem 5rem'
  },
  breadCrumb: {
    gridColumn: '3 / 48'
  },
  bullet: {
    display: 'flex',
    alignItems: 'center'
  },
  imgContainer: {
    gridColumn: '26 / 48',
    gridRow: '2 / 6',
  },
  img: {
    width: '100%',
    height: '100%'
  },
  title:{
    fontSize: '20px',
    fontWeight: 'bold',
    gridColumn: '3 / 23'
  },
  stepMain: {
    gridColumn: '27 / 46',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '1em'
  },
  stepText: {
    fontSize: '16px',
    color: '#939BA1',
    margin: '0.5em 0 2.5rem'
  },
  text: {
    fontSize: '16px',
  },
  description: {
    gridColumn: '3 / 25'
  },
  subSectionTitle: {
    gridColumn: '34 / 48',
    alignSelf: 'center'
  }
})

const useStyles = makeStyles(style)
const BulletText = ({ text, className }) => {
  return (
    <div className={className} >
      <Icon name="check" />
      <span style={{ marginLeft: '1em' }}>{text}</span>
    </div>
  )
}
const Step = ({ number, title, text }) => {
  const classes = useStyles()
  return (
    <div className={classes.stepMain}>
      <Icon text={number} />
      <div className={classes.stepTitle}>{title}</div>
      <div className={classes.stepText}>{text}</div>
    </div>
  )
}

const About = () => {
  const classes = useStyles()
  const { text, description } = classes
  const leftSide = classnames(text, description)
  return (
    <div className={classes.main}>
      <BreadCrumb
        className={classes.breadCrumb}
        start={'About'}
      />
      <Typography className={classes.title} gutterBottom>
        About Liquid Funding
      </Typography>
      <Typography className={leftSide}>
        Liquid funding facilitates self-soverign, autonomous development of socio-economic services and infrastructure. On liquid funding anyone can pitch a project and request funding, from anyone. Fund, build, together.
      </Typography>
      <BulletText text="Fund and build the features you want to see in Status" className={classnames(leftSide, classes.bullet)}/>
      <BulletText text="Transparent funding flows and accountability" className={classnames(leftSide, classes.bullet)}/>
      <BulletText text="Permissionless project creation and funding" className={classnames(leftSide, classes.bullet)}/>
      <div className={classes.imgContainer}>
        <img src={NewInternet} className={classes.img} />
      </div>
      <Typography className={classnames(classes.title, classes.subSectionTitle)}>How it works</Typography>
      <Step number="1" title="Create project" text="Propose something you want to design, build, do." />
      <Step number="2" title="Discuss" text="Discuss your project in a public Status channel." />
      <Step number="3" title="Receive funding" text="Withdraw funds pledged to your project." />
      <Step number="4" title="Get started" text="Keep everyone informed on your progress." />
    </div>
  )
}

export default About
