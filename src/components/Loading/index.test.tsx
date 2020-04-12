import React from 'react';
import { shallow } from 'enzyme';
import Loading from '.';

describe('Loading', () => {
  it('should render text', () => {
    const wrapper = shallow(<Loading />);
    expect(wrapper.text()).toBe('LOADING...');
  });
});
