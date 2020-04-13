import React, { memo, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase/app';
import Peer, { MediaConnection } from 'skyway-js';
import { Helmet } from 'react-helmet';
import { User } from '../../models/user';
import ErrorPage from '../Error';
import { ERR_COULD_NOT_GET_LOCAL_STREAM, ERR_USER_NOT_FOUND } from '../../constants/error';
import RoomUI from './ui';
import { useParams } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useAuthState } from 'react-firebase-hooks/auth';

const RoomPage = (): React.ReactElement => {
  const [authUser, authUserLoading, authUserError] = useAuthState(firebase.auth());
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [error, setError] = useState<Error>();
  const [peer, setPeer] = useState<Peer | null>(null);
  const [existingCall, setExistingCall] = useState<MediaConnection>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [remoteUser, setRemoteUser] = useState<User>();
  const [muted, setMuted] = useState(false);
  const [localUser, setLocalUser] = useState<User>();
  const { id } = useParams();

  const initializeLocalStream = useCallback(async () => {
    if (localStream) {
      return Promise.resolve(localStream);
    }
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
    Promise.reject(err);
  }, [remoteUser]);

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
  }, []);

  const fetchLocalUser = useCallback(async () => {
    const query = firebase.firestore().collection('users').doc(authUser?.uid);
    const snapshot = await query.get();
    setLocalUser(snapshot.data() as User);
  }, []);

  const awaitInitializeLocalUser = useCallback(async (): Promise<void> => {
    await fetchLocalUser();
  }, []);

  const stopLocalStream = useCallback(() => {
    if (localStream) {
      const tracks = localStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    }
  }, [localStream]);

  const initializePeer = useCallback(() => {
    if (!localUser) {
      return;
    }
    const p = new Peer(localUser.uniqueId, {
      key: process.env.REACT_APP_SKWAY_API_KEY as string,
    });
    setPeer(p);

    p.on('error', (err) => {
      // TODO: エラー処理
      stopLocalStream();
      setError(err);
    });
  }, [localUser]);

  const handleCallClick = useCallback(async () => {
    if (!peer || !id) {
      return;
    }
    try {
      const ls = await initializeLocalStream();
      const call = peer.call(id, ls);
      setExistingCall(call);
      call.on('stream', (stream: MediaStream) => {
        setRemoteStream(stream);
        setExistingCall(call);
      });
      call.on('close', () => {
        setExistingCall(existingCall);
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
  }, [peer, localStream, existingCall]);

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

  const initialize = useCallback(async () => {
    initializePeer();
  }, [localUser]);

  const awaitInitializeRemoteUser = useCallback(async (): Promise<void> => {
    await initializeRemoteUser();
  }, []);

  useEffect(() => {
    awaitInitializeLocalUser();
    awaitInitializeRemoteUser();
  }, []);

  useEffect(() => {
    initialize();

    return (): void => {
      stopLocalStream();
      if (peer) {
        peer.disconnect();
      }
    };
  }, [remoteUser]);

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
      {existingCall?.remoteId ? (
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
      <RoomUI
        remoteStream={remoteStream}
        remoteUser={remoteUser}
        calling={!!existingCall?.remoteId || false}
        micConnected={!!localStream}
        onHangUp={handleHangUp}
        muted={muted}
        toggleLocalMic={toggleLocalMic}
        onCallClick={handleCallClick}
        onError={handleError}
      />
    </div>
  );
};

export default memo(RoomPage);
