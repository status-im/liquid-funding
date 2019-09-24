import React, { StrictMode } from 'react';
import { unstable_createRoot as createRoot} from 'react-dom';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import database from './db';
import App from './dapp';
import * as serviceWorker from './serviceWorker';

import './css/fonts/Inter/inter.css'

const theme = createMuiTheme({
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
    primary: { 500: '#4360DF' },
    common: {
      grey: '#F5F7F8'
    },
    text: {
      grey: '#939BA1'
    },
    action: {
      disabledBackground: '#FAFAFA'
    }
  }
});

createRoot(document.getElementById('app')).render(
  <DatabaseProvider database={database}>
    <MuiThemeProvider theme={theme}>
      <StrictMode>
        <App/>
      </StrictMode>
    </MuiThemeProvider>
  </DatabaseProvider>
).then(() => {
  document.getElementById('preload').remove()
});
serviceWorker.register()
