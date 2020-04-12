import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase/app';
import HomeScreen from './pages/Home';
import WelcomeScreen from './pages/Welcome';
import AuthContainer from './containers/Auth';
import Header from './components/Header';
import Loading from './components/Loading';

export const AppRouter = (): React.ReactElement => {
  const [user, initialising, error] = useAuthState(firebase.auth());

  if (error) {
    return <h1>An error occurred.</h1>;
  }

  if (initialising) {
    return <Loading />;
  }

  const handleLogoutClick = (): void => {
    firebase.auth().signOut();
  };

  return (
    <Router>
      <>
        <Header isLoggedIn={!!user} onLogoutClick={handleLogoutClick} />

        <Switch>
          <Route path="/welcome">
            <WelcomeScreen />
          </Route>
          <AuthContainer user={user}>
            <Route path="/">
              <HomeScreen />
            </Route>
          </AuthContainer>
        </Switch>
      </>
    </Router>
  );
};