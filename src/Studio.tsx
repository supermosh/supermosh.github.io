import { useState } from "react";

import { NumberInput } from "./NumberInput";
import { SelectInput } from "./SelectInput";

const codec = "vp8";
const width = 1920;
const height = 1080;
const fps = 24;

const encode = async (video: HTMLVideoElement) => {
  const chunks: EncodedVideoChunk[] = [];

  const encoder = new VideoEncoder({
    error: console.error,
    output: (chunk) => chunks.push(chunk),
  });
  encoder.configure({ codec, width, height });

  let keyFrame = true;
  await video.play();
  while (!video.ended) {
    console.log(
      `encoding ${~~((100 * video.currentTime) / video.duration)}%...`
    );
    const frame = new VideoFrame(video, {
      timestamp: video.currentTime * 1000,
    });
    encoder.encode(frame, { keyFrame });
    frame.close();
    keyFrame = false;
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  await encoder.flush();
  return chunks;
};

type Media = {
  name: string;
  video: HTMLVideoElement;
  file: File;
  chunks: EncodedVideoChunk[];
};

type Segment = {
  name: string;
  from: number;
  to: number;
  repeat: number;
};

export const Studio = () => {
  const [medias, setMedias] = useState<Media[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [src, setSrc] = useState("");

  const render = async () => {
    const chunks = segments.flatMap((segment) => {
      const media = medias.find((media) => media.name === segment.name)!;
      const notRepeated = media.chunks.slice(segment.from, segment.to);
      return Array(segment.repeat)
        .fill(null)
        .flatMap(() => notRepeated);
    });

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
    decoder.configure({ codec });

    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);
    recorder.addEventListener("dataavailable", (evt) => {
      const url = URL.createObjectURL(evt.data);
      console.log("render done");
      setSrc(url);
    });

    recorder.start();
    for (const chunk of chunks) {
      decoder.decode(chunk);
      await new Promise((r) => setTimeout(r, 1000 / fps));
    }
    recorder.stop();
  };

  return (
    <>
      <h1>Files</h1>
      <ul>
        {medias.map((media) => (
          <li key={media.name}>
            {`${media.name} (${media.video.videoWidth}x${media.video.videoHeight}, ${media.video.duration}s, ${media.chunks.length} frames)`}
          </li>
        ))}
        <li>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={async (evt) => {
              for (const file of evt.target.files ?? []) {
                const video = document.createElement("video");
                video.src = URL.createObjectURL(file);
                const chunks = await encode(video);
                let name = file.name;
                let i = 2;
                while (medias.map((media) => media.name).includes(name)) {
                  name = `${file.name} (${i})`;
                  i++;
                }
                setMedias([...medias, { name, file, video, chunks: chunks }]);
              }
              evt.target.value = "";
            }}
          />
        </li>
      </ul>
      <h1>Timeline</h1>
      <ol>
        {segments.map((segment, i) => (
          <li key={i}>
            <ul>
              <li>
                clip:
                <SelectInput
                  value={segment.name}
                  onChange={(name) => {
                    segments[i] = { ...segment, name };
                    setSegments([...segments]);
                  }}
                  options={medias.map((media) => media.name)}
                />
              </li>
              <li>
                from:
                <NumberInput
                  value={segment.from}
                  onChange={(from) => {
                    segments[i] = { ...segment, from };
                    setSegments([...segments]);
                  }}
                />
              </li>
              <li>
                to:
                <NumberInput
                  value={segment.to}
                  onChange={(to) => {
                    segments[i] = { ...segment, to };
                    setSegments([...segments]);
                  }}
                />
              </li>
              <li>
                repeat:
                <NumberInput
                  value={segment.repeat}
                  onChange={(repeat) => {
                    segments[i] = { ...segment, repeat };
                    setSegments([...segments]);
                  }}
                />
              </li>
              <li>
                <button
                  onClick={() => {
                    setSegments(segments.filter((s, si) => i !== si));
                  }}
                >
                  delete
                </button>
              </li>
            </ul>
          </li>
        ))}
        {medias[0] && (
          <li>
            <button
              onClick={() =>
                setSegments([
                  ...segments,
                  {
                    name: medias[0].name,
                    from: 0,
                    to: medias[0].chunks.length - 1,
                    repeat: 1,
                  },
                ])
              }
            >
              add
            </button>
          </li>
        )}
      </ol>
      <h1>Render</h1>
      <button onClick={render}>render</button>
      <br />
      {src && <video src={src} controls muted autoPlay loop />}
    </>
  );
};
