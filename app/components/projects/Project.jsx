import React from 'react'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import CardActionArea from '@material-ui/core/CardActionArea';
import Avatar from '@material-ui/core/Avatar';
import { withStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr 3fr',
    gridTemplateRows: '1fr 7fr',
    gridColumnGap: '1em',
    gridRowGap: '36px'
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
    alignItems: 'center'
  },
  creatorName: {
    fontSize: '1rem'
  },
  media: {
    objectFit: 'cover'
  },
  secondRow: {
    gridColumnStart: '1',
    gridColumnEnd: '3'
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
      <Card className={classes.card}>
        <CardActionArea>
          <CardMedia
            component="img"
            alt="video"
            className={classes.media}
            height="140"
            src="https://images.pexels.com/photos/1464143/pexels-photo-1464143.jpeg?cs=srgb&dl=background-camera-close-up-1464143.jpg&fm=jpg"
            title="media-description"
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Lizard
            </Typography>
            <Typography component="p">
              Lizards are a widespread group of squamate reptiles, with over 6,000 species, ranging
              across all continents except Antarctica
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
      </div>
    </div>
  )
}

Project.propTypes = {
  classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Project)
