import { x } from "../shorts";

const codec = "vp8";
const fps = 29.97;

export const encode = async (file: File) => {
  const video = document.createElement("video");
  video.src = URL.createObjectURL(file);
  video.muted = true;
  await new Promise((r) =>
    video.addEventListener("canplaythrough", r, { once: true })
  );

  const width = video.videoWidth;
  const height = video.videoHeight;

  const chunks: EncodedVideoChunk[] = [];
  const encoder = new VideoEncoder({
    error: console.error,
    output: (chunk) => {
      chunks.push(chunk);
    },
  });
  encoder.configure({ codec, width, height });

  let f = 0;
  while (!video.ended) {
    video.currentTime = f / fps;
    await new Promise((r) =>
      video.addEventListener("seeked", r, { once: true })
    );
    const frame = new VideoFrame(video, { timestamp: video.currentTime });
    encoder.encode(frame, { keyFrame: f === 0 });
    frame.close();
    f++;
  }
  await encoder.flush();
  return { width, height, chunks };
};

export const decode = async (chunks: EncodedVideoChunk[]) => {
  const frames: VideoFrame[] = [];

  const decoder = new VideoDecoder({
    error: console.error,
    output: (frame) => {
      frames.push(frame);
    },
  });
  decoder.configure({ codec });

  for (let i = 0; i < chunks.length; i++) {
    decoder.decode(chunks[i]);
  }
  await decoder.flush();

  return frames;
};

export const record = async (
  width: number,
  height: number,
  frames: VideoFrame[]
) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = x(canvas.getContext("2d"));

  const stream = canvas.captureStream();
  const recorder = new MediaRecorder(stream);

  recorder.start();
  for (let i = 0; i < frames.length; i++) {
    ctx.drawImage(frames[i], 0, 0);
    frames[i].close();
    await new Promise((r) => requestAnimationFrame(r));
  }
  recorder.stop();
  const evt: BlobEvent = await new Promise((r) =>
    recorder.addEventListener("dataavailable", r, { once: true })
  );
  return URL.createObjectURL(evt.data);
};
