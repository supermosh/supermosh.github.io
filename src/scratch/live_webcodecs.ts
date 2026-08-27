const video = document.createElement("video");
document.body.append(video);
video.style.transform = "scaleX(-1)";
video.muted = true;

const stream = await navigator.mediaDevices.getUserMedia({ video: true });
video.srcObject = stream;
await video.play();

const canvas = document.createElement("canvas");
document.body.append(canvas);
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
canvas.style.transform = "scaleX(-1)";
const ctx = canvas.getContext("2d")!;

const encoder = new VideoEncoder({
  error: console.error,
  output: (chunk) => {
    // no-op
    // decoder.decode(chunk);

    // stretch
    for (let i = 0; i < 4; i++) decoder.decode(chunk);
  },
});
encoder.configure({
  codec: "vp8",
  width: video.videoWidth,
  height: video.videoHeight,
});
const decoder = new VideoDecoder({
  error: console.error,
  output: (frame) => {
    ctx.drawImage(frame, 0, 0);
  },
});
decoder.configure({
  codec: "vp8",
  codedWidth: video.videoWidth,
  codedHeight: video.videoHeight,
});

const loop = () => {
  encoder.encode(new VideoFrame(video));
  requestAnimationFrame(loop);
};
loop();
