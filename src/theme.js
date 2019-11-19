import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
  typography: {
    useNextVariants: true,
    fontFamily: ['Inter', '-apple-system', 'BlinkMacSystemFont', "Segoe UI", 'Roboto', "Helvetica Neue", 'Arial', "Noto Sans", 'sans-serif', "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"].join(','),
  },
  breakpoints: {
    values: {
      md: 860
    }
  },
  palette: {
    primary: {
      500: '#1AA56E',
      hov: '#137C53',
      A500: '#1AA56E33'
    },
    common: {
      grey: '#F5F7F8',
      darkGrey: '#939BA1'
    },
    text: {
      grey: '#939BA1'
    },
    action: {
      disabledBackground: '#FAFAFA'
    }
  }
});
