import React, { memo, useEffect, useState, useCallback } from 'react';
import firebase from 'firebase';
import Peer, { MediaConnection } from 'skyway-js';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
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
  const [user, userLoading, userError] = useDocumentDataOnce<User>(
    firebase.firestore().collection('users').doc(authUser?.uid),
  );
  const [peer, setPeer] = useState<Peer | null>(null);
  const [existingCall, setExistingCall] = useState<MediaConnection>();
  const [remoteStream, setRemoteStream] = useState<MediaStream>();
  const [remoteUser, setRemoteUser] = useState<User>();
  const [muted, setMuted] = useState(false);

  const initializeLocalStream = useCallback(async () => {
    if (navigator.mediaDevices) {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      setLocalStream(localStream);
      return;
    }
    // MediaDevicesを取得できない
    const err = new Error(ERR_COULD_NOT_GET_LOCAL_STREAM);
    setError(err);
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
      console.error(err);
      // TODO: エラー処理
      stopLocalStream();
    });

    p.on('call', (call: MediaConnection) => {
      if (existingCall) {
        return;
      }
      setExistingCall(call);
      call.answer(localStream);
      call.on('stream', (stream) => {
        setRemoteStream(stream);
        fetchRemoteUser(call.remoteId);
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
  }, []);

  const handleHangUp = useCallback(() => {
    existingCall?.close();
  }, [existingCall]);

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
        const t = track;
        t.enabled = false;
        return t;
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
  }, [muted]);

  useEffect(() => {
    Promise.all([initializeLocalStream(), initializePeer()]);

    return (): void => {
      stopLocalStream();
      if (peer) {
        peer.disconnect();
      }
    };
  }, []);

  if (authUserLoading || userLoading) {
    return <Loading />;
  }

  if (error || authUserError || userError) {
    return <ErrorPage message="エラーが発生しました。" />;
  }

  return (
    <div>
      {existingCall && existingCall.open && remoteUser ? (
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
      />
    </div>
  );
};

export default memo(MyRoomPage);
