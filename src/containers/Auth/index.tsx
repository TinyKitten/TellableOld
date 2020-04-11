import React, { memo } from 'react';
import { Redirect } from 'react-router-dom';

type Props = {
  user?: firebase.User;
  children: React.ReactNode;
};

const AuthContainer = ({ children, user }: Props): React.ReactElement => {
  if (!user) {
    return <Redirect data-testid="redirect" to="/welcome" />;
  }

  return <>{children}</>;
};

export default memo(AuthContainer);
