import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  Conversion,
  EncodedPacket,
  EncodedPacketSink,
  Input,
  Mp4OutputFormat,
  Output,
  UrlSource,
} from "mediabunny";
import "../index.css";
import { x } from "./lib";

console.log("start");

// baseline codec is avc1.42c01f, but conversion converts to vp9 or av. There is no known option to circumvent this.

// scale and convert
const width = 1280 / 2;
const height = 720 / 2;
const convInput = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/samples/forest.mp4"),
});
const convOutput = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(),
});
const conversion = await Conversion.init({
  input: convInput,
  output: convOutput,
  video: { width, height, fit: "cover", forceTranscode: true },
});
if (!conversion.isValid) throw new Error("conv is not valid");
conversion.onProgress = (n) => console.log(`conv progress ${~~(100 * n)}%`);
await conversion.execute();

// add download link
const a = document.createElement("a");
a.href = URL.createObjectURL(new Blob([convOutput.target.buffer!]));
a.download = "bunny_converted.mp4";
a.innerHTML = "bunny_converted.mp4";
document.body.append(a);

// mosh
const moshInput = new Input({
  formats: ALL_FORMATS,
  source: new BufferSource(x(convOutput.target.buffer)),
});
const track = x(await moshInput.getPrimaryVideoTrack());
const decoderConfig = x(await track.getDecoderConfig());
const sink = new EncodedPacketSink(track);
const pkts: EncodedPacket[] = [];
for await (const pkt of sink.packets()) {
  pkts.push(pkt);
}
const endI = Math.min(pkts.length - 1, 100);
const repkts = [
  ...pkts.slice(0, endI),
  ...pkts.slice(1, endI),
  ...pkts.slice(1, endI),
  ...Array(100)
    .fill(null)
    .map(() => pkts[endI]),
];

// setup rendering
const canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
// canvas.style.width = "100vw";
// canvas.style.height = "100vh";
// canvas.style.objectFit = "contain";
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

// // display video
// const videoElt = document.createElement("video");
// document.body.append(videoElt);
// videoElt.src = URL.createObjectURL(new Blob([convOutput.target.buffer!]));
// videoElt.controls = true;
// videoElt.autoplay = true;
// videoElt.muted = true;
// videoElt.loop = true;
