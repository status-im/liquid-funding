import React, { Fragment } from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import classnames from 'classnames'
import StatusButton from '../base/Button'
import Icon from '../base/icons/IconByName'
import AssembleFlow from '../image/AssembleFlow'

const useStyles = makeStyles(({
  breakpoints: {
    up
  },
  palette: {
    primary,
    common: { darkGrey }
  }
}) => ({
  title: {
    fontSize: '38px',
    gridColumn: '1 / 49',
    textAlign: 'center'
  },
  subTitle: {
    gridColumn: '1 / 49',
    textAlign: 'center',
    color: darkGrey,
    fontSize: '20px'
  },
  creatorsCard: {
    [up('md')]: {
      gridColumn: '14 / 24',
      marginBottom: 0
    },
    gridColumn: '1 / 49',
    boxShadow: '0px 15px 29px rgba(0, 34, 51, 0.08)',
    borderRadius: '8px',
    background: '#FFFFFF',
    padding: '1rem',
    marginBottom: '1rem'
  },
  cardContent: {
    display: 'grid',
    gridTemplateRows: '3.5rem 1.5rem auto 2rem'
  },
  fundersCard: {
    [up('md')]: {
      gridColumn: '26 / 36',
    },
    gridColumn: '1 / 49',
    boxShadow: '0px 15px 29px rgba(0, 34, 51, 0.08)',
    borderRadius: '8px',
    background: '#FFFFFF',
    padding: '1rem'
  },
  flowImage: {
    gridColumn: '14 / 36'
  },
  cardMainFont: {
    fontSize: '24px'
  },
  cardSubTitle: {
    color: darkGrey,
    fontSize: '12px',
    textTransform: 'uppercase'
  },
  cardBody: {
    fontSize: '16px'
  },
  primary: {
    color: primary[500]
  },
  listedProjects: {
    gridColumn: '1 / 49',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    marginTop: '3rem'
  }

}))

function CreatorsCard() {
  const classes = useStyles();

  return (
    <Card className={classes.creatorsCard}>
      <CardContent className={classes.cardContent}>
        <Icon name="lightening" />
        <Typography className={classes.cardMainFont}>
          Platform for
        </Typography>
        <Typography className={classnames(classes.cardMainFont, classes.primary)} gutterBottom>
          Creators
        </Typography>
        <Typography className={classes.cardSubTitle}>
          DEVELOPERS, teams & individuals
        </Typography>
        <Typography className={classes.cardBody}>
          Decentralized products, community organizing, & more! Assemble connects project creators with a growing community to get the funding they need for their web3 work.
        </Typography>
      </CardContent>
      <CardActions>
        <StatusButton
          buttonText="Assemble a project →"
        />
      </CardActions>
    </Card>
  );
}

function FundersCard() {
  const classes = useStyles();

  return (
    <Card className={classes.fundersCard}>
      <CardContent className={classes.cardContent}>
        <Icon name="wallet" />
        <Typography className={classes.cardMainFont}>
          Platform for
        </Typography>
        <Typography className={classnames(classes.cardMainFont, classes.primary)} gutterBottom>
          Funders
        </Typography>
        <Typography className={classes.cardSubTitle}>
          Investors, Evangelists & Fans
        </Typography>
        <Typography className={classes.cardBody}>
          Assemble helps you to support the projects you care most about. Find a project from the list of list of open proposals and fund it easily with the cryptocurrency of your choice.
        </Typography>
      </CardContent>
      <CardActions>
        <StatusButton
          buttonText="Explore projects →"
        />
      </CardActions>
    </Card>
  );
}

function ProjectsHeader() {
  const classes = useStyles()

  return (
    <Fragment>
      <Typography className={classes.title}>Open and Transparent Funding</Typography>
      <Typography className={classes.subTitle}>Assemble helps you to bring your web3 projects to life</Typography>
      <CreatorsCard />
      <FundersCard />
      <div className={classes.flowImage}>
        <AssembleFlow />
      </div>
      <Typography className={classes.listedProjects}>Listed Projects</Typography>
    </Fragment>
  )
}

export default ProjectsHeader
