import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import InputBase from '@material-ui/core/InputBase'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'


const styles = theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '24px 24px 36px'
  },
  margin: {
    margin: theme.spacing.unit,
  },
  root: {
    'label + &': {
      gridRowStart: 2,
      gridColumnStart: 1,
      gridColumnEnd: 13,
      marginTop: theme.spacing.unit * 3,
    },
  },
  multi: {
    'label + &': {
      gridRowStart: 2,
      gridColumnStart: 1,
      gridColumnEnd: 13,
      marginTop: theme.spacing.unit * 3,
      paddingRight: '24px'
    },
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#edf2f5',
    fontSize: 16,
    padding: '20px 12px'
  },
  formLabel: {
    gridRowStart: 1,
    fontSize: '18px',
    color: '#939BA1'
  },
  top: {
    gridRowStart: 1
  },
  bottomRight: {
    fontSize: '15px',
    gridRowStart: 4,
    gridColumnStart: 12,
    whiteSpace: 'nowrap'
  },
  bottomLeft: {
    fontSize: '15px',
    gridRowStart: 4,
    gridColumnStart: 1,
  }
})

const renderLabel = (formLabelClass, idFor, label, isRequired) => (
  <InputLabel
    shrink
    htmlFor={idFor}
    className={formLabelClass}
    focused={false}
  >
    {label}
    {isRequired && <span style={{ color: 'red' }}> *</span>}
  </InputLabel>
)

function Input({
  classes,
  idFor,
  isRequired,
  label,
  bottomRightLabel,
  bottomLeftLabel,
  placeholder,
  className,
  name,
  onChange,
  onBlur,
  value,
  multiline
}) {
  const labelForm = label ? renderLabel(classnames(classes.formLabel, classes.top), idFor, label, isRequired) : null
  const bottomLeft = bottomLeftLabel ? renderLabel(classnames(classes.formLabel, classes.bottomLeft), idFor, bottomLeftLabel) : null
  const bottomRight = bottomRightLabel ? renderLabel(classnames(classes.formLabel, classes.bottomRight), idFor, bottomRightLabel) : null
  return (
    <FormControl className={classnames(classes.margin, classes.container, className)}>
      { labelForm }
      <InputBase
        id={idFor}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        classes={{
          root: multiline ? classes.multi : classes.root,
          input: classes.input,
        }}
        onBlur={onBlur}
        value={value}
        multiline={multiline}
      />
      { bottomLeft }
      { bottomRight }
    </FormControl>
  )
}

Input.defaultProps = {
  label: '',
  placeholder: ''
}

Input.propTypes = {
  classes: PropTypes.object.isRequired,
  idFor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string
}

export default withStyles(styles)(Input)
