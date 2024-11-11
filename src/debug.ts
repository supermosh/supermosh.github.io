import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

(async () => {
  const ffmpeg = new FFmpeg();
  ffmpeg.on("log", console.log);

  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    workerURL: await toBlobURL(
      `${baseURL}/ffmpeg-core.worker.js`,
      "text/javascript"
    ),
  });

  await ffmpeg.writeFile(
    "input.mp4",
    await fetchFile("/blink@1920x1080_24fps.mp4")
  );
  await ffmpeg.exec(
    "-i input.mp4 -vcodec libx264 -g 99999999 -bf 0 -flags:v +cgop -pix_fmt yuv420p -movflags faststart -crf 15 output.mp4".split(
      " "
    )
  );
  const data = await ffmpeg.readFile("output.mp4");
  const video = document.createElement("video");
  document.body.append(video);
  video.src = URL.createObjectURL(
    new Blob([(data as Uint8Array).buffer], { type: "video/mp4" })
  );
  video.muted = true;
  video.autoplay = true;
  video.controls = true;
  console.log("done");
})();
