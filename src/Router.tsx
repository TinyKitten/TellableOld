import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import firebase from 'firebase/app';
import HomeScreen from './pages/Home';
import WelcomeScreen from './pages/Welcome';
import AuthContainer from './containers/Auth';
import Header from './components/Header';
import Loading from './components/Loading';
import MyRoom from './pages/MyRoom';
import Room from './pages/Room';
import ErrorPage from './pages/Error';

export const AppRouter: React.FC = () => {
  const [user, initialising, error] = useAuthState(firebase.auth());

  if (error) {
    return <ErrorPage message="初期化エラーが発生しました。" />;
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
          <Route exact path="/welcome">
            <WelcomeScreen />
          </Route>
          <AuthContainer user={user}>
            <Route exact path="/myroom">
              <MyRoom />
            </Route>
            <Route exact path="/room/:id">
              <Room />
            </Route>
            <Route exact path="/room">
              <Room />
            </Route>
            <Route exact path="/">
              <HomeScreen />
            </Route>
          </AuthContainer>
        </Switch>

        <div className="sw-update-dialog" />
      </>
    </Router>
  );
};
