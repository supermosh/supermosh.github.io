import {
  ALL_FORMATS,
  BufferTarget,
  EncodedPacket,
  EncodedPacketSink,
  EncodedVideoPacketSource,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_VERY_HIGH,
  UrlSource,
  VideoSample,
  VideoSampleSource,
} from "mediabunny";
import "../index.css";

// forest 2711092-hd_1280_720_24fps.mp4
// waves  2873679-hd_1920_1080_25fps.mp4
// dance  2873755-hd_1280_720_25fps.mp4

const width = 1280;
const height = 720;

// extract encoded packets
const input = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/samples/2711092-hd_1280_720_24fps.baseline.mp4"),
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
  ...pkts,
  ...Array(150)
    .fill(null)
    .map(() => pkts.slice(-1)[0]),
];

// write to mp4
console.log(decoderConfig.codec); // wrong codec?...
const source = new EncodedVideoPacketSource("avc");
const output = new Output({
  target: new BufferTarget(),
  format: new Mp4OutputFormat(),
});
output.addVideoTrack(source);
output.start();

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
  // const chunk = new EncodedVideoChunk({
  //   type: pkt.type,
  //   timestamp: pkt.timestamp * 1_000_000,
  //   duration: pkt.duration * 1_000_000,
  //   data: pkt.data,
  // });
  // decoder.decode(chunk);
  source.add(pkt, { decoderConfig });
  i++;
  // await new Promise((r) => requestAnimationFrame(r));
}
console.log("done");

// TODO show video and save
