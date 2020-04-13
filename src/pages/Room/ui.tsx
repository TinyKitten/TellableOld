import React, { useEffect, useRef, memo, useCallback } from 'react';
import { User } from '../../models/user';
import styles from './styles.module.css';
import CallingAvatar from '../../components/CallingAvatar';
import CallButton from '../../components/CallButton';
import MicMuteButton from '../../components/MicMuteButton';

type Props = {
  micConnected: boolean;
  remoteStream?: MediaStream;
  remoteUser?: User;
  calling: boolean;
  onHangUp: () => void;
  muted: boolean;
  toggleLocalMic: () => void;
  onCallClick: () => void;
  onError: (err: Error) => void;
};

const RoomUI = ({
  micConnected,
  remoteStream,
  calling,
  remoteUser,
  onHangUp,
  muted,
  toggleLocalMic,
  onCallClick,
  onError,
}: Props): React.ReactElement => {
  const getRemoteUserName = (remoteUser?: User): string =>
    remoteUser?.displayName || '通話相手なし';
  const getCallState = (calling: boolean): string => (calling ? '通話中' : '通話していません');
  const getMicError = (connected: boolean): string =>
    connected ? '' : 'マイクの使用を許可してください。';
  const audioElement = useRef<HTMLMediaElement>(null);

  const playStream = useCallback(async () => {
    if (!remoteStream && audioElement.current) {
      audioElement.current.pause();
    }
    if (remoteStream && audioElement.current) {
      audioElement.current.srcObject = remoteStream || null;
      try {
        await audioElement.current.play();
      } catch (err) {
        onError(err);
      }
    }
  }, [remoteStream, audioElement]);

  useEffect(() => {
    playStream();
  }, [remoteStream, audioElement]);

  const handleCallButtonClick = useCallback(() => (calling ? onHangUp() : onCallClick()), [
    calling,
  ]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <CallingAvatar calling={calling} user={remoteUser} />
        <p data-testid="remote-user-name" className={styles.remoteScreenName}>
          {getRemoteUserName(remoteUser)}
        </p>
        <p data-testid="call-state" className={styles.callState}>
          {getCallState(calling)}
        </p>
        <p data-testid="mic-connection-error" className={styles.error}>
          {getMicError(micConnected)}
        </p>

        <div className={styles.buttons}>
          <CallButton calling={calling} onClick={handleCallButtonClick} />
          {calling ? <MicMuteButton muted={muted} onClick={toggleLocalMic} /> : null}
        </div>
      </div>
      {/*無音*/}
      <audio src="/silence.mp3" autoPlay playsInline>
        <track kind="captions" src="seminar.ja.vtt" srcLang="ja" label="日本語" />
      </audio>
      <audio ref={audioElement} autoPlay playsInline>
        <track kind="captions" src="seminar.ja.vtt" srcLang="ja" label="日本語" />
      </audio>
    </div>
  );
};

export default memo(RoomUI);
