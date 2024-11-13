import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Dispatch, SetStateAction, useState } from "react";

import { computeChunks } from "./lib";
import { Settings, Vid } from "./types";

export const FilesEditor = ({
  vids,
  setVids,
  ffmpeg,
  progress,
  onConfig,
  settings,
}: {
  vids: Vid[];
  setVids: React.Dispatch<React.SetStateAction<Vid[]>>;
  ffmpeg: FFmpeg;
  progress: number;
  onConfig: Dispatch<SetStateAction<VideoDecoderConfig | null>>;
  settings: Settings;
}) => {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <h1>Files</h1>
      {vids.length === 0 ? (
        <p>No video uploaded yet</p>
      ) : (
        <ul>
          {vids.map((vid) => (
            <li key={vid.name}>
              {vid.name} ({(vid.chunks.length / settings.fps).toFixed(2)}s)
            </li>
          ))}
        </ul>
      )}
      <p>Upload video file:</p>
      <p>
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
              settings.width,
              settings.height,
              onConfig
            );
            setVids([...vids, { name, src, chunks }]);
            evt.target.value = "";
            setLoading(false);
          }}
          disabled={loading}
        />
      </p>
      {loading && (
        <p>
          Pre-processing video ({Math.floor(100 * progress)}%)...
          <progress value={progress} />
        </p>
      )}
    </>
  );
};
