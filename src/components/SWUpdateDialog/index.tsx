import React, { memo, useState } from 'react';
import styles from './styles.module.css';

type Props = {
  registration: ServiceWorkerRegistration;
};

const SWUpdateDialog: React.FC<Props> = ({ registration }) => {
  const [show, setShow] = useState(!!registration.waiting);

  const handleUpdate: () => void = () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
    setShow(false);
    window.location.reload();
  };

  return show ? (
    <div className={styles.root}>
      <p>アップデートがあります</p>
      <button className={styles.button} onClick={handleUpdate}>
        更新
      </button>
    </div>
  ) : (
    <></>
  );
};

export default memo(SWUpdateDialog);
