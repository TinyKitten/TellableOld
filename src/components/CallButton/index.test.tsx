import React from 'react';
import { shallow } from 'enzyme';
import CallButton from '.';

describe('<CallButton />', () => {
  it('should fire when button clicked', () => {
    const onClickMock = jest.fn();
    const wrapper = shallow(<CallButton onClick={onClickMock} />);
    wrapper.find('button').simulate('click');
    expect(onClickMock).toHaveBeenCalled();
  });
});
