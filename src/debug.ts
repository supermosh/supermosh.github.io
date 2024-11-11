import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { createFile, DataStream, MP4ArrayBuffer, MP4File } from "mp4box";

const src = "/beach.mp4";
const width = 640;
const height = 360;

const computeDescription = (file: MP4File, trackId: number) => {
  const track = file.getTrackById(trackId);
  for (const entry of track.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (box) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }
  throw new Error("avcC, hvcC, vpcC, or av1C box not found");
};

(async () => {
  const ffmpeg = new FFmpeg();
  ffmpeg.on("progress", console.log);

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  await ffmpeg.writeFile("input.mp4", await fetchFile(src));
  await ffmpeg.exec(
    `-i input.mp4 -vf scale=${width}:${height} -vcodec libx264 -g 99999999 -bf 0 -flags:v +cgop -pix_fmt yuv420p -movflags faststart -crf 15 output.mp4`.split(
      " "
    )
  );
  const data = (await ffmpeg.readFile("output.mp4")) as Uint8Array;
  const video = document.createElement("video");
  document.body.append(video);
  video.src = URL.createObjectURL(
    new Blob([data.buffer], { type: "video/mp4" })
  );
  video.muted = true;
  video.autoplay = true;
  video.controls = true;
  console.log("done");

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

  const stream = canvas.captureStream();
  const recorder = new MediaRecorder(stream);
  recorder.addEventListener("dataavailable", (evt) => {
    const video = document.createElement("video");
    document.body.append(video);
    video.src = URL.createObjectURL(evt.data);
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
  });

  const file = createFile();
  file.onError = console.error;
  file.onReady = (info) => {
    const track = info.videoTracks[0];
    decoder.configure({
      codec: track.codec.startsWith("vp08") ? "vp8" : track.codec,
      codedHeight: track.video.height,
      codedWidth: track.video.width,
      description: computeDescription(file, track.id),
    });
    file.setExtractionOptions(track.id);
    file.start();
  };
  file.onSamples = async (_trackId, _ref, samples) => {
    const chunks = samples.map(
      (sample) =>
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: (1e6 * sample.cts) / sample.timescale,
          duration: (1e6 * sample.duration) / sample.timescale,
          data: sample.data,
        })
    );
    recorder.start();
    for (const chunk of chunks) {
      decoder.decode(chunk);
      await new Promise((r) => setTimeout(r, 1000 / 30));
    }
    recorder.stop();
  };
  const buffer = new ArrayBuffer(data.byteLength) as MP4ArrayBuffer;
  new Uint8Array(buffer).set(data);
  buffer.fileStart = 0;
  file.appendBuffer(buffer);
})();
