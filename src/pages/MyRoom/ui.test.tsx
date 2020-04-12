import React from 'react';
import { shallow } from 'enzyme';
import MyRoomUI from './ui';
import MicMuteButton from '../../components/MicMuteButton';
import CallButton from '../../components/CallButton';
import { testIdSelector } from '../../testutil/testIdSelector';

describe('<MyRoom />', () => {
  it('should rendered correctly with calling state', () => {
    const mockRemoteUser = {
      displayName: 'remote',
      uniqueId: 'uid',
    };
    const wrapper = shallow(
      <MyRoomUI
        muted={false}
        onHangUp={jest.fn()}
        toggleLocalMic={jest.fn()}
        remoteUser={mockRemoteUser}
        calling
        micConnected
      />,
    );
    const remoteUserName = wrapper.find(testIdSelector('remote-user-name'));
    const callState = wrapper.find(testIdSelector('call-state'));
    const micConnectionError = wrapper.find(testIdSelector('mic-connection-error'));
    expect(remoteUserName.text()).toBe(mockRemoteUser.displayName);
    expect(callState.text()).toBe('通話中');
    expect(micConnectionError.text()).toBe('');
    expect(wrapper.exists(testIdSelector('buttons'))).toBe(true);
  });
  it('should rendered correctly with not calling state', () => {
    const wrapper = shallow(
      <MyRoomUI
        muted={false}
        onHangUp={jest.fn()}
        toggleLocalMic={jest.fn()}
        calling={false}
        micConnected={false}
      />,
    );
    const callState = wrapper.find(testIdSelector('call-state'));
    const micConnectionError = wrapper.find(testIdSelector('mic-connection-error'));
    expect(callState.text()).toBe('通話していません');
    expect(micConnectionError.text()).toBe('マイクの使用を許可してください。');
    expect(wrapper.exists(testIdSelector('buttons'))).toBe(false);
  });
  it('should fire events when buttons clicked', () => {
    const mockRemoteUser = {
      displayName: 'remote',
      uniqueId: 'uid',
    };
    const mockOnHangUp = jest.fn();
    const mockToggleLocalMic = jest.fn();
    const wrapper = shallow(
      <MyRoomUI
        remoteUser={mockRemoteUser}
        calling
        micConnected
        muted={false}
        onHangUp={mockOnHangUp}
        toggleLocalMic={mockToggleLocalMic}
      />,
    );
    const callButton = wrapper.find(CallButton);
    const micMuteButton = wrapper.find(MicMuteButton);
    callButton.simulate('click');
    expect(mockOnHangUp).toHaveBeenCalled();
    micMuteButton.simulate('click');
    expect(mockToggleLocalMic).toHaveBeenCalled();
  });
});
