import React, { memo, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/app';
import Peer, { MediaConnection } from 'skyway-js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Helmet } from 'react-helmet';
import { User } from '../../models/user';
import ErrorPage from '../Error';
import { ERR_USER_NOT_FOUND } from '../../constants/error';
import MyRoomUI from './ui';
import Loading from '../../components/Loading';
import { StoredSession } from '../../models/storedSession';
import { getLocalStream } from '../../utils/getLocalStream';

const MyRoomPage: React.FC = () => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [error, setError] = useState<Error>();
  const [authUser, authUserLoading, authUserError] = useAuthState(firebase.auth());
  const [existingCall, setExistingCall] = useState<MediaConnection>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [remoteUser, setRemoteUser] = useState<User>();
  const [uniqueId, setUniqueId] = useState<string>();
  const [storedSession, setStoredSession] = useState<StoredSession>();

  const initializeLocalStream = useCallback(async () => {
    try {
      const ls = await getLocalStream();
      setLocalStream(ls);
    } catch (err) {
      setError(err);
    }
  }, []);

  const updateStoredSession = useCallback(
    async (calling: boolean) => {
      if (!uniqueId) {
        return;
      }
      const doc = firebase.firestore().collection('sessions').doc(uniqueId);
      doc.set({
        calling,
      });
    },
    [uniqueId],
  );

  const fetchRemoteUser = useCallback(async (uniqueId: string) => {
    const usersRef = firebase.firestore().collection('users');
    const query = usersRef.where('uniqueId', '==', uniqueId);
    const snapshot = await query.get();
    if (!snapshot.docs.length) {
      setError(new Error(ERR_USER_NOT_FOUND));
      return;
    }
    const doc = snapshot.docs[0];
    setRemoteUser(doc.data() as User);
  }, []);

  const initializePeer = useCallback(() => {
    if (!uniqueId) {
      return;
    }
    const p = new Peer(uniqueId, {
      key: process.env.REACT_APP_SKWAY_API_KEY as string,
    });

    p.on('error', (err) => {
      // TODO: エラー処理
      /*
      this.setState({
        modalTitle: 'エラー',
        modalContent: 'サーバー接続中にエラーが発生しました。リロードしてください。',
        modalOpen: true,
      });
      */
      setError(err);
    });

    p.on('call', async (call: MediaConnection) => {
      setExistingCall(call);
      const ls = await getLocalStream();
      call.answer(ls);
      fetchRemoteUser(call.remoteId);
      updateStoredSession(true);
      call.on('stream', (stream) => {
        setRemoteStream(stream);
      });
      call.on('close', () => {
        setRemoteUser(undefined);
        /*
        this.setState({
          modalTitle: 'お知らせ',
          modalContent: '通話が終了しました。',
          modalOpen: true,
        });
        */
      });
    });
  }, [uniqueId, fetchRemoteUser, updateStoredSession]);

  const handleHangUp = useCallback(() => {
    if (!existingCall) {
      return;
    }
    existingCall.close();
    setExistingCall(undefined);
    updateStoredSession(false);
  }, [existingCall, setExistingCall, updateStoredSession]);

  const fetchLocalUser = useCallback(async () => {
    const userQuery = firebase.firestore().collection('users').doc(authUser?.uid);
    const userQuerySnapshot = await userQuery.get();
    const storedUser = userQuerySnapshot.data() as User;
    setUniqueId(storedUser.uniqueId);
    firebase
      .firestore()
      .collection('sessions')
      .doc(storedUser.uniqueId)
      .onSnapshot((doc) => {
        const session = doc.data() as StoredSession;
        if (!session?.calling) {
          setRemoteUser(undefined);
          setRemoteStream(undefined);
        }
        setStoredSession(session);
      });
  }, [authUser]);

  useEffect(() => {
    fetchLocalUser();
    initializeLocalStream();
    initializePeer();
  }, [fetchLocalUser, initializePeer, initializeLocalStream]);

  const handleError = useCallback((err: Error) => setError(err), []);

  if (error || authUserError) {
    return <ErrorPage message="エラーが発生しました。" />;
  }

  if (!uniqueId || !authUser || authUserLoading) {
    return <Loading />;
  }

  return (
    <div>
      {storedSession?.calling && remoteUser ? (
        <Helmet>
          <title>
            {remoteUser?.displayName}
            さんと通話中 - Tellable
          </title>
        </Helmet>
      ) : (
        <Helmet>
          <title>Tellable</title>
        </Helmet>
      )}
      <MyRoomUI
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        calling={storedSession?.calling || false}
        micConnected={!!localStream}
        onHangUp={handleHangUp}
        onError={handleError}
      />
    </div>
  );
};

export default memo(MyRoomPage);
