import React, { memo } from 'react';
import firebase from 'firebase/app';
import { Redirect } from 'react-router-dom';

type Props = {
  user?: firebase.User;
  children: React.ReactNode;
};

const AuthContainer: React.FC<Props> = ({ children, user }) => {
  if (!user) {
    return <Redirect to="/welcome" />;
  }

  return <>{children}</>;
};

export default memo(AuthContainer);
