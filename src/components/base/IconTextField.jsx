import React from 'react'
import { withStyles } from '@material-ui/core/styles'
import Icon from './icons/IconByName'
import StatusTextField from './TextField'

const styles = () => ({
  iconRoot: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridColumnStart: 1,
    gridColumnEnd: 13,
    alignItems: 'center'
  },
  icon: {
    gridColumnStart: 1,
    gridColumnEnd: 2
  },
  textField: {
    gridColumnStart: 2,
    gridColumnEnd: 13
  }
})

function IconTextField(props) {
  const { iconName, classes } = props
  return (
    <div className={classes.iconRoot}>
      <Icon name={iconName} className={classes.icon} centered />
      <StatusTextField {...props} className={classes.textField} />
    </div>
  )
}

export default withStyles(styles)(IconTextField)
