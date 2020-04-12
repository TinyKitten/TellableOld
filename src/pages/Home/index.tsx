import React, { memo, useState, useEffect, useCallback } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import firebase from 'firebase/app';
import { useHistory } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocument } from 'react-firebase-hooks/firestore';
import Hashids from 'hashids';
import styles from './styles.module.css';
import Loading from '../../components/Loading';

const HomeScreen = (): React.ReactElement => {
  const [updateError, setUpdateError] = useState<Error>();
  const [copied, setCopied] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const history = useHistory();
  const [user, initialising, fbAuthError] = useAuthState(firebase.auth());
  const [firestoreUser, userLoading, fbFirestoreDocError] = useDocument(
    firebase.firestore().collection('users').doc(user?.uid),
  );

  const handleRegenerate = useCallback(async () => {
    const randomInt = (): number => Math.floor(Math.random() * Math.floor(9));
    const h = new Hashids(user?.uid);
    const uniqueId = h.encode(randomInt(), randomInt(), randomInt());
    try {
      await firestoreUser?.ref.update({ uniqueId });
      setUniqueId(uniqueId);
      console.log(uniqueId);
    } catch (err) {
      setUpdateError(err);
    }
  }, [firestoreUser, user]);

  const initializeUser = useCallback(async () => {
    const randomInt = (): number => Math.floor(Math.random() * Math.floor(9));
    const h = new Hashids(user?.uid);
    const uniqueId = h.encode(randomInt(), randomInt(), randomInt());
    try {
      firestoreUser?.ref.set({
        uniqueId,
      });
      setUniqueId(uniqueId);
    } catch (err) {
      setUpdateError(err);
    }
  }, [firestoreUser, user]);

  useEffect(() => {
    const storedUniqueId: string | undefined = firestoreUser?.get('uniqueId');
    if (!storedUniqueId) {
      initializeUser();
      return;
    }
    setUniqueId(storedUniqueId);
  }, [firestoreUser, initializeUser]);

  const handleCopy = (): void => setCopied(true);
  const pushToMyRoom = (): void => history.push('/myroom');

  const roomUrl = `https://tellable.online/room/${uniqueId}`;
  // eslint-disable-next-line max-len
  const tweetUrl = `https://twitter.com/intent/tweet?text=Tellableで通話しよう！ ${roomUrl}&hashtags=TellableOnline,テラブル`;

  if (fbAuthError || fbFirestoreDocError || updateError) {
    return <h1>Error!</h1>;
  }

  if (initialising || userLoading) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>お友達を通話に招待しよう</h1>
        {copied ? (
          <p className={styles.notice}>コピーしました。</p>
        ) : (
          <p className={styles.notice}>&nbsp;</p>
        )}
        <CopyToClipboard text={roomUrl} onCopy={handleCopy}>
          <div className={styles.address} data-testid="url-container">
            {uniqueId ? (
              <span data-testid="url">{roomUrl}</span>
            ) : (
              <span data-testid="loading">LOADING...</span>
            )}
            <span className={styles.helperText}>CLICK TO COPY</span>
          </div>
        </CopyToClipboard>
        <p className={styles.disclaimer}>
          このURLをあなたの通話相手にお知らせください。
          <br />
          <b>通話相手と関係ない相手には伝えないでください。</b>
          <br />
          知らない相手と通話することになります。
        </p>
        <a
          href={tweetUrl}
          role="button"
          className={styles.shareLink}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="twitter"
        >
          Twitterでシェア
        </a>
        <button
          data-testid="regenerate-button"
          type="button"
          onClick={handleRegenerate}
          className={styles.btn}
        >
          URL再生成
        </button>
        <button type="button" onClick={pushToMyRoom} className={styles.btn}>
          自分の部屋に行く
        </button>
      </div>
    </div>
  );
};

export default memo(HomeScreen);
