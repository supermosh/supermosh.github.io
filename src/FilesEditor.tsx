import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Dispatch, SetStateAction, useState } from "react";

import { computeChunks, FPS } from "./lib";
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
  const [preprocessSettings, setPreprocessSettings] = useState(settings);

  return (
    <>
      <h1>Files</h1>
      {vids.length === 0 ? (
        <p>No video uploaded yet</p>
      ) : (
        <ul>
          {vids.map((vid) => (
            <li key={vid.name}>
              {vid.name} ({(vid.chunks.length / FPS).toFixed(2)}s,{" "}
              {vid.chunks.length} frames)
            </li>
          ))}
        </ul>
      )}
      <p>
        <span>Upload video:</span>
        <input
          type="file"
          accept="video/*"
          onChange={async (evt) => {
            setLoading(true);
            const file = evt.target.files![0];
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
            setVids([...vids, { file, name, chunks }]);
            evt.target.value = "";
            setLoading(false);
            setPreprocessSettings(settings);
          }}
          disabled={loading}
        />
      </p>
      {JSON.stringify(preprocessSettings) !== JSON.stringify(settings) && (
        <p>
          <button
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              for (const vid of vids) {
                vid.chunks = await computeChunks(
                  ffmpeg,
                  vid.file,
                  vid.name,
                  settings.width,
                  settings.height,
                  onConfig
                );
              }
              setVids([...vids]);
              setPreprocessSettings(settings);
              setLoading(false);
            }}
          >
            Reprocess files
          </button>
        </p>
      )}
      {loading && (
        <p>
          <progress value={progress} />
        </p>
      )}
    </>
  );
};
