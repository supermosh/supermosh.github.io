import {
  ALL_FORMATS,
  BufferSource,
  BufferTarget,
  Conversion,
  Input,
  Mp4OutputFormat,
  Output,
  StreamTarget,
  UrlSource,
} from "mediabunny";
import "../index.css";

console.log("start");

// TODO use stream chunks?

// baseline codec avc1.42c01f

// scale and convert
const width = 480;
const height = 270;
const convInput = new Input({
  formats: ALL_FORMATS,
  source: new UrlSource("/samples/forest.mp4"),
});
const output = new Output({
  format: new Mp4OutputFormat(),
  target: new BufferTarget(),
});
const conversion = await Conversion.init({
  input: convInput,
  output,
  video: { width, height, fit: "cover" },
});
if (!conversion.isValid) throw new Error("conv is not valid");
conversion.onProgress = (n) => console.log(`conv progress ${~~(100 * n)}%`);
await conversion.execute();

// mosh
// TODO

// display video
const videoElt = document.createElement("video");
document.body.append(videoElt);
videoElt.src = URL.createObjectURL(new Blob([output.target.buffer!]));
videoElt.controls = true;
videoElt.autoplay = true;
videoElt.muted = true;
videoElt.loop = true;
