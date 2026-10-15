const codec = "vp8";

const video = document.createElement("video");
// document.body.append(video);
video.style.transform = "scaleX(-1)";
video.muted = true;

const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: {
      ideal: "environment",
    },
  },
});
video.srcObject = stream;
await video.play();

const canvas = document.createElement("canvas");
document.body.append(canvas);
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
canvas.style.transform = "scaleX(-1)";
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.objectFit = "contain";
const ctx = canvas.getContext("2d")!;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

let isStretching = false;
document.addEventListener("mousedown", () => {
  isStretching = true;
});
document.addEventListener("mouseup", () => {
  isStretching = false;
});

const encoder = new VideoEncoder({
  error: console.error,
  output: (chunk) => {
    // no-op
    // decoder.decode(chunk);

    // stretch
    // for (let i = 0; i < 2; i++) decoder.decode(chunk);

    // glide - codec issue? fucks things up
    // lastChunk = isGliding ? (lastChunk ?? chunk) : chunk;
    // decoder.decode(lastChunk);

    // stretch on press
    for (let i = 0; i < (isStretching ? 4 : 1); i++) decoder.decode(chunk);
  },
});
encoder.configure({
  codec,
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
  codec,
  codedWidth: video.videoWidth,
  codedHeight: video.videoHeight,
});

const loop = () => {
  encoder.encode(new VideoFrame(video));
  requestAnimationFrame(loop);
};
loop();
