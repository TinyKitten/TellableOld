import React from 'react';
import { createMemoryHistory } from 'history';
import Header from '.';
import { Router } from 'react-router-dom';
import { mount } from 'enzyme';
import { testIdSelector } from '../../testutil/testIdSelector';

describe('Header', () => {
  it('should render the title', () => {
    const history = createMemoryHistory();
    const wrapper = mount(
      <Router history={history}>
        <Header isLoggedIn={false} />
      </Router>,
    );
    const titleElement = wrapper.find(testIdSelector('title'));
    expect(titleElement.text()).toBe('Tellable');
  });
  it('should render the development phase', () => {
    const history = createMemoryHistory();
    const wrapper = mount(
      <Router history={history}>
        <Header isLoggedIn={false} />
      </Router>,
    );
    const devStateElement = wrapper.find(testIdSelector('dev-state'));
    expect(devStateElement.text()).toBe('Beta');
  });
  it('isLoggedIn true', () => {
    const history = createMemoryHistory();
    const wrapper = mount(
      <Router history={history}>
        <Header isLoggedIn={true} />
      </Router>,
    );
    const logoutElement = wrapper.find(testIdSelector('logout-button'));
    expect(logoutElement.text()).toBe('ログアウト');
  });
});
