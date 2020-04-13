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
      call.on('stream', (stream) => {
        setRemoteStream(stream);
      });
      call.on('close', () => {
        setRemoteUser(undefined);
        setExistingCall(existingCall);
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
    existingCall?.close();
    setExistingCall(undefined);
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
    const query = firebase.firestore().collection('users').doc(authUser?.uid);
    const snapshot = await query.get();
    setUser(snapshot.data() as User);
  }, []);

  const awaitInitializeLocalUser = useCallback(async (): Promise<void> => {
    await fetchLocalUser();
  }, []);

  useEffect(() => {
    awaitInitializeLocalUser();
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
    return <ErrorPage message="エラーが発生しました。" />;
  }

  if (!user || !authUser || authUserLoading) {
    return <Loading />;
  }

  return (
    <div>
      {existingCall?.open && remoteUser ? (
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
        calling={existingCall?.open || false}
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
