const styles = theme => ({
  theme,
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '1fr 1fr 1fr'
  },
  title: {
    fontSize: '2.5rem',
    textAlign: 'center'

  },
  subTitle: {
    color: '#4360DF',
    fontSize: '1.5rem',
    textAlign: 'center'
  },
  fullWidth: {
    gridColumn: '1 / 49'
  },
  tableTitle: {
    color: '#939BA1',
    fontSize: '1.2rem',
    gridColumn: '3 / 49'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.4)',
    fontSize: '0.9rem',
    gridRow: '4 / 5'
  },
  headerName: {
    gridColumn: '3 / 13'
  },
  headerDescription: {
    gridColumn: '13 / 23'
  },
  headerDetails: {
    gridColumn: '23 / 28'
  },
  headerContact: {
    gridColumn: '30 / 35'
  },
  dateCreated: {
    gridColumn: '37 / 42'
  },
  readMore: {
    gridColumn: '43 / 46'
  }
})
export default styles
