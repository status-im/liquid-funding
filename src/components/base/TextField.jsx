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
    gridTemplateRows: 'auto auto 5px',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  root: {
    gridColumnStart: 1,
    gridColumnEnd: 13,
    borderRadius: 8,
    backgroundColor: '#edf2f5',
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
      paddingRight: '1.2em'
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
  },
  topRight: {
    gridRowStart: 1,
    gridColumnStart: 12,
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
  endAdornment,
  InputProps,
  inputClass,
  label,
  bottomRightLabel,
  bottomLeftLabel,
  placeholder,
  className,
  name,
  onChange,
  onBlur,
  value,
  multiline,
  topRight
}) {
  const labelForm = label ? renderLabel(classnames(classes.formLabel, classes.top), idFor, label, isRequired) : null
  const topRightLabel = topRight ? renderLabel(classnames(classes.topRight), idFor, topRight) : null
  const bottomLeft = bottomLeftLabel ? renderLabel(classnames(classes.formLabel, classes.bottomLeft), idFor, bottomLeftLabel) : null
  const bottomRight = bottomRightLabel ? renderLabel(classnames(classes.formLabel, classes.bottomRight), idFor, bottomRightLabel) : null
  return (
    <FormControl
      className={classnames(classes.container, className)}
    >
      { labelForm }
      { topRightLabel }
      <InputBase
        id={idFor}
        inputProps={InputProps}
        endAdornment={endAdornment}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        classes={{
          root: multiline ? classes.multi : classes.root,
          input: classnames(classes.input, inputClass),
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
