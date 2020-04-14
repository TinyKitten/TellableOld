/* eslint-disable max-len */
import React from 'react';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { mount, ReactWrapper } from 'enzyme';
import { act } from 'react-dom/test-utils';
import HomeScreen from '.';
import { testIdSelector } from '../../testutil/testIdSelector';

const mockFirestoreDocGet = jest.fn(() => '');
const mockHashEncode = jest.fn(() => '');

jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn(() => []),
}));
jest.mock('react-firebase-hooks/firestore', () => ({
  useDocument: jest.fn(() => [
    {
      get: mockFirestoreDocGet,
      ref: {
        set: jest.fn(() => ({})),
        update: jest.fn(() => ({})),
      },
    },
  ]),
}));
jest.mock('firebase/app', () => ({
  auth: jest.fn(() => ({})),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => ({})),
      })),
    })),
  })),
}));
jest.mock('hashids', () =>
  jest.fn().mockImplementation(() => ({
    encode: mockHashEncode,
  })),
);

describe('HomeScreen', () => {
  it('should render loading text', () => {
    const history = createMemoryHistory();
    let wrapper!: ReactWrapper;
    act(() => {
      wrapper = mount(
        <Router history={history}>
          <HomeScreen />
        </Router>,
      );
    });
    const loadingElement = wrapper.find(testIdSelector('loading'));
    expect(loadingElement.text()).toBe('LOADING...');
  });
  /*
  it('should render url', () => {
    mockFirestoreDocGet.mockImplementation(() => 'aaa');
    const history = createMemoryHistory();
    let wrapper!: ReactWrapper;
    act(() => {
      wrapper = mount(
        <Router history={history}>
          <HomeScreen />
        </Router>,
      );
    });

    act(() => {
      wrapper.update();
    });
    const urlElement = wrapper.find(testIdSelector('url'));
    expect(urlElement.text()).toBe('https://tellable.online/room/aaa');
  });
  it('should passed valid twitter url', () => {
    mockFirestoreDocGet.mockImplementation(() => 'aaa');
    const history = createMemoryHistory();
    let wrapper!: ReactWrapper;
    act(() => {
      wrapper = mount(
        <Router history={history}>
          <HomeScreen />
        </Router>,
      );
    });
    act(() => {
      wrapper.update();
    });
    const twitterButton = wrapper.find(testIdSelector('twitter'));
    const roomUrl = `https://tellable.online/room/aaa`;
    const expected = `https://twitter.com/intent/tweet?text=Tellableで通話しよう！ ${roomUrl}&hashtags=TellableOnline,テラブル`;
    expect(twitterButton.props().href).toBe(expected);
  });
  */
});
