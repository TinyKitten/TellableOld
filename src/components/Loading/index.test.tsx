import React from 'react';
import { render } from '@testing-library/react';
import HomeScreen from '.';

describe('HomeScreen', () => {
  test('should render the title', () => {
    const { getByText } = render(<HomeScreen />);
    const h1Element = getByText(/Loading.../i);
    expect(h1Element).toBeInTheDocument();
  });
});
