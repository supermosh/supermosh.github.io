import { Dispatch, SetStateAction, useState } from "react";

import { record } from "./lib";
import { NumberInput } from "./NumberInput";
import { Segment, Settings, Vid } from "./types";

export const Rendering = ({
  segments,
  vids,
  config,
  settings,
  setSettings,
}: {
  segments: Segment[];
  vids: Vid[];
  config: VideoDecoderConfig | null;
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
}) => {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState("");
  const [downloadName, setDownloadName] = useState("Supermosh.webm");

  return (
    <>
      <h1>Rendering</h1>
      <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <NumberInput
          value={settings.width}
          onChange={(width) => setSettings({ ...settings, width })}
          min={4}
          step={4}
        />
        <span>&times;</span>
        <NumberInput
          value={settings.height}
          onChange={(height) => setSettings({ ...settings, height })}
          min={4}
          step={4}
        />
        <span>px</span>
      </p>

      {segments.length === 0 || config === null ? (
        <p>Please add segments in the timeline</p>
      ) : (
        <div>
          <button
            onClick={async () => {
              setRendering(true);
              setSrc("");

              const chunks = segments.flatMap((s) =>
                Array(s.repeat)
                  .fill(null)
                  .flatMap(() =>
                    vids
                      .find((vid) => vid.name === s.name)!
                      .chunks.slice(s.from, s.to)
                  )
              );
              const mimeType = MediaRecorder.isTypeSupported("video/mp4")
                ? "video/mp4"
                : "video/webm";
              const newSrc = await record(
                chunks,
                config,
                mimeType,
                settings,
                setProgress
              );
              setSrc(newSrc);
              setDownloadName(
                `Supermosh_${new Date()
                  .toISOString()
                  .substring(0, 19)
                  .replaceAll(":", "-")}.${
                  mimeType === "video/mp4" ? "mp4" : "webm"
                }`
              );
              setRendering(false);
            }}
            disabled={rendering}
          >
            render
          </button>
          {rendering && <progress value={progress} />}
        </div>
      )}
      {src && (
        <>
          <p>
            <video
              style={{
                width: "100%",
                maxHeight: "50vh",
              }}
              src={src}
              muted
              loop
              controls
              playsInline
              autoPlay
            />
          </p>
          <p>
            <a download={downloadName} href={src}>
              Download
            </a>
          </p>
        </>
      )}
    </>
  );
};
