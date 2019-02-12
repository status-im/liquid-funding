import React from 'react'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardMedia from '@material-ui/core/CardMedia'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import CardActionArea from '@material-ui/core/CardActionArea'
import Avatar from '@material-ui/core/Avatar'
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 5fr',
    gridTemplateRows: '1fr 4fr',
    gridColumnGap: '1em',
    gridRowGap: '36px',
    margin: '1.75rem 4.5rem'
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
    gridTemplateRows: '2.5rem 2.5rem 2.5rem 2.5rem',
    gridRowGap: '2rem'
  },
  infoBoxSection: {
    display: 'flex',
    flexDirection: 'column'
  },
  infoText: {
    fontSize: '2rem'
  },
  subtext: {
    fontSize: '1rem',
    opacity: '0.6'
  }
})

function Project({ classes }) {
  return (
    <div className={classes.root}>
      <div className={classes.creator}>
        <Avatar>
          R
        </Avatar>
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
          <div className={classes.infoBoxSection}>
            <span className={classes.infoText}>
              $13,412
            </span>
            <span className={classes.subtext}>pledged of $48,894 goal</span>
          </div>
          <div className={classes.infoBoxSection}>
            <span className={classes.infoText}>475</span>
            <span className={classes.subtext}>backers</span>
          </div>
          <div className={classes.infoBoxSection}>
            <span className={classes.infoText}>19</span>
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
}

export default withStyles(styles)(Project)
