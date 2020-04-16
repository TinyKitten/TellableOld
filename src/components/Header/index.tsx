import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

type Props = {
  isLoggedIn: boolean;
  onLogoutClick?: () => void;
};

const Header: React.FC<Props> = ({ isLoggedIn, onLogoutClick }) => (
  <header className={styles.appHeader}>
    <Link className={styles.link} to="/">
      <h1 className={styles.appTitle} data-testid="title">
        Tellable
      </h1>
      <span className={styles.devState} data-testid="dev-state">
        Beta
      </span>
    </Link>
    {isLoggedIn && (
      <span
        data-testid="logout-button"
        tabIndex={-1}
        role="button"
        onKeyPress={onLogoutClick}
        onClick={onLogoutClick}
        className={styles.logout}
      >
        ログアウト
      </span>
    )}
  </header>
);

export default memo(Header);
