export const stopLocalStream = (localStream: MediaStream): void => {
  const tracks = localStream.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });
};
