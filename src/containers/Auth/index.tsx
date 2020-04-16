import React, { memo } from 'react';
import { Redirect } from 'react-router-dom';

type Props = {
  user?: firebase.User;
  children: React.ReactNode;
};

const AuthContainer: React.FC<Props> = ({ children, user }) => {
  if (!user) {
    return <Redirect data-testid="redirect" to="/welcome" />;
  }

  return <>{children}</>;
};

export default memo(AuthContainer);
