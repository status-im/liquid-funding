import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  addIcon: {
    color: theme.palette.primary[500],
    fontSize: '2.5em'
  },
  blue: {
    color: '#4360DF'
  },
  green: {
    color: theme.palette.primary[500]
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
    fontSize: '2rem',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      fontSize: '2.5rem'
    }
  },
  subTitle: {
    color: '#4360DF',
    fontSize: '1rem',
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      fontSize: '1.5rem'
    }
  },
  cardText: {
    gridColumn: '1 / 49',
    lineHeight: '2rem',
    padding: '0.25rem 1rem',
    color: '#000000'
  },
  cardTitle: {
    fontWeight: 500,
    paddingTop: '1rem'
  },
  cardSubTitle: {
    lineHeight: '1.5rem'
  },
  cardLightText: {
    color: '#545353'
  },
  cardAmount: {
    gridColumn: '1 / 36'
  },
  cardMore: {
    gridColumn: '36 / 49',
  },
  cellText: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '1rem',
    flexFlow: 'column',
    padding: '1rem 1rem 1rem 0',
    color: '#000000'
  },
  centerText: {
    textAlign: 'center'
  },
  cardLink: {
    textDecoration: 'none'
  },
  leftAlign: {
    textAlign: 'left'
  },
  cellDescription: {
    fontSize: '1rem',
    textDecoration: 'none'
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
    background: '#1AA56E1A',
    boxShadow: 'none',
    marginRight: '1em'
  },
  fabText: {
    color: theme.palette.primary[500],
    fontWeight: 500,
    fontSize: '1.2rem'
  },
  fabLink: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    marginTop: '2rem',
    gridColumn: '3 / 18',
    color: '#000000'
  },
  fabSmall: {
    gridColumn: '3 / 48'
  },
  paddingNone: {
    padding: 0
  },
  tableTitle: {
    color: '#939BA1',
    fontSize: '1.2rem',
    gridColumn: '2 / 49'
  },
  tableTitleSmall: {
    color: '#000000',
    fontSize: '1.2rem',
    gridColumn: '1 / 49',
    textAlign: 'center'
  },
  tableHeader: {
    color: 'rgba(147, 155, 161, 0.8)',
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
  previousButton: {
    gridColumn: '1 / 20',
    [theme.breakpoints.up('md')]: {
      gridColumn: '3 / 9'
    }
  },
  nextButton: {
    gridColumn: '35 / 48',
    [theme.breakpoints.up('md')]: {
      gridColumn: '42 / 48'
    }
  },
  readMore: {
    gridColumn: '44 / 48',
    fontSize: '0.94rem',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
      color: theme.palette.primary[500]
    }
  },
  usdValue: {
    color: '#939BA1'
  }
}))
export default useStyles
