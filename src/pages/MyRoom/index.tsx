import React, { memo, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/app';
import Peer, { MediaConnection } from 'skyway-js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Helmet } from 'react-helmet';
import { User } from '../../models/user';
import ErrorPage from '../Error';
import { ERR_COULD_NOT_GET_LOCAL_STREAM, ERR_USER_NOT_FOUND } from '../../constants/error';
import MyRoomUI from './ui';
import Loading from '../../components/Loading';
import { StoredSession } from '../../models/storedSession';

const MyRoomPage = (): React.ReactElement => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [error, setError] = useState<Error>();
  const [authUser, authUserLoading, authUserError] = useAuthState(firebase.auth());
  const [peer, setPeer] = useState<Peer | null>(null);
  const [existingCall, setExistingCall] = useState<MediaConnection>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [remoteUser, setRemoteUser] = useState<User>();
  const [muted, setMuted] = useState(false);
  const [user, setUser] = useState<User>();
  const [storedSession, setStoredSession] = useState<StoredSession>();

  const initializeLocalStream = useCallback(async () => {
    if (navigator.mediaDevices) {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setLocalStream(localStream);
      return Promise.resolve(localStream);
    }
    // MediaDevicesを取得できない
    const err = new Error(ERR_COULD_NOT_GET_LOCAL_STREAM);
    setError(err);
    return Promise.reject(err);
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
  }, [localStream]);

  const updateStoredSession = useCallback(
    async (calling: boolean) => {
      if (!user) {
        return;
      }
      const doc = firebase.firestore().collection('sessions').doc(user.uniqueId);
      doc.set({
        calling,
      });
    },
    [user],
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
    if (!user) {
      return;
    }
    const p = new Peer(user.uniqueId, {
      key: process.env.REACT_APP_SKWAY_API_KEY as string,
    });
    setPeer(p);

    p.on('error', (err) => {
      // TODO: エラー処理
      /*
      this.setState({
        modalTitle: 'エラー',
        modalContent: 'サーバー接続中にエラーが発生しました。リロードしてください。',
        modalOpen: true,
      });
      */
      stopLocalStream();
      setError(err);
    });

    p.on('call', async (call: MediaConnection) => {
      setExistingCall(call);
      const ls = await initializeLocalStream();
      call.answer(ls);
      fetchRemoteUser(call.remoteId);
      updateStoredSession(true);
      call.on('stream', (stream) => {
        setRemoteStream(stream);
      });
      call.on('close', () => {
        setRemoteUser(undefined);
        setRemoteStream(undefined);
        /*
        this.setState({
          modalTitle: 'お知らせ',
          modalContent: '通話が終了しました。',
          modalOpen: true,
        });
        */
      });
    });
  }, [user]);

  const handleHangUp = (): void => {
    if (!existingCall) {
      return;
    }
    existingCall.close();
    setExistingCall(undefined);
    updateStoredSession(false);
  };

  const unmuteLocalMic = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = true;
        return track;
      });
      setMuted(false);
    }
  }, [localStream]);
  const muteLocalMic = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
        track.enabled = false;
        return track;
      });
      setMuted(true);
    }
  }, [localStream]);

  const toggleLocalMic = useCallback(() => {
    if (muted) {
      unmuteLocalMic();
    } else {
      muteLocalMic();
    }
  }, [muted, unmuteLocalMic, muteLocalMic]);

  const fetchLocalUser = useCallback(async () => {
    const userQuery = firebase.firestore().collection('users').doc(authUser?.uid);
    const userQuerySnapshot = await userQuery.get();
    const storedUser = userQuerySnapshot.data() as User;
    setUser(storedUser);
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
  }, []);

  const awaitInitialize = useCallback(async (): Promise<void> => {
    await fetchLocalUser();
    await initializeLocalStream();
  }, []);

  useEffect(() => {
    awaitInitialize();

    return (): void => {
      updateStoredSession(false);
    };
  }, []);

  const initialize = useCallback(async () => {
    await Promise.all([initializeLocalStream(), initializePeer()]);
  }, [initializeLocalStream, initializePeer]);

  useEffect(() => {
    initialize();

    return (): void => {
      stopLocalStream();
      if (peer) {
        peer.disconnect();
      }
    };
  }, [user]);

  const handleError = useCallback((err: Error) => setError(err), []);

  if (error || authUserError) {
    console.error(error);
    return <ErrorPage message="エラーが発生しました。" />;
  }

  if (!user || !authUser || authUserLoading) {
    return <Loading />;
  }

  return (
    <div>
      {storedSession?.calling && remoteUser ? (
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
      <MyRoomUI
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        calling={storedSession?.calling || false}
        micConnected={!!localStream}
        onHangUp={handleHangUp}
        muted={muted}
        toggleLocalMic={toggleLocalMic}
        onError={handleError}
      />
    </div>
  );
};

export default memo(MyRoomPage);
