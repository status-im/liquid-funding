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
    color: '#939BA1'
  },
  amountInput: {
    textAlign: 'right'
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
  submissionRoot: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: 'repeat(5, [row] auto)',
    gridColumnGap: '1em',
    gridColumnStart: '1',
    gridColumnEnd: '13',
    gridRowGap: '2ch',
  },
  edit: {
    gridColumnStart: 12,
    color: '#4360DF',
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
    borderRadius: '8px'
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
    gridColumnStart: '1',
    gridColumnEnd: '8',
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
    maxHeight: '40vh',
    maxWidth: '30vw'
  },
  imgSmallViewport: {
    maxWidth: '100%'
  },
  chatRoomIcon: {
    justifySelf: 'auto'
  },
  chatText: {
    marginTop: '15px',
    color: '#4360DF'
  },
  secondHalf: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, [col] 1fr)',
    gridTemplateRows: '9rem',
    gridColumnStart: '8',
    gridColumnEnd: '13',
    height: 'fit-content'
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
