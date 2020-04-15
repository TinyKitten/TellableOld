import { ERR_COULD_NOT_GET_LOCAL_STREAM } from '../constants/error';

export const getLocalStream = async (): Promise<MediaStream | undefined> => {
  if (navigator.mediaDevices) {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    return Promise.resolve(stream);
  }
  // MediaDevicesを取得できない
  const err = new Error(ERR_COULD_NOT_GET_LOCAL_STREAM);
  Promise.reject(err);
};
