(async () => {
  const video = document.createElement('video');
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
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
    requestAnimationFrame(loop);
  };
  loop();
})();
