import React from 'react';
import { shallow } from 'enzyme';
import Error from '.';

describe('<Error />', () => {
  it('should rendered correctly with message', () => {
    const wrapper = shallow(<Error message="message" />);
    const h1 = wrapper.find('h1');
    expect(h1.text()).toBe('message');
  });
});
