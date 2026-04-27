import "../index.css";
import "./clip.css";

import {
  ALL_FORMATS,
  BufferTarget,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  UrlSource,
} from "mediabunny";

import { x } from "./lib";

let decoderConfig: VideoDecoderConfig;

const extractPkts = async (name: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(`/samples/baseline/${name}`),
  });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("no track");
  decoderConfig = x(await track.getDecoderConfig());
  if (!decoderConfig) throw new Error("can't decode");
  const sink = new EncodedPacketSink(track);
  const pkts: EncodedPacket[] = [];
  for await (const pkt of sink.packets()) {
    pkts.push(pkt);
  }
  return pkts;
};

console.log("Extracting packets...");

const mediaNames = ["IMG_5432.mp4"] as const;
type MediaName = (typeof mediaNames)[number];
const pktss = {} as Record<MediaName, EncodedPacket[]>;
for (const name of mediaNames) {
  const pkts = await extractPkts(name);
  pktss[name as MediaName] = pkts;
  const keyIndices = pkts
    .map((pkt, i) => ({ pkt, i }))
    .filter(({ pkt }) => pkt.type === "key")
    .map(({ i }) => i);
  const durations = new Set(pkts.map((pkt) => pkt.duration));
  console.log(
    `${name}: ${pktss[name].length} packets, keyframes: ${keyIndices}, durations: ${[...durations]}`,
  );

  const video = document.createElement("video");
  video.src = `/samples/baseline/${name}`;
  video.controls = true;
  document.body.append(video);
  video.addEventListener("timeupdate", () => {
    console.log((pkts.length * video.currentTime) / video.duration);
  });
}

console.log("Building timeline...");

const retimers = {
  copy: (from: number, to: number) =>
    Array(to - from)
      .fill(null)
      .map((_, i) => from + i),
  glide: (at: number, duration: number) =>
    Array(duration)
      .fill(null)
      .map(() => at),
  stretch: (from: number, to: number, rate: number) => {
    const length = Math.floor((to - from) / rate);
    return Array(length)
      .fill(null)
      .map((_, i) => Math.floor(from + i * rate));
  },
};
type Timeline = { name: MediaName; indices: number[] }[];
const timeline: Timeline = [
  { name: "IMG_5432.mp4", indices: retimers.stretch(0, 59, 0.25) },
];
console.log(timeline);
const repkts = timeline
  .flatMap(({ name, indices }) => indices.map((i) => pktss[name][i]))
  .filter((pkt, i) => i == 0 || pkt.type == "delta")
  .map((pkt, i) => {
    return new EncodedPacket(
      pkt.data,
      pkt.type,
      i * pkt.duration,
      pkt.duration,
    );
  });

console.log("Writing...");

// @ts-expect-error
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
  // @ts-expect-error
  await source.add(pkt, { decoderConfig });
  i++;
}
await output.finalize();

const video = document.createElement("video");
video.controls = true;
video.loop = true;
video.muted = true;
video.autoplay = true;
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
document.body.append(video);

console.log("Done");
