import * as MP4Box from "mp4box";

const file = MP4Box.createFile();
file.onError = console.error;
file.onReady = console.log;

const width = 640;
const height = 360;
const codec = "avc1.4D401E";
const fps = 24;

const encode = async (src: string) => {
  const video = document.createElement("video");
  document.body.append(video);
  video.src = src;

  const chunks: EncodedVideoChunk[] = [];

  const encoder = new VideoEncoder({
    error: console.error,
    output: (chunk) => chunks.push(chunk),
  });
  encoder.configure({ codec, width, height, framerate: fps });

  let keyFrame = true;
  video.muted = true;
  await video.play();
  while (!video.ended) {
    console.log(video.currentTime, video.duration);
    const frame = new VideoFrame(video, {
      timestamp: video.currentTime * 1000,
    });
    encoder.encode(frame, { keyFrame });
    frame.close();
    keyFrame = false;
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  await encoder.flush();
  video.remove();

  return chunks;
};

(async () => {
  const beachChunks = await encode("/beach.mp4");
  // const blinkChunks = await encode("/blink@1920x1080_24fps.mp4");
  // const smileChunks = await encode("/smile@1920x1080_25fps.mp4");
  // console.log(blinkChunks.length, smileChunks.length);
  const chunks = beachChunks;

  const canvas = document.createElement("canvas");
  document.body.append(canvas);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const decoder = new VideoDecoder({
    error: console.error,
    output: (frame) => {
      ctx.drawImage(frame, 0, 0);
      frame.close();
    },
  });
  decoder.configure({ codec });

  for (const chunk of chunks) {
    decoder.decode(chunk);
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }
  console.log("done");
})();
