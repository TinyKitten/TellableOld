import React from 'react';

import styles from './styles.module.css';

type Props = {
  message: string;
};

const ErrorPage: React.FC<Props> = ({ message }) => {
  return (
    <div className={styles.container}>
      <h1>{message}</h1>
    </div>
  );
};

export default ErrorPage;
