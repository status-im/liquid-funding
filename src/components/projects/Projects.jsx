import React, {Fragment, useState} from 'react'
import {withStyles} from '@material-ui/core/styles'
import {withDatabase} from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import {Q} from "@nozbe/watermelondb";
import PropTypes from 'prop-types'
import {useProjectData} from "./hooks";
import Loading from "../base/Loading";
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from "@material-ui/core/Typography";
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import CardActionArea from '@material-ui/core/CardActionArea';
import LinearProgress from '@material-ui/core/LinearProgress';

import defaultProjectImage from '../../images/default-project-img.png';

const SORT_TYPES = {
  date: 'date',
  name: 'name'
}

const styles = theme => ({
  root: {
    margin: '1.75rem 4.5rem',
    ...theme.typography.body1
  },
  title: {
    fontSize: '20px',
    textAlign: 'center',
    fontWeight: 500
  },
  media: {
    height: 235,
    position: 'relative'
  },
  avatar: {
    position: 'absolute',
    top: 26,
    left: 26
  },
  'card-title': {
    fontSize: '20px'
  },
  'card-content': {
    fontSize: '16px'
  },
  'card-actions': {
    float: 'right'
  },
  progress: {
    height: 10
  }
})

function sortByTitle(a, b) {
  if (!a.manifest || !b.manifest) {
    return 0;
  }
  return a.manifest.title.localeCompare(b.manifest.title)
}

// No date field, but we can use the ID
function sortByDate(a, b) {
  if (parseInt(a.projectId, 10) > parseInt(b.projectId, 10)) {
    return -1;
  }
  return 1;
}

function ProjectCard({classes, project}) {
  return (<Card className={classes.card}>
    <CardActionArea href={`/#/project/${project.projectId}`}>
      <CardMedia
        className={classes.media}
        image={defaultProjectImage}
        title="Project image"
      />
      <LinearProgress className={classes.progress} variant="determinate" value={75} /> {/*TODO get actual percentage*/}
      <CardContent>
        <Typography align="right" className={classes['card-content']}>75% of 2.055 ETH</Typography> {/*TODO get actual percentage*/}
        <Typography align="right" className={classes['card-content']}>3 funders</Typography> {/*TODO get actual funders*/}
        <Typography gutterBottom variant="h5" component="h2" className={classes['card-title']} noWrap>
          {project.manifest.title}
        </Typography>
        <Typography component="p" className={classes['card-content']} noWrap>
          {project.manifest.description}&nbsp;
        </Typography>
        <Typography component="p" className={classes['card-content']} color="textSecondary">
          Delegate: {project.manifest.creator} {/*TODO check if that really is the delegate*/}
        </Typography>
        {project.manifest.avatar && <img className={classes.avatar} alt="avatar" src={project.manifest.avatar} width={40} height={40}/>}
      </CardContent>
    </CardActionArea>
    <CardActions className={classes['card-actions']}>
      <Button size="small" color="primary" href={`/#/project/${project.projectId}`}>
        Read more
      </Button>
    </CardActions>
  </Card>)
}

function Projects({projectAddedEvents, classes}) {
  const [sortType, setSortType] = useState(SORT_TYPES.date);

  const projects = projectAddedEvents.map(event => {
    return Object.assign({projectId: event.returnValues.idProject}, useProjectData(event.returnValues.idProject, '', projectAddedEvents));
  })

  let sortFunction = (sortType === SORT_TYPES.name) ? sortByTitle : sortByDate;
  projects.sort(sortFunction);

  console.log(projects);
  return (<div className={classes.root}>
    <Typography className={classes.title} component="h2" gutterBottom>All projects</Typography>
    {projects.length === 0 && <Loading/>}
    {projects.length > 0 &&
    <Fragment>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Sort by</FormLabel>
        <RadioGroup
          aria-label="Sort"
          name="sort"
          className={classes.group}
          value={sortType}
          onChange={(e, value) => setSortType(value)}
        >
          <FormControlLabel value={SORT_TYPES.date} control={<Radio color="default"/>} label="Date"/>
          <FormControlLabel value={SORT_TYPES.name} control={<Radio color="default"/>} label="Name"/>
        </RadioGroup>
      </FormControl>
      <Grid container spacing={40}>
        {projects.map((project, index) => {
          if (!project.manifest) {
            return ''
          }
          return (<Grid key={'project-' + index} item xs={12} sm={6} md={4} lg={3} className="project-list-item">
            <ProjectCard project={project} classes={classes}/>
          </Grid>);
        })}
      </Grid>
    </Fragment>
    }
  </div>)
}

Projects.propTypes = {
  projectAddedEvents: PropTypes.array,
  classes: PropTypes.object
}

const StyledProject = withStyles(styles)(Projects)
export default withDatabase(withObservables([], ({database}) => ({
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe()
}))(StyledProject))
