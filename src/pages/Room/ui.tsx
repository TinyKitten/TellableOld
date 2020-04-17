import React, { useEffect, useRef, memo, useCallback } from 'react';
import { User } from '../../models/user';
import styles from './styles.module.css';
import CallingAvatar from '../../components/CallingAvatar';
import CallButton from '../../components/CallButton';

type Props = {
  micConnected: boolean;
  remoteStream?: MediaStream;
  remoteUser?: User;
  calling?: boolean;
  onHangUp: () => void;
  onCallClick: () => void;
  onError: (err: Error) => void;
};

const RoomUI: React.FC<Props> = ({
  micConnected,
  remoteStream,
  calling,
  remoteUser,
  onHangUp,
  onCallClick,
  onError,
}) => {
  const getRemoteUserName = (): string => remoteUser?.displayName || '通話相手なし';
  const getCallState = (): string => (calling ? '通話中' : '通話していません');
  const getMicError = (): string => (micConnected ? '' : 'マイクの使用を許可してください。');
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
  }, [remoteStream, audioElement, onError]);

  useEffect(() => {
    playStream();
  }, [remoteStream, audioElement, playStream]);

  const handleCallButtonClick = useCallback(() => (calling ? onHangUp() : onCallClick()), [
    calling,
    onHangUp,
    onCallClick,
  ]);

  return (
    <div className={styles.content}>
      <CallingAvatar calling={!!calling} user={remoteUser} />
      <p data-testid="remote-user-name" className={styles.remoteScreenName}>
        {getRemoteUserName()}
      </p>
      <p data-testid="call-state" className={styles.callState}>
        {getCallState()}
      </p>
      <p data-testid="mic-connection-error" className={styles.error}>
        {getMicError()}
      </p>

      <div className={styles.buttons}>
        <CallButton calling={!!calling} onClick={handleCallButtonClick} />
      </div>
      <audio ref={audioElement} playsInline />
    </div>
  );
};

export default memo(RoomUI);
