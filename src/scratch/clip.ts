import "../index.css";

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

const extractPkts = async (mediaName: string) => {
  const input = new Input({
    formats: ALL_FORMATS,
    source: new UrlSource(`/samples/baseline/${mediaName}`),
  });
  const track = await input.getPrimaryVideoTrack();
  if (!track) throw new Error("no track");
  decoderConfig = x(await track.getDecoderConfig());
  console.log(decoderConfig);
  if (!decoderConfig) throw new Error("can't decode");
  const sink = new EncodedPacketSink(track);
  const pkts: EncodedPacket[] = [];
  for await (const pkt of sink.packets()) {
    pkts.push(pkt);
  }
  return pkts;
};

console.log("Extracting packets...");

const mediaNames = ["IMG_5424.mp4", "IMG_5425.mp4"] as const;
type MediaName = (typeof mediaNames)[number];
const pktss = {} as Record<MediaName, EncodedPacket[]>;
for (const mediaName of mediaNames) {
  pktss[mediaName as MediaName] = await extractPkts(mediaName);
  console.log(`${mediaName}: ${pktss[mediaName].length} packets`);
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
};
type Timeline = { mediaName: MediaName; indices: number[] }[];
const timeline: Timeline = [
  {
    mediaName: "IMG_5424.mp4",
    indices: retimers.copy(0, 78),
  },
];
const repkts = timeline
  .flatMap(({ mediaName, indices }) => indices.map((i) => pktss[mediaName][i]))
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
video.style.width = "100%";
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
document.body.append(video);

console.log("Done");
