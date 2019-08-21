const styles = theme => ({
  theme,
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '1fr 1fr 1fr 0.5fr 1fr'
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
  cellText: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '1.2rem',
    background: '#F5F7F8',
    flexFlow: 'column',
    padding: '1rem'
  },
  centerText: {
    textAlign: 'center'
  },
  cellDescription: {
    fontSize: '1rem'
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
    gridColumn: '2 / 12'
  },
  headerDescription: {
    gridColumn: '12 / 30'
  },
  headerDetails: {
    gridColumn: '30 / 35'
  },
  headerContact: {
    gridColumn: '35 / 40'
  },
  dateCreated: {
    gridColumn: '40 / 45'
  },
  readMore: {
    gridColumn: '45 / 48'
  },
  usdValue: {
    color: '#939BA1'
  }
})
export default styles
