import { ERR_COULD_NOT_GET_LOCAL_STREAM } from '../constants/error';

export const getLocalStream = async (): Promise<MediaStream | undefined> => {
  if (navigator.mediaDevices) {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    return Promise.resolve(localStream);
  }
  // MediaDevicesを取得できない
  const err = new Error(ERR_COULD_NOT_GET_LOCAL_STREAM);
  Promise.reject(err);
};
