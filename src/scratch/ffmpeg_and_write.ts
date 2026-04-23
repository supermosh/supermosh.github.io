import "../index.css";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
} from "mediabunny";

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

// reorder packets to create mosh

const repkts = [
  ...clipIndices({ start: 0, end: 45, rate: 1 }),
  ...clipIndices({ start: 45, end: 48, rate: 0.1 }),
]
  .map((i) => pkts[i])
  .filter((pkt, i) => i == 0 || pkt.type == "delta")
  .map((pkt, i) => {
    return new EncodedPacket(
      pkt.data,
      pkt.type,
      i * pkt.duration,
      pkt.duration,
    );
  });

// write to mp4
console.log(decoderConfig.codec); // wrong codec?...
const source = new EncodedVideoPacketSource("avc");
const output = new Output({
  target: new BufferTarget(),
  format: new Mp4OutputFormat(),
});
output.addVideoTrack(source);
output.start();
let i = 0;
while (i < repkts.length) {
  const pkt = repkts[i];
  await source.add(pkt, { decoderConfig });
  i++;
}
await output.finalize();

const video = document.createElement("video");
video.controls = true;
video.muted = true;
video.autoplay = true;
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
document.body.append(video);
