import React from 'react';
import { render } from 'react-dom';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import database from './db';
import App from './dapp';

render(
  <DatabaseProvider database={database}>
    <App />
  </DatabaseProvider>, document.getElementById('app')
);
