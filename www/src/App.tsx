import React, { useEffect } from 'react';
import { BrowserRouter, Switch, Route, Link, useLocation } from 'react-router-dom';
import mixpanel from 'mixpanel-browser';
import Home from './Home';
import About from './About';
import Studio from './Studio';

const Main = () => {
  const location = useLocation();

  useEffect(() => {
    mixpanel.track('navigation', { pathname: location.pathname });
  }, [location]);

  return (
    <div className="App">
      <nav>
        <Link to="/" title="Home"><img src="/icons/home.svg" alt="home icon" /></Link>
        <Link to="/studio" title="Studio"><img src="/icons/studio.svg" alt="studio icon" /></Link>
        <Link to="/about" title="About"><img src="/icons/info.svg" alt="info icon" /></Link>
      </nav>
      <Switch>
        <Route path="/studio"><Studio /></Route>
        <Route path="/about"><About /></Route>
        <Route path="/"><Home /></Route>
      </Switch>
    </div>
  );
};

export default () => (
  <BrowserRouter>
    <Main />
  </BrowserRouter>
);
