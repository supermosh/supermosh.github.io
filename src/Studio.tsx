import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";

import { computeChunks } from "./lib";

type Vid = {
  name: string;
  src: string;
  chunks: EncodedVideoChunk[];
};

const width = 640;
const height = 360;
const fps = 30;

const Uploader = ({
  ffmpeg,
  vids,
  onUpload,
  progress,
}: {
  ffmpeg: FFmpeg;
  vids: Vid[];
  onUpload: (newVid: Vid) => unknown;
  progress: number;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <div>Upload video file:</div>
      <div>
        <input
          type="file"
          accept="video/*"
          onChange={async (evt) => {
            setLoading(true);
            const file = evt.target.files![0];
            const src = URL.createObjectURL(file);
            const withoutSpaces = file.name.replace(/\s/g, "_");
            let name = withoutSpaces;
            let i = 0;
            while (vids.map((vid) => vid.name).includes(name)) {
              name = `${withoutSpaces}_${i}`;
              i++;
            }
            const chunks = await computeChunks(
              ffmpeg,
              file,
              name,
              width,
              height
            );
            onUpload({ name, src, chunks });
            evt.target.value = "";
            setLoading(false);
          }}
          disabled={loading}
        />
      </div>
      {loading && (
        <div>Pre-processing video ({Math.floor(100 * progress)}%)...</div>
      )}
    </>
  );
};

export const Studio = () => {
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(true);
  const ffmpegRef = useRef(new FFmpeg());
  const [vids, setVids] = useState<Vid[]>([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      ffmpegRef.current.on("progress", (evt) => setProgress(evt.progress));

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      console.log("loading ffmpeg...");
      await ffmpegRef.current.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      setLoadingFfmpeg(false);
      console.log("ffmpeg loaded");
    })();
  }, []);

  return loadingFfmpeg ? (
    <>Loading...</>
  ) : (
    <>
      <h1>Files</h1>
      <table>
        <tbody>
          {vids.map((vid) => (
            <tr key={vid.name}>
              <td style={{ padding: "0" }}>
                <video
                  style={{ height: "3em", width: "auto", display: "block" }}
                  src={vid.src}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              </td>
              <td>{vid.name}</td>
              <td>{vid.chunks.length} frames</td>
              <td>{(vid.chunks.length / fps).toFixed(2)}s</td>
              <td style={{ padding: "0" }}>
                <button
                  style={{ height: "3em", width: "3em" }}
                  onClick={() => {
                    setVids(vids.filter((v) => v !== vid));
                  }}
                >
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <Uploader
        vids={vids}
        ffmpeg={ffmpegRef.current}
        onUpload={(vid) => setVids([...vids, vid])}
        progress={progress}
      />
    </>
  );
};
