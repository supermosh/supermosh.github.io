import approximate from './approximate';
import getMinShifts from './getMinShifts';

const size = 8;
const shifts = [0, 1, -1, 2, -2, 4, -4, 8, -8];

type State = {
  recording: boolean;
  transformation: (previous: ImageData, real: ImageData) => ImageData
}

const state: State = {
  recording: false,
  transformation: (previous, real) => real,
};

(async () => {
  const video = document.createElement('video');
  const inputStream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = inputStream;
  await new Promise<void>((resolve) => {
    const listener = () => {
      video.removeEventListener('canplay', listener);
      resolve();
    };
    video.addEventListener('canplay', listener);
  });
  video.play();

  const width = video.videoWidth;
  const height = video.videoHeight;
  const canvas = document.querySelector('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const loop = () => {
    const previous = ctx.getImageData(0, 0, width, height);
    ctx.drawImage(video, 0, 0);
    const real = ctx.getImageData(0, 0, width, height);
    const out = state.transformation(previous, real);
    ctx.putImageData(out, 0, 0);
    requestAnimationFrame(loop);
  };
  loop();

  // @ts-ignore
  const outputStream = canvas.captureStream() as MediaStream;
  const recorder = new MediaRecorder(outputStream, { mimeType: 'video/webm' });

  const startRecording = () => {
    state.recording = true;
    recorder.start();
  };

  const stopRecording = () => {
    state.recording = false;
    recorder.addEventListener('dataavailable', (evt) => {
      const url = URL.createObjectURL(evt.data);
      const outputVideo = document.querySelector('video');
      outputVideo.src = url;
    });
    recorder.stop();
  };

  document.addEventListener('keypress', (evt) => {
    switch (evt.key) {
      case 'r':
        if (state.recording) {
          stopRecording();
        } else {
          startRecording();
        }
        break;
      case 'i':
        state.transformation = (previous, real) => real;
        break;
      case 'a':
        state.transformation = (previous, real) => {
          const minShifts = getMinShifts(previous, real, size, shifts);
          const out = approximate(previous, minShifts, size);
          return out;
        };
        break;
      case 'g':
        state.transformation = (previous, real) => {
          const minShifts = getMinShifts(previous, real, size, shifts);
          const out = approximate(previous, minShifts, size);
          state.transformation = (previous2) => approximate(previous2, minShifts, size);
          return out;
        };
        break;
    }
  });
})();
