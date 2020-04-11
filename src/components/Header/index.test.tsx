import React from 'react';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';
import Header from '.';
import { Router } from 'react-router-dom';

describe('Header', () => {
  test('should render the title', () => {
    const history = createMemoryHistory();
    const { queryByTestId } = render(
      <Router history={history}>
        <Header isLoggedIn={false} />
      </Router>,
    );
    expect(queryByTestId('title')).toBeInTheDocument();
  });
  test('should render the development phase', () => {
    const history = createMemoryHistory();
    const { queryByTestId } = render(
      <Router history={history}>
        <Header isLoggedIn={false} />
      </Router>,
    );
    expect(queryByTestId('dev-state')).toBeInTheDocument();
  });
  test('isLoggedIn true', () => {
    const history = createMemoryHistory();
    const { queryByTestId } = render(
      <Router history={history}>
        <Header isLoggedIn={true} />
      </Router>,
    );
    expect(queryByTestId('logout-button')).toBeInTheDocument();
  });
});
