import { x } from "../shorts";
import type { Segment } from "./types";

const codec = "vp8";
const fps = 29.97;
const start = 0;
const end = fps * 10;

const encode = async (file: File) => {
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

  for (let f = start; f < end; f++) {
    video.currentTime = f / fps;
    await new Promise((r) =>
      video.addEventListener("seeked", r, { once: true })
    );
    const frame = new VideoFrame(video, { timestamp: video.currentTime });
    encoder.encode(frame);
    frame.close();
  }
  await encoder.flush();
  return { width, height, chunks };
};

const decode = async (chunks: EncodedVideoChunk[]) => {
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

const record = async (width: number, height: number, frames: VideoFrame[]) => {
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

export const Renderer = ({
  files,
  segments,
}: {
  files: File[];
  segments: Segment[];
}) => {
  const render = async () => {
    const encoded = await Promise.all(files.map(encode));
    const [head, ...tail] = encoded;
    if (!head) throw new Error("not enough segments");
    const { width, height } = head;
    if (!tail.every((e) => e.width === width && e.height === height))
      throw new Error("should be of the same dimensions");
    const chunksByName = Object.fromEntries(
      files.map((file, i) => [file.name, encoded[i].chunks])
    );

    const allChunks = segments.flatMap((segment) => {
      const chunks = chunksByName[segment.name];
      if (segment.kind === "copy") return chunks;
      throw new Error("not impl");
    });

    const frames = await decode(allChunks);
    const url = await record(width, height, frames);
    console.log(url);
  };

  return (
    <>
      <h1>Render</h1>
      <button onClick={render}>render</button>
    </>
  );
};
