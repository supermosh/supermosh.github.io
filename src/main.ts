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
    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(loop);
  };
  loop();

  // @ts-ignore
  const outputStream = canvas.captureStream() as MediaStream;
  const recorder = new MediaRecorder(outputStream, { mimeType: 'video/webm' });
  let recording = false;

  const startRecording = () => {
    recording = true;
    recorder.start();
  };

  const stopRecording = () => {
    recording = false;
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
        if (recording) { stopRecording(); } else { startRecording(); }
    }
  });
})();
