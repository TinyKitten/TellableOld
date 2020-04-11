import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { HomeScreen } from './pages/Home';

export const AppRouter = (): React.ReactElement => (
  <Router>
    <Switch>
      <Route path="/">
        <HomeScreen />
      </Route>
    </Switch>
  </Router>
);
