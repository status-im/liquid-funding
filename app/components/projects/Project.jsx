import web3 from 'Embark/web3'
import React, { useMemo, useState, useEffect } from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import withObservables from '@nozbe/with-observables'
import { Q } from '@nozbe/watermelondb'
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import CardActionArea from '@material-ui/core/CardActionArea'
import LinearProgress from '@material-ui/core/LinearProgress'
import Avatar from '@material-ui/core/Avatar'
import { uniqBy, length } from 'ramda'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { toEther } from '../../utils/conversions'
import { getTokenLabel } from '../../utils/currencies'
import { timeSinceBlock } from '../../utils/dates'
import { getFiles } from '../../utils/ipfs'

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 5fr',
    gridTemplateRows: '1fr 4fr',
    gridColumnGap: '1em',
    gridRowGap: '36px',
    margin: '1.75rem 4.5rem',
    fontFamily: theme.typography.fontFamily
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  title: {
    fontSize: '2.5rem'
  },
  subTitle: {
    fontSize: '1.5rem',
    fontWeight: 200
  },
  creator:{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'end'
  },
  creatorName: {
    fontSize: '1rem'
  },
  media: {
    objectFit: 'cover'
  },
  secondRow: {
    gridColumnStart: '1',
    gridColumnEnd: '3',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gridColumnGap: '3em'
  },
  infoBox: {
    display: 'grid',
    gridTemplateRows: '0rem 2.5rem 2.5rem 2.5rem',
    gridRowGap: '2rem'
  },
  infoBoxSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoText: {
    fontSize: '2rem'
  },
  raisedAmount: {
    fontSize: '2em',
    color: theme.palette.primary.main
  },
  subtext: {
    ...theme.typography.caption,
    fontSize: '1rem'
  },
  linearColorPrimary: {
    backgroundColor: '#00000014',
  },
  linearBarColorPrimary: {
    backgroundColor: theme.palette.primary.main
  }
})

function getReceivedAmount(id, transfers){
  return transfers
    .filter(t => t.returnValues.to === id)
    .reduce((pv, cv) => {
      const amount = Number(toEther(cv.returnValues.amount))
      return pv + amount
    }, 0)
}

function getWithdrawnAmount(id, transfers){
  return transfers
    .filter(t => t.returnValues.from === id)
    .reduce((pv, cv) => {
      const amount = Number(toEther(cv.returnValues.amount))
      return pv + amount
    }, 0)
}

function getAmountsPledged(pledges){
  const amounts = {}
  pledges.forEach(pledge => {
    const { token, amount } = pledge
    if (amounts[token]) amounts[token] += Number(toEther(amount))
    else amounts[token] = Number(toEther(amount))
  })
  return Object
    .entries(amounts)
    .map(entry => ([getTokenLabel(entry[0]), entry[1]]))
}

function getNumberOfBackers(pledges){
  return length(uniqBy(p => p.owner, pledges))
}

async function getProjectAge(id, events, setState){
  const event = events.find(e => e.returnValues.idProject === id)
  const { timestamp } = await web3.eth.getBlock(event.blockNumber)
  setState(timeSinceBlock(timestamp, 'days'))
}

async function getProjectAssets(hash, setState){
  getFiles(hash)
    .then((files) => {
      setState(files)
      const manifest = files[2]
      console.log({files}, JSON.parse(manifest.content))
    })
    .catch(console.log)
}

function Project({ classes, match, profile, transfers, pledges, projectAddedEvents }) {
  const projectId = match.params.id
  const [projectAge, setAge] = useState(null)
  const [projectAssets, setAssets] = useState(null)

  useEffect(() => {
    getProjectAge(projectId, projectAddedEvents, setAge)
  }, [projectAge])

  useEffect(() => {
    getProjectAssets('QmZbFULchk4wKdYoHv13jkTs2Wf4NYYJ38aCFG97g97DNn', setAssets)
  }, [])

  const received = useMemo(() => getReceivedAmount(projectId, transfers), [projectId, transfers])
  const withdrawn = useMemo(() => getWithdrawnAmount(projectId, transfers), [projectId, transfers])
  const amountsPledged = useMemo(() => getAmountsPledged(pledges), [pledges])
  const numberOfBackers = useMemo(() => getNumberOfBackers(pledges), [pledges])
  console.log({profile, projectAssets})
  return (
    <div className={classes.root}>
      <div className={classes.creator}>
        <Avatar src="https://material-ui.com/static/images/avatar/1.jpg" />
        <Typography className={classes.creatorName}>By Creator Name</Typography>
      </div>
      <div>
        <Typography className={classes.title} component="h2" gutterBottom>
          Akira, The Linux Design Tool
        </Typography>
        <Typography className={classes.subTitle} component="h5" gutterBottom>
          UX/UI Design application for Linux
        </Typography>
      </div>
      <div className={classes.secondRow}>
        <CardMedia
          component="img"
          alt="video"
          className={classes.media}
          src="https://images.pexels.com/photos/1464143/pexels-photo-1464143.jpeg?cs=srgb&dl=background-camera-close-up-1464143.jpg&fm=jpg"
          title="media-description"
        />

        <div className={classes.infoBox}>
          <LinearProgress
            classes={{
              colorPrimary: classes.linearColorPrimary,
              barColorPrimary: classes.linearBarColorPrimary,
            }}
            variant="determinate"
            value={30}
          />
          <div className={classes.infoBoxSection}>
            <span className={classes.raisedAmount}>
              {`${amountsPledged[0][1]} ${amountsPledged[0][0]}`}
            </span>
            <span className={classes.subtext}>pledged of $48,894 goal</span>
          </div>
          <div className={classes.infoBoxSection}>
            <span className={classes.infoText}>{numberOfBackers}</span>
            <span className={classes.subtext}>backers</span>
          </div>
          <div className={classes.infoBoxSection}>
            <span className={classes.infoText}>{projectAge}</span>
            <span className={classes.subtext}>days active</span>
          </div>
          <Button color="primary" variant="contained" style={{ height: '50px' }}>Back this project</Button>
        </div>
      </div>
    </div>
  )
}

Project.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object,
  profile: PropTypes.array.isRequired,
}

const StyledProject = withStyles(styles)(Project)
export default withDatabase(withObservables([], ({ database, match }) => ({
  profile: database.collections.get('profiles').query(
    Q.where('id_profile', match.params.id)
  ).observe(),
  transfers: database.collections.get('lp_events').query(
    Q.where('event', 'Transfer')
  ).observe(),
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe(),
  pledges: database.collections.get('pledges').query(
    Q.where('intended_project', match.params.id)
  ).observe()
}))(StyledProject))

