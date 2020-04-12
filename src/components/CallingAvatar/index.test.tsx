import React from 'react';
import { mount } from 'enzyme';
import CallingAvatar from '.';

describe('<CallingAvatar />', () => {
  it('should not rendered avatar when user not present', () => {
    const wrapper = mount(<CallingAvatar calling />);
    expect(wrapper.exists('img')).toBe(false);
  });
  it('should rendered avatar when user present', () => {
    const mockUser = { avatarUrl: 'example.png', displayName: 'hoge', uniqueId: 'uid' };
    const wrapper = mount(<CallingAvatar calling user={mockUser} />);
    const img = wrapper.find('img');
    expect(img.prop('src')).toBe(mockUser.avatarUrl);
    expect(img.prop('alt')).toBe(mockUser.displayName);
  });
});
