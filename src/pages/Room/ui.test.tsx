import React from 'react';
import { shallow } from 'enzyme';
import RoomUI from './ui';
import MicMuteButton from '../../components/MicMuteButton';
import CallButton from '../../components/CallButton';
import { testIdSelector } from '../../testutil/testIdSelector';

describe('<RoomUI />', () => {
  it('should rendered correctly with calling state', () => {
    const mockRemoteUser = {
      displayName: 'remote',
      uniqueId: 'uid',
    };
    const onCallClick = jest.fn();
    const onError = jest.fn();
    const wrapper = shallow(
      <RoomUI
        muted={false}
        onHangUp={jest.fn()}
        toggleLocalMic={jest.fn()}
        remoteUser={mockRemoteUser}
        calling
        micConnected
        onCallClick={onCallClick}
        onError={onError}
      />,
    );
    const remoteUserName = wrapper.find(testIdSelector('remote-user-name'));
    const callState = wrapper.find(testIdSelector('call-state'));
    const micConnectionError = wrapper.find(testIdSelector('mic-connection-error'));
    expect(remoteUserName.text()).toBe(mockRemoteUser.displayName);
    expect(callState.text()).toBe('通話中');
    expect(micConnectionError.text()).toBe('');
  });
  it('should rendered correctly with not calling state', () => {
    const onCallClick = jest.fn();
    const onError = jest.fn();
    const wrapper = shallow(
      <RoomUI
        muted={false}
        onHangUp={jest.fn()}
        toggleLocalMic={jest.fn()}
        calling={false}
        micConnected={false}
        onCallClick={onCallClick}
        onError={onError}
      />,
    );
    const callState = wrapper.find(testIdSelector('call-state'));
    const micConnectionError = wrapper.find(testIdSelector('mic-connection-error'));
    expect(callState.text()).toBe('通話していません');
    expect(micConnectionError.text()).toBe('ボタンをクリックしてマイクの使用を許可してください。');
  });
  it('should fire events when buttons clicked', () => {
    const mockRemoteUser = {
      displayName: 'remote',
      uniqueId: 'uid',
    };
    const mockOnHangUp = jest.fn();
    const mockToggleLocalMic = jest.fn();
    const onCallClick = jest.fn();
    const onError = jest.fn();
    const wrapper = shallow(
      <RoomUI
        remoteUser={mockRemoteUser}
        calling
        micConnected
        muted={false}
        onHangUp={mockOnHangUp}
        toggleLocalMic={mockToggleLocalMic}
        onCallClick={onCallClick}
        onError={onError}
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
