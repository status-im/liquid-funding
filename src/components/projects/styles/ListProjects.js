const styles = theme => ({
  theme,
  addIcon: {
    color: '#4360DF',
    fontSize: '2.5em'
  },
  blue: {
    color: '#4360DF'
  },
  px15: {
    fontSize: '0.9375rem'
  },
  px16: {
    fontSize: '1rem'
  },
  main: {
    display: 'grid',
    gridTemplateColumns: 'repeat(48, [col] 1fr)',
    gridTemplateRows: '4rem 4rem 3rem 0.5fr 1fr 0.3fr'
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
    fontSize: '1rem',
    flexFlow: 'column',
    padding: '1rem 1rem 1rem 0'
  },
  centerText: {
    textAlign: 'center'
  },
  cellDescription: {
    fontSize: '1rem'
  },
  cellColor: {
    background: '#F5F7F8'
  },
  divider: {
    gridColumn: '2 / 48'
  },
  fullWidth: {
    gridColumn: '1 / 49'
  },
  fab: {
    gridColumn: '3 / 5',
    background: '#EEF2F5',
    boxShadow: 'none',
    marginRight: '1em'
  },
  fabText: {
    fontWeight: 500,
    fontSize: '1.2rem'
  },
  fabLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    marginTop: '2rem',
    gridColumn: '3 / 18'
  },
  tableTitle: {
    color: '#939BA1',
    fontSize: '1.2rem',
    gridColumn: '2 / 49'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.4)',
    fontSize: '0.9rem',
    gridRow: '4 / 5'
  },
  headerName: {
    gridColumn: '3 / 12'
  },
  nameSpacer: {
    gridColumn: '2 / 3'
  },
  cellName: {
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
    gridColumn: '40 / 44'
  },
  readMore: {
    gridColumn: '44 / 48',
    fontSize: '0.94rem',
    textDecoration: 'none'
  },
  usdValue: {
    color: '#939BA1'
  }
})
export default styles
