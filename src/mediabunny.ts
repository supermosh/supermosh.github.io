import {
  BufferTarget,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  VideoSample,
  VideoSampleSource,
} from "mediabunny";

const canvas = document.createElement("canvas");
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;
const source = new VideoSampleSource({ codec: "avc", bitrate: QUALITY_HIGH });

const output = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(),
});
output.addVideoTrack(source);
await output.start();

ctx.fillStyle = "red";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.fillStyle = "lime";
for (let x = 0; x < canvas.width; x++) {
  ctx.fillRect(0, 0, x, canvas.height);
  const videoSample = new VideoSample(canvas, { timestamp: x / 60 });
  await source.add(videoSample);
  videoSample.close();
}

await output.finalize();
const blob = new Blob([output.target.buffer!], {
  type: output.format.mimeType,
});
const video = document.createElement("video");
video.controls = true;
video.muted = true;
video.loop = true;
video.autoplay = true;
document.body.append(video);
video.src = URL.createObjectURL(blob);

// source.close();
