import React from 'react';
import ReactDOM from 'react-dom';
import mixpanel from 'mixpanel-browser';
import App from './App';
import { setup } from './db';

(async () => {
  mixpanel.init('eaea796d6217c6d87165d71ff1a82e0b', { debug: true });
  mixpanel.track('start');

  await setup();
  ReactDOM.render(<App />, document.querySelector('#root'));
})();
