import React from 'react';
import { render } from '@testing-library/react';
import { HomeScreen } from '.';

test('renders learn react link', () => {
  const { getByText } = render(<HomeScreen />);
  const linkElement = getByText(/Hello Home World!/i);
  expect(linkElement).toBeInTheDocument();
});
