import indigo from '@material-ui/core/colors/indigo'
import blueGrey from '@material-ui/core/colors/blueGrey'

const styles = {
  card: {
    borderRadius: '0px',
    borderTopStyle: 'groove',
    borderBottom: '1px solid lightgray',
    backgroundColor: indigo[50]
  },
  container: {
    height: '35%'
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  amount: {
    backgroundColor: blueGrey[50]
  }
}

export default styles
