import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom';
import Home from './Home';
import About from './About';
import Studio from './Studio';

ReactDOM.render(
  <BrowserRouter>
    <div className="App">
      <nav>
        <Link to="/"><img src="/icons/home.svg" alt="home icon" /></Link>
        <Link to="/studio"><img src="/icons/studio.svg" alt="studio icon" /></Link>
        <Link to="/about"><img src="/icons/info.svg" alt="info icon" /></Link>
      </nav>
      <Switch>
        <Route path="/studio"><Studio /></Route>
        <Route path="/about"><About /></Route>
        <Route path="/"><Home /></Route>
      </Switch>
    </div>
  </BrowserRouter>,
  document.querySelector('#root'),
);
