import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import classnames from 'classnames'
import styles from './styles/ListProjects'

function ListProjects({ classes }) {
  console.log({classes})
  return (
    <div className={classes.main}>
      <Typography className={classnames(classes.title, classes.fullWidth)}>
        Liquid Funding
      </Typography>
      <Typography className={classnames(classes.subTitle, classes.fullWidth)}>
        Fund. Build. Together.
      </Typography>
      <Typography className={classes.tableTitle}>
        All Projects
      </Typography>
      <Typography className={classnames(classes.tableHeader, classes.headerName)}>Name</Typography>
      <Typography className={classnames(classes.tableHeader, classes.headerDescription)}>Description</Typography>
      <Typography className={classnames(classes.tableHeader, classes.headerDetails)}>Funding details</Typography>
      <Typography className={classnames(classes.tableHeader, classes.headerContact)}>Contact person</Typography>
      <Typography className={classnames(classes.tableHeader, classes.dateCreated)}>Date created</Typography>
    </div>
  )
}

export default withStyles(styles)(ListProjects)
