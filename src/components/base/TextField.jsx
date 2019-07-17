import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classnames from 'classnames'
import InputBase from '@material-ui/core/InputBase'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'


const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing.unit,
  },
  root: {
    'label + &': {
      marginTop: theme.spacing.unit * 3,
    },
  },
  input: {
    borderRadius: 8,
    backgroundColor: '#edf2f5',
    fontSize: 16,
    padding: '20px 12px'
  },
  formLabel: {
    fontSize: '18px',
    color: '#939BA1'
  },
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
  placeholder,
  className,
  name,
  onChange,
  onBlur,
  value
}) {
  const labelForm = label ? renderLabel(classes.formLabel, idFor, label, isRequired) : null
  return (
    <FormControl className={classnames(classes.margin, className)}>
      { labelForm }
      <InputBase
        id={idFor}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        classes={{
          root: classes.root,
          input: classes.input,
        }}
        onBlur={onBlur}
        value={value}
      />
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
