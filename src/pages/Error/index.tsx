import React from 'react';

import styles from './styles.module.css';

type Props = {
  message: string;
};

const ErrorPage = ({ message }: Props): React.ReactElement => {
  return (
    <div>
      <div className={styles.container}>
        <h1>{message}</h1>
      </div>
    </div>
  );
};

export default ErrorPage;
