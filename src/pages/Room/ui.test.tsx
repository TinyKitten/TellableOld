import React from 'react';
import { shallow } from 'enzyme';
import RoomUI from './ui';
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
        onHangUp={jest.fn()}
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
        onHangUp={jest.fn()}
        calling={false}
        micConnected={false}
        onCallClick={onCallClick}
        onError={onError}
      />,
    );
    const callState = wrapper.find(testIdSelector('call-state'));
    const micConnectionError = wrapper.find(testIdSelector('mic-connection-error'));
    expect(callState.text()).toBe('通話していません');
    expect(micConnectionError.text()).toBe('マイクの使用を許可してください。');
  });
});
