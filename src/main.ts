// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HTMLVideoElement {
  seekToNextFrame(): Promise<void>;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

(async () => {
  const video = document.querySelectorAll('video')[0];
  video.src = '/static/small/hug-colors.mp4';

  await new Promise<void>((resolve) => {
    const listener = () => {
      video.removeEventListener('canplaythrough', listener);
      resolve();
    };
    video.addEventListener('canplaythrough', listener);
  });

  const canvas = document.querySelector('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  const stream = canvas.captureStream();
  const recorder = new MediaRecorder(stream);
  recorder.start();

  const loop = async () => {
    if (video.ended) {
      recorder.stop();
      return;
    }
    ctx.drawImage(video, 0, 0);
    await video.seekToNextFrame();
    setTimeout(loop, 1000 / 24);
  };
  loop();

  recorder.addEventListener('dataavailable', (evt) => {
    const url = URL.createObjectURL(evt.data);
    const outputVideo = document.querySelectorAll('video')[1];
    outputVideo.src = url;
  });
})();
