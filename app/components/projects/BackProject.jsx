import React, { useMemo, useState, useEffect } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'

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
    display: 'grid',
    fontSize: '2.5rem',
    gridColumnStart: '1',
    gridColumnEnd: '12',
    gridRowStart: '1',
    gridRowEnd: '6',
    textAlign: 'center'
  }
})

const Title = ({ className }) => (
  <div className={className}>
    <div style={{ alignSelf: 'center' }}>Back Project Page</div>
    <div style={{ alignSelf: 'center', fontSize: '1.5rem', fontWeight: 200 }}>By Status Network</div>
    <Divider />
  </div>
)

function BackProject({classes, match}) {
  const projectId = match.params.id
  console.log({projectId})
  return (
    <div className={classes.root}>
      <Title className={classes.title} />
    </div>
  )
}

const StyledProject = withStyles(styles)(BackProject)
export default StyledProject
