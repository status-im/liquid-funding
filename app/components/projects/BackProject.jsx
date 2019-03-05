import React, { useMemo, useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridRowGap: '36px',
    margin: '1.75rem 4.5rem',
    fontFamily: theme.typography.fontFamily
  },
  title: {
    fontSize: '2.5rem',
    gridColumnStart: '3',
    gridColumnEnd: '10'
  }
})

function BackProject({classes, match}) {
  const projectId = match.params.id
  console.log({projectId})
  return (
    <div className={classes.root}>
      <div className={classes.title}>Back Project Page</div>
    </div>
  )
}

const StyledProject = withStyles(styles)(BackProject)
export default StyledProject
