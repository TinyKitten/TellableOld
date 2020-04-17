import React, { memo, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/app';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import Peer, { MediaConnection } from 'skyway-js';
import { Helmet } from 'react-helmet';
import { User } from '../../models/user';
import ErrorPage from '../Error';
import { ERR_USER_NOT_FOUND } from '../../constants/error';
import RoomUI from './ui';
import Loading from '../../components/Loading';
import { StoredSession } from '../../models/storedSession';
import { stopLocalStream } from '../../utils/stopLocalStream';
import { getLocalStream } from '../../utils/getLocalStream';

const RoomPage: React.FC = () => {
  const [authUser, authUserLoading, authUserError] = useAuthState(firebase.auth());
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [error, setError] = useState<Error>();
  const [peer, setPeer] = useState<Peer | null>(null);
  const [existingCall, setExistingCall] = useState<MediaConnection>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [remoteUser, setRemoteUser] = useState<User>();
  const [localUser, setLocalUser] = useState<User>();
  const { id } = useParams();
  const [storedSession, setStoredSession] = useState<StoredSession>();

  const initializeRemoteUser = useCallback(async () => {
    if (!id) {
      return;
    }
    const usersRef = firebase.firestore().collection('users');
    const query = usersRef.where('uniqueId', '==', id);
    const snapshot = await query.get();
    if (!snapshot.docs.length) {
      setError(new Error(ERR_USER_NOT_FOUND));
      return;
    }
    const doc = snapshot.docs[0];
    setRemoteUser(doc.data() as User);
  }, [id]);

  const fetchLocalUser = useCallback(async () => {
    const userQuery = firebase.firestore().collection('users').doc(authUser?.uid);
    const userQuerySnapshot = await userQuery.get();
    const storedUser = userQuerySnapshot.data() as User;
    setLocalUser(storedUser);
  }, [authUser]);

  const initializePeer = useCallback(() => {
    if (!localUser || peer) {
      return;
    }
    const p = new Peer(localUser.uniqueId, {
      key: process.env.REACT_APP_SKWAY_API_KEY as string,
    });
    setPeer(p);

    p.on('error', (err) => {
      // TODO: エラー処理
      if (localStream) {
        stopLocalStream(localStream);
      }
      setError(err);
    });
  }, [localUser, peer, localStream]);

  const updateStoredSession = useCallback(
    (remoteId?: string) => {
      const doc = firebase.firestore().collection('sessions').doc(id);
      doc.update({
        caller: remoteId || null,
      });
    },
    [id],
  );

  const handleCallClick = useCallback(async () => {
    if (!peer || !id) {
      return;
    }
    try {
      const ls = await getLocalStream();
      setLocalStream(ls);
      const call = peer.call(id, ls);
      setExistingCall(call);
      if (!call) {
        return;
      }
      call.on('error', (err) => {
        setError(err);
      });
      call.on('stream', (stream: MediaStream) => {
        setRemoteStream(stream);
      });
      call.on('close', () => {
        setRemoteStream(undefined);
        /*
      this.setState({
        modalTitle: 'お知らせ',
        modalContent: '通話が終了しました。',
        modalOpen: true,
      });
      */
      });
    } catch (err) {
      setError(err);
    }
  }, [peer, id]);

  const handleHangUp = useCallback(() => {
    existingCall?.close();
    setExistingCall(undefined);
    updateStoredSession();
  }, [existingCall, setExistingCall, updateStoredSession]);

  const fetchCalling = useCallback(() => {
    firebase
      .firestore()
      .collection('sessions')
      .doc(id)
      .onSnapshot((doc) => {
        const session = doc.data() as StoredSession;
        if (!session?.caller) {
          setRemoteStream(undefined);
        }
        setStoredSession(session);
      });
  }, [id]);

  useEffect(() => {
    fetchLocalUser();
    initializeRemoteUser();
    getLocalStream();
  }, [fetchLocalUser, initializeRemoteUser]);

  useEffect(() => {
    fetchCalling();
  }, [fetchCalling]);

  useEffect(() => {
    initializePeer();
  }, [localUser, initializePeer]);

  const handleError = useCallback((err: Error) => setError(err), []);

  if (!id) {
    return <ErrorPage message="部屋IDを指定してください。" />;
  }

  if (error?.message === ERR_USER_NOT_FOUND) {
    return <ErrorPage message="部屋IDが見つかりませんでした。" />;
  }

  if (!peer || authUserLoading) {
    return <Loading />;
  }

  if (error || authUserError) {
    return <ErrorPage message="エラーが発生しました。" />;
  }

  return (
    <div>
      {storedSession?.caller && remoteUser ? (
        <Helmet>
          <title>
            {remoteUser.displayName}
            さんと通話中 - Tellable
          </title>
        </Helmet>
      ) : (
        <Helmet>
          <title>Tellable</title>
        </Helmet>
      )}
      <RoomUI
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        remoteId={storedSession?.caller}
        micConnected={!!localStream}
        onHangUp={handleHangUp}
        onCallClick={handleCallClick}
        onError={handleError}
      />
    </div>
  );
};

export default memo(RoomPage);
