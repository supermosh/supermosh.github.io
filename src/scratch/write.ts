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

const width = 1280;
const height = 720;

// extract encoded packets
const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/samples/baseline/6616342-hd_1920_1080_25fps.mp4"),
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
const repkts = [
  ...pkts.slice(0, 50),
  ...Array(50)
    .fill(null)
    .map(() => pkts[50]),
  ...pkts.slice(50, 100),
]
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
video.src = URL.createObjectURL(new Blob([output.target.buffer!]));
document.body.append(video);
