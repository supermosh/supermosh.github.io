import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

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

const video = document.createElement("video");
// @ts-expect-error
video.src = URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }));
video.muted = true;
video.autoplay = true;
video.loop = true;
video.controls = true;
document.body.append(video);
