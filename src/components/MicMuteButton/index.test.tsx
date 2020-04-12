import React from 'react';
import { shallow } from 'enzyme';
import MicMuteButton from '.';

describe('<MicMuteButton />', () => {
  it('should fire when button clicked', () => {
    const onClickMock = jest.fn();
    const wrapper = shallow(<MicMuteButton muted onClick={onClickMock} />);
    wrapper.find('button').simulate('click');
    expect(onClickMock).toHaveBeenCalled();
  });
  it('should fire correctly icon if muted', () => {
    const onClickMock = jest.fn();
    const wrapper = shallow(<MicMuteButton muted onClick={onClickMock} />);
    const img = wrapper.find('img');
    expect(img.prop('alt')).toBe('マイクミュート解除');
  });
  it('should fire correctly icon if not muted', () => {
    const onClickMock = jest.fn();
    const wrapper = shallow(<MicMuteButton muted={false} onClick={onClickMock} />);
    const img = wrapper.find('img');
    expect(img.prop('alt')).toBe('マイクミュート');
  });
});
