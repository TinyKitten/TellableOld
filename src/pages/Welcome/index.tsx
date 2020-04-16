import React, { useState, useEffect, memo } from 'react';
import firebase from 'firebase/app';
import { useAuthState } from 'react-firebase-hooks/auth';
import styles from './styles.module.css';
import MockImg from '../../assets/mock.png';
import { useHistory } from 'react-router-dom';
import Loading from '../../components/Loading';
import ErrorPage from '../Error';

const WelcomeScreen: React.FC = () => {
  const [error, setError] = useState<Error | firebase.auth.Error>();
  const history = useHistory();
  const [user, initialising, authStateError] = useAuthState(firebase.auth());

  useEffect(() => {
    if (user) {
      history.replace('/');
    }
  }, [history, user]);

  const handleSignIn = (): void => {
    const provider = new firebase.auth.TwitterAuthProvider();
    firebase
      .auth()
      .signInWithRedirect(provider)
      .catch((err) => {
        setError(err);
      });
  };

  if (error || authStateError) {
    return <ErrorPage message={error?.message || '予期しないエラーが発生しました。'} />;
  }

  if (initialising) {
    return <Loading />;
  }

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <img className={styles.mock} src={MockImg} alt="Tellable" />
        <div className={styles.texts}>
          <h2 className={styles.title}>Tellable</h2>
          <p className={styles.description}>フォロワーと、気軽に通話しよう。</p>
          <button onClick={handleSignIn} type="button" className={styles.loginBtn}>
            Twitterでログイン
          </button>
        </div>
      </div>
      <footer className={styles.appFooter}>
        <span> &copy; 2020 TinyKitten</span>
      </footer>
    </section>
  );
};

export default memo(WelcomeScreen);
