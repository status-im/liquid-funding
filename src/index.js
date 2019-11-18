import React, { StrictMode } from 'react';
import { unstable_createRoot as createRoot} from 'react-dom';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import {MuiThemeProvider} from '@material-ui/core/styles';
import theme from './theme';
import database from './db';
import App from './dapp';
import * as serviceWorker from './serviceWorker';

import './css/fonts/Inter/inter.css'

createRoot(document.getElementById('app')).render(
  <DatabaseProvider database={database}>
    <MuiThemeProvider theme={theme}>
      <StrictMode>
        <App/>
      </StrictMode>
    </MuiThemeProvider>
  </DatabaseProvider>
).then(() => {
  document.getElementById('loading').remove()
});
serviceWorker.register()
