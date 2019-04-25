import React, {Fragment, useState} from 'react'
import { withStyles } from '@material-ui/core/styles'
import {withDatabase} from "@nozbe/watermelondb/DatabaseProvider";
import withObservables from "@nozbe/with-observables";
import {Q} from "@nozbe/watermelondb";
import PropTypes from 'prop-types'
import {useProjectData} from "./hooks";
import Loading from "../base/Loading";
import Grid from '@material-ui/core/Grid';
import {Link} from "react-router-dom";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

const SORT_TYPES = {
  date: 'date',
  name: 'name'
}

const styles = theme => ({
  root: {
    margin: '1.75rem 4.5rem',
    ...theme.typography.body1
  },
  link: {
    textDecoration: 'none',
    ...theme.typography.body1,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer'
    }
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

function Projects({projectAddedEvents, classes}) {
  const [sortType, setSortType] = useState(SORT_TYPES.date);

  const projects = projectAddedEvents.map(event => {
    return Object.assign({projectId: event.returnValues.idProject}, useProjectData(event.returnValues.idProject, '', projectAddedEvents));
  })

  let sortFunction = (sortType === SORT_TYPES.name) ? sortByTitle : sortByDate;
  projects.sort(sortFunction);

  return (<div className={classes.root}>
    <h2>Projects</h2>
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
          <FormControlLabel value={SORT_TYPES.date} control={<Radio />} label="Date" />
          <FormControlLabel value={SORT_TYPES.name} control={<Radio />} label="Name" />
        </RadioGroup>
      </FormControl>
      <Grid container spacing={40}>
        {projects.map((project, index) => {
          if (!project.manifest) {
            return ''
          }
          return (
            <Grid key={'project-' + index} item xs={12} sm={6} md={4} className="project-list-item">
              <Link to={`/project/${project.projectId}`} className={classes.link}>
                <h3>{project.manifest.title}</h3>
                <p>{project.manifest.subtitle}</p>
                <p>{project.manifest.description}</p>
                <p>{project.manifest.avatar &&
                <img alt="avatar" src={project.manifest.avatar} width={20} height={20}/>}{project.manifest.creator}</p>
              </Link>
            </Grid>
          )
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
export default withDatabase(withObservables([], ({ database }) => ({
  projectAddedEvents: database.collections.get('lp_events').query(
    Q.where('event', 'ProjectAdded')
  ).observe()
}))(StyledProject))
