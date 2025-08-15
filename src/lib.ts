import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import {
  BufferTarget,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  VideoSample,
  VideoSampleSource,
} from "mediabunny";
import { createFile, DataStream, MP4ArrayBuffer, MP4File } from "mp4box";

import { Settings } from "./types";

export const FPS = 30;

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
  new Promise<EncodedVideoChunk[]>(async (resolve, reject) => {
    try {
      const inputName = `input_${name}.mp4`;
      const outputName = `output_${name}_${Math.random()
        .toFixed(10)
        .substring(2)}.mp4`;
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
  settings: Settings,
  onProgress: (progress: number) => unknown
) => {
  const source = new VideoSampleSource({ codec: "avc", bitrate: QUALITY_HIGH });
  const output = new Output({
    format: new Mp4OutputFormat(),
    target: new BufferTarget(),
  });
  output.addVideoTrack(source);
  let i = 0;
  const decoder = new VideoDecoder({
    error: console.error,
    output: (frame) => {
      console.log(i);
      const sample = new VideoSample(frame, { timestamp: i / FPS });
      source.add(sample);
      sample.close();
      i++;
    },
  });
  decoder.configure(config);
  await output.start();

  for (let j = 0; j < chunks.length; j++) {
    decoder.decode(chunks[j]);
    onProgress(j / chunks.length);
  }

  await decoder.flush();
  await output.finalize();
  const blob = new Blob([output.target.buffer!], {
    type: output.format.mimeType,
  });
  return URL.createObjectURL(blob);
};
