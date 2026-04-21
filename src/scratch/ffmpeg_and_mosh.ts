import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  ALL_FORMATS,
  BufferSource,
  EncodedPacket,
  EncodedPacketSink,
  Input,
} from "mediabunny";
import "../index.css";
import { clipIndices } from "./mosh_timers";

// convert using ffmpeg.wasm

const baseURL = "";
const ffmpeg = new FFmpeg();
ffmpeg.on("log", (log) =>
  log.type === "stderr" ? console.warn(log.message) : console.log(log.message),
);
ffmpeg.on("progress", console.log);
await ffmpeg.load({
  coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
  wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
});

await ffmpeg.writeFile("input.mp4", await fetchFile("/samples/forest.mp4"));
await ffmpeg.exec(
  "-i input.mp4 -c:v libx264 -profile:v baseline output.mp4".split(" "),
);
const data = await ffmpeg.readFile("output.mp4");

const width = 1280;
const height = 720;

// extract encoded packets

const input = new Input({
  formats: ALL_FORMATS,
  // @ts-expect-error
  source: new BufferSource(data.buffer),
});
const track = await input.getPrimaryVideoTrack();
if (!track) throw new Error("no track");
const decoderConfig = await track.getDecoderConfig();
if (!decoderConfig) throw new Error("can't decode");
const sink = new EncodedPacketSink(track);
const pkts: EncodedPacket[] = [];
for await (const pkt of sink.packets()) {
  pkts.push(pkt);
}

// possibly duplicate or reorder packets to mosh
// const repkts = [
//   ...pkts,
//   ...Array(150)
//     .fill(null)
//     .map(() => pkts.slice(-1)[0]),
// ];
console.log(pkts.length);
console.log(clipIndices({ start: 0, end: 45, rate: 1 }));
const repkts = [
  ...clipIndices({ start: 0, end: 45, rate: 1 }),
  ...clipIndices({ start: 45, end: 48, rate: 0.1 }),
].map((i) => pkts[i]);

// setup rendering
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.objectFit = "contain";
document.body.append(canvas);
const ctx = canvas.getContext("2d")!;
const decoder = new VideoDecoder({
  output: (frame) => {
    ctx.drawImage(frame, 0, 0);
    frame.close();
  },
  error: console.error,
});
decoder.configure(decoderConfig);

// render asap
let i = 0;
while (i < repkts.length) {
  const pkt = repkts[i];
  const chunk = new EncodedVideoChunk({
    type: pkt.type,
    timestamp: pkt.timestamp * 1_000_000,
    duration: pkt.duration * 1_000_000,
    data: pkt.data,
  });
  decoder.decode(chunk);
  i++;
  await new Promise((r) => requestAnimationFrame(r));
}
console.log("done");
