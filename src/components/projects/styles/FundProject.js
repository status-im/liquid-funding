const styles = theme => ({
  adornmentText: {
    cursor: 'pointer',
    color: '#4360DF'
  },
  amount: {
    marginTop: '3rem',
    display: 'grid'
  },
  amountLayout: {
    gridColumnStart: 1,
    gridColumnEnd: 5
  },
  amountText: {
    gridColumnStart: 6,
    alignSelf: 'center',
    color: '#939BA1',
  },
  amountInput: {
    textAlign: 'right'
  },
  check: {
    color: theme.palette.primary[500]
  },
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridRowGap: '3ch',
    fontFamily: theme.typography.fontFamily,
    [theme.breakpoints.up('sm')]: {
      margin: '1.75rem 4.5rem'
    }
  },
  title: {
    display: 'grid',
    fontSize: '2.5rem',
    gridColumnStart: '1',
    gridColumnEnd: '13',
    gridRowStart: '1',
    gridRowEnd: '6',
    textAlign: 'center'
  },
  projectTitle:{
    fontSize: '28px',
    gridColumnStart: 1,
    gridColumnEnd: 13
  },
  projectSubTitle:{
    fontSize: '15px',
    gridColumnStart: 1,
    gridColumnEnd: 13
  },
  progress: {
    color: theme.palette.primary[500],
    animationDuration: '350ms'
  },
  submissionRoot: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridColumnStart: '1',
    gridColumnEnd: '13',
    gridRowGap: '2ch',
    [theme.breakpoints.up('md')]: {
      margin: '0rem 5rem 0rem 3rem'
    }
  },
  edit: {
    gridColumnStart: 12,
    color: theme.palette.primary[500],
    fontSize: '15px'
  },
  formControl: {
    gridColumnStart: '6'
  },
  formButton: {
    gridColumnStart: '1',
    gridColumnEnd: '13',
    height: '50px',
    marginTop: '1.5rem',
    borderRadius: '8px',
    backgroundColor: theme.palette.primary[500],
    color: 'white',
    '&:hover': {
      backgroundColor: "#34489f",
    }
  },
  disabledButton: {
    backgroundColor: 'none'
  },
  buttonContent: {
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '50%'
  },
  textField: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  firstHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '7rem',
    gridRowGap: '2rem',
    gridColumn: '1 / 13',
    [theme.breakpoints.up('md')]: {
      gridColumn: '1 / 8'
    }
  },
  chatRoom: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridColumnStart: 1,
    gridColumnEnd: 13,
    justifyItems: 'start',
    gridAutoFlow: 'column',
    paddingLeft: '5px'
  },
  chatLink: {
    gridColumnStart: 3,
    gridColumnEnd: 13,
    textDecoration: 'none'
  },
  halfText: {
    gridColumnStart: 4
  },
  imgClass: {
    maxWidth: '100%',
    [theme.breakpoints.up('md')]: {
      maxWidth: '30vw',
      maxHeight: '40vh',
    }
  },
  imgSmallViewport: {
    maxWidth: '100%'
  },
  chatRoomIcon: {
    justifySelf: 'auto'
  },
  chatText: {
    marginTop: '15px',
    color: theme.palette.primary[500]
  },
  link:{
    textDecoration: 'none'
  },
  secondHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridColumn: '1 / 13',
    height: 'fit-content',
    [theme.breakpoints.up('md')]: {
      gridColumn: '9 / 13',
      gridTemplateRows: '9rem'
    }
  },
  markdown: {
    display: 'grid',
    margin: '16px 0 8px 0',
    padding: '10%'
  },
  markdownPreview: {
    gridColumnStart: 12
  },
  noProject: {
    textAlign: 'center',
    fontSize: '5rem'
  },
  textInput: {
    fontSize: '2rem'
  },
  fullWidth: {
    gridColumnStart: '1',
    gridColumnEnd: '13'
  },
  breadCrumb: {
    color: '#939BA1'
  },
  usdText: {
    color: '#939BA1',
    fontSize: '12px'
  },
  icon: {
    background: '#ECEFFC'
  },
  preview: {
    fontSize: '20px'
  },
  pledgesLink: {
    gridColumn: '5 / 10',
    textAlign: 'center',
  },
  contact: {
    gridColumnStart: '1',
    gridColumnEnd: '6'
  },
  created: {
    gridColumnStart: '7',
    gridColumnEnd: '13'
  }
})

export default styles
