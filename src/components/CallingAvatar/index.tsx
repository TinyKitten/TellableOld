import React, { memo } from 'react';

import styles from './styles.module.css';
import { User } from '../../models/user';

type Props = {
  user?: User;
  calling: boolean;
};

const getAvatarWrapperStyle = (calling: boolean): { boxShadow: string } =>
  calling ? { boxShadow: '0 0 24px #008ffe' } : { boxShadow: '0 0 24px #ff5252' };

const CallingAvatar = ({ calling, user }: Props): React.ReactElement => {
  const wrapperStyle = getAvatarWrapperStyle(calling);
  return (
    <div style={wrapperStyle} className={styles.avatarWrapper}>
      {user && <img src={user.avatarUrl} alt={user.displayName} className={styles.avatar} />}
    </div>
  );
};

export default memo(CallingAvatar);
