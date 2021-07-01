import approximate from './approximate';
import getMinShifts from './getMinShifts';

const size = 8;
const shifts = [0, 1, -1, 2, -2, 4, -4];

(async () => {
  const video = document.querySelectorAll('video')[0];
  video.src = '/static/medium/motocross.mp4';
  await new Promise((r) => video.addEventListener('canplaythrough', r, { once: true }));

  const width = video.videoWidth;
  const height = video.videoHeight;
  const copyCanvas = document.querySelectorAll('canvas')[0];
  copyCanvas.width = width;
  copyCanvas.height = height;
  const copyCtx = copyCanvas.getContext('2d');
  const outCanvas = document.querySelectorAll('canvas')[1];
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');

  // @ts-ignore
  const stream = outCanvas.captureStream() as MediaStream;
  const recorder = new MediaRecorder(stream);
  recorder.start();

  let minShifts;
  const loop = async () => {
    if (video.ended) {
      recorder.stop();
      return;
    }

    copyCtx.drawImage(video, 0, 0);
    const previous = copyCtx.getImageData(0, 0, width, height);
    // @ts-ignore
    await video.seekToNextFrame();
    const real = copyCtx.getImageData(0, 0, width, height);

    minShifts = getMinShifts(previous, real, size, shifts);
    const outData = approximate(previous, minShifts, size);
    outCtx.putImageData(outData, 0, 0);

    // @ts-ignore
    await video.seekToNextFrame();
    requestAnimationFrame(loop);
  };
  loop();

  recorder.addEventListener('dataavailable', (evt) => {
    const url = URL.createObjectURL(evt.data);
    const outputVideo = document.querySelectorAll('video')[1];
    outputVideo.src = url;
  });
})();
