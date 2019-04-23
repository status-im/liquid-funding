import React from 'react';
import { render } from 'react-dom';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import EmbarkJS from './embarkArtifacts/embarkjs'
import database from './db';
import App from './dapp';
console.log(EmbarkJS);

render(
  <DatabaseProvider database={database}>
    <App />
  </DatabaseProvider>, document.getElementById('app')
);
