import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Dispatch, SetStateAction, useState } from "react";

import { Section } from "./components/Section";
import { computeChunks, FPS } from "./lib";
import { Settings, Vid } from "./types";

const initialProgress = {
  processed: 0,
  total: 0
};

export const FilesEditor = ({
  vids,
  setVids,
  ffmpeg,
  progress,
  onConfig,
  settings,
  preprocessSettings,
  setPreprocessSettings,
}: {
  vids: Vid[];
  setVids: React.Dispatch<React.SetStateAction<Vid[]>>;
  ffmpeg: FFmpeg;
  progress: number;
  onConfig: Dispatch<SetStateAction<VideoDecoderConfig | null>>;
  settings: Settings;
  preprocessSettings: Settings;
  setPreprocessSettings: Dispatch<SetStateAction<Settings>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [filesProgress, setFilesProgress] = useState(initialProgress);

  return (
    <Section name="Files">
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
          accept="video/*,image/*"
          multiple
          onChange={async (evt) => {
            setLoading(true);
            if (evt.target.files) {
              setFilesProgress({ processed: 0, total: evt.target.files.length });
              for (const file of evt.target.files) {
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
                setVids(prevVids => [...prevVids, { file, name, chunks, src }]);
                setFilesProgress(prev => ({ ...prev, processed: prev.processed + 1 }));
              }
            }
            evt.target.value = "";
            setLoading(false);
            setPreprocessSettings(settings);
            setFilesProgress(initialProgress);
          }}
          disabled={loading}
        />
      </p>
      {JSON.stringify(preprocessSettings) !== JSON.stringify(settings) &&
        !!vids.length && (
          <p>
            <button
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setFilesProgress({ processed: 0, total: vids.length });
                for (const vid of vids) {
                  vid.chunks = await computeChunks(
                    ffmpeg,
                    vid.file,
                    vid.name,
                    settings.width,
                    settings.height,
                    onConfig
                  );
                  setFilesProgress(prev => ({ ...prev, processed: prev.processed + 1 }));
                }
                setVids([...vids]);
                setPreprocessSettings(settings);
                setLoading(false);
                setFilesProgress(initialProgress);
              }}
            >
              Reprocess files
            </button>
          </p>
        )}
      {loading && (
        <p>
          <span>Processed {filesProgress.processed} of {filesProgress.total} files</span>
          <br />
          <progress value={progress} />
        </p>
      )}
    </Section>
  );
};
