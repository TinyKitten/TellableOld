import React, { memo } from 'react';

import styles from './styles.module.css';
import MicMutedIcon from '../../assets/icons/mic_muted.svg';
import MicIcon from '../../assets/icons/mic.svg';

type Props = {
  onClick: () => void;
  muted: boolean;
};

const MicMuteButton: React.FC<Props> = ({ onClick, muted }) => {
  return (
    <button
      type="button"
      className={muted ? styles.unmuteButton : styles.muteButton}
      onClick={onClick}
    >
      {muted ? (
        <img className={styles.buttonIcon} src={MicMutedIcon} alt="マイクミュート解除" />
      ) : (
        <img className={styles.buttonIcon} src={MicIcon} alt="マイクミュート" />
      )}
    </button>
  );
};

export default memo(MicMuteButton);
