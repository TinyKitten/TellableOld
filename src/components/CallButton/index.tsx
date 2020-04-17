import React, { memo } from 'react';

import styles from './styles.module.css';
import HangUpIcon from '../../assets/icons/hangup.svg';
import CallIcon from '../../assets/icons/call.svg';

type Props = {
  onClick: () => void;
  calling?: boolean;
};

const CallButton: React.FC<Props> = ({ onClick, calling }) => (
  <button type="button" className={calling ? styles.hangUpBtn : styles.callBtn} onClick={onClick}>
    {calling ? (
      <img className={styles.buttonIcon} src={HangUpIcon} alt="通話切断" />
    ) : (
      <img className={styles.buttonIcon} src={CallIcon} alt="通話開始" />
    )}
  </button>
);

export default memo(CallButton);
