import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { createFile, DataStream, MP4ArrayBuffer, MP4File } from "mp4box";

const width = 640;
const height = 360;
const fps = 30;

const computeDescription = (file: MP4File, trackId: number) => {
  const track = file.getTrackById(trackId);
  for (const entry of track.mdia.minf.stbl.stsd.entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (box) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }
  throw new Error("avcC, hvcC, vpcC, or av1C box not found");
};

export const computeChunks = (
  ffmpeg: FFmpeg,
  inputFile: File,
  name: string,
  width: number,
  height: number,
  onConfig: (config: VideoDecoderConfig) => unknown
) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise<EncodedVideoChunk[]>(async (resolve, reject) => {
    try {
      const inputName = `input_${name}.mp4`;
      const outputName = `output_${name}.mp4`;
      await ffmpeg.writeFile(inputName, await fetchFile(inputFile));
      await ffmpeg.exec(
        `-i ${inputName} -vf scale=${width}:${height} -vcodec libx264 -g 99999999 -bf 0 -flags:v +cgop -pix_fmt yuv420p -movflags faststart -crf 15 ${outputName}`.split(
          " "
        )
      );
      const data = (await ffmpeg.readFile(outputName)) as Uint8Array;

      const file = createFile();
      file.onError = console.error;
      file.onReady = (info) => {
        const track = info.videoTracks[0];
        onConfig({
          codec: track.codec.startsWith("vp08") ? "vp8" : track.codec,
          codedHeight: track.video.height,
          codedWidth: track.video.width,
          description: computeDescription(file, track.id),
        });
        file.setExtractionOptions(track.id);
        file.start();
      };
      file.onSamples = async (_trackId, _ref, samples) => {
        const chunks = samples.map(
          (sample) =>
            new EncodedVideoChunk({
              type: sample.is_sync ? "key" : "delta",
              timestamp: (1e6 * sample.cts) / sample.timescale,
              duration: (1e6 * sample.duration) / sample.timescale,
              data: sample.data,
            })
        );

        resolve(chunks);
      };
      const buffer = new ArrayBuffer(data.byteLength) as MP4ArrayBuffer;
      new Uint8Array(buffer).set(data);
      buffer.fileStart = 0;
      file.appendBuffer(buffer);
    } catch (e) {
      reject(e);
    }
  });

export const record = async (
  chunks: EncodedVideoChunk[],
  config: VideoDecoderConfig,
  mimeType: string,
  onProgress: (progress: number) => unknown
) =>
  new Promise<string>((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    const decoder = new VideoDecoder({
      error: console.error,
      output: (frame) => {
        ctx.drawImage(frame, 0, 0);
        frame.close();
      },
    });
    decoder.configure(config);

    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream, { mimeType });
    recorder.addEventListener("dataavailable", (evt) => {
      const src = URL.createObjectURL(evt.data);
      resolve(src);
    });

    recorder.start();
    let i = 0;
    const interval = setInterval(() => {
      onProgress(i / chunks.length);
      decoder.decode(chunks[i]);
      i++;
      if (i === chunks.length - 1) {
        recorder.stop();
        clearInterval(interval);
      }
    }, 1000 / fps);
  });
