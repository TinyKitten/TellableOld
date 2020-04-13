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
  onError: (err: Error) => void;
};

const MyRoomUI = ({
  micConnected,
  remoteStream,
  remoteUser,
  calling,
  onHangUp,
  muted,
  toggleLocalMic,
  onError,
}: Props): React.ReactElement => {
  const getRemoteUserName = (remoteUser?: User): string =>
    remoteUser?.displayName || '通話相手なし';
  const getCallState = (calling: boolean): string => (calling ? '通話中' : '通話していません');
  const getMicError = (connected: boolean): string =>
    connected ? '' : 'マイクの使用を許可してください。';
  const audioElement = useRef<HTMLMediaElement>(null);

  const playStream = useCallback(async () => {
    if (remoteStream && audioElement.current) {
      audioElement.current.srcObject = remoteStream;
      if (audioElement.current) {
        try {
          await audioElement.current.play();
        } catch (err) {
          onError(err);
        }
      }
    }
  }, [remoteStream, audioElement]);

  useEffect(() => {
    playStream();
  }, [remoteStream, audioElement]);

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
          {calling ? (
            <div data-testid="buttons">
              <CallButton onClick={onHangUp} />
              <MicMuteButton muted={muted} onClick={toggleLocalMic} />
            </div>
          ) : null}
        </div>
      </div>
      {/*無音*/}
      <audio autoPlay src="/silence.mp3" playsInline>
        <track kind="captions" src="seminar.ja.vtt" srcLang="ja" label="日本語" />
      </audio>
      <audio autoPlay ref={audioElement} playsInline>
        <track kind="captions" src="seminar.ja.vtt" srcLang="ja" label="日本語" />
      </audio>
    </div>
  );
};

export default memo(MyRoomUI);
