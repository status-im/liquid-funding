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
  text: {
    fontSize: '16px',
  },
  description: {
    gridColumn: '3 / 25'
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
    </div>
  )
}

export default About
