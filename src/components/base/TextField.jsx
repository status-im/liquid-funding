import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/styles'
import classnames from 'classnames'
import InputBase from '@material-ui/core/InputBase'
import InputLabel from '@material-ui/core/InputLabel'
import FormControl from '@material-ui/core/FormControl'

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'auto auto 5px',
  },
  margin: {
    margin: theme.spacing(1),
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
      marginTop: theme.spacing(3),
    },
  },
  multi: {
    'label + &': {
      gridRowStart: 2,
      gridColumnStart: 1,
      gridColumnEnd: 13,
      marginTop: theme.spacing(3),
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
  red: {
    color: '#db0000'
  },
  errorBorder: {
    border: '1px solid #db0000'
  },
  topRight: {
    gridRowStart: 1,
    gridColumnStart: 11,
    [theme.breakpoints.up('sm')]: {
      marginLeft: '1.3rem'
    }
  },
  toolTip: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gridColumn: '3 / 11',
    backgroundColor: '#FFFFFF',
    color: '#FF2D55',
    textAlign: 'center',
    borderRadius: '8px',
    padding: '5px 0',
    zIndex: 1,
    boxShadow: '0px 4px 12px rgba(0, 34, 51, 0.08), 0px 2px 4px rgba(0, 34, 51, 0.16)',
    minHeight: '3rem',
    minWidth: '9rem',
    '&:after': {
      content: 'close-quote',
      position: 'absolute',
      top: '43%',
      left: '50%',
      marginLeft: '-5px',
      borderWidth: '10px',
      borderStyle: 'solid',
      borderColor: '#FFFFFF transparent transparent transparent'
    }
  },
  toolTipNoArrow: {
    gridColumn: '5 / 10',
    backgroundColor: '#FFFFFF',
    color: '#FF2D55',
    textAlign: 'center',
    borderRadius: '8px',
    padding: '5px 0',
    zIndex: 1,
    boxShadow: '0px 4px 12px rgba(0, 34, 51, 0.08), 0px 2px 4px rgba(0, 34, 51, 0.16)'
  }

}))

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
  idFor,
  isRequired,
  endAdornment,
  errorBorder,
  InputProps,
  inputClass,
  label,
  bottomRightLabel,
  bottomRightError,
  bottomLeftLabel,
  disabled,
  errorText,
  placeholder,
  className,
  name,
  onChange,
  onBlur,
  value,
  multiline,
  topRight
}) {
  const classes = useStyles()
  const labelForm = label ? renderLabel(classnames(classes.formLabel, classes.top), idFor, label, isRequired) : null
  const topRightLabel = topRight ? renderLabel(classnames(classes.topRight), idFor, topRight) : null
  const bottomLeft = bottomLeftLabel ? renderLabel(classnames(classes.formLabel, classes.bottomLeft), idFor, bottomLeftLabel) : null
  const bottomRight = bottomRightLabel ? renderLabel(classnames(classes.formLabel, classes.bottomRight, {
    [classes.red]: bottomRightError
  }), idFor, bottomRightLabel) : null
  return (
    <FormControl
      className={classnames(classes.container, className)}
    >
      { labelForm }
      { topRightLabel }
      {!!errorText && <span className={classes.toolTip}>{errorText}</span>}
      <InputBase
        id={idFor}
        error={errorBorder}
        inputProps={InputProps}
        endAdornment={endAdornment}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        onChange={onChange}
        classes={{
          root: classes.root,
          input: classnames(classes.input, inputClass),
          error: classes.errorBorder
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
  idFor: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string
}

export default Input
