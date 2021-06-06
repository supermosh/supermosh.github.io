import approximate from './approximate';
import getMinShifts from './getMinShifts';

const size = 8;
const shifts = [0, 1, -1, 2, -2, 4, -4];

(async () => {
  const video = document.querySelectorAll('video')[0];
  video.src = '/static/medium/hug-colors.mp4';

  await new Promise<void>((resolve) => {
    const listener = () => {
      video.removeEventListener('canplaythrough', listener);
      resolve();
    };
    video.addEventListener('canplaythrough', listener);
  });

  const canvas = document.querySelector('canvas');
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // @ts-ignore
  const stream = canvas.captureStream() as MediaStream;
  const recorder = new MediaRecorder(stream);
  recorder.start();

  let minShifts;
  const loop = async () => {
    if (video.ended) {
      recorder.stop();
      return;
    }

    if (video.currentTime < 1) {
      ctx.drawImage(video, 0, 0);
    } else {
      const previous = ctx.getImageData(0, 0, width, height);
      ctx.drawImage(video, 0, 0);
      const real = ctx.getImageData(0, 0, width, height);
      minShifts = minShifts || getMinShifts(previous, real, size, shifts);
      const out = approximate(previous, minShifts, size);
      ctx.putImageData(out, 0, 0);
    }

    // @ts-ignore
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
