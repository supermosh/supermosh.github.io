import React from 'react';
import ReactDOM from 'react-dom';
import './track';
import App from './App';
import { setup } from './db';

(async () => {
  await setup();
  ReactDOM.render(<App />, document.querySelector('#root'));
})();
