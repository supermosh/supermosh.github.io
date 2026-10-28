import { Dispatch, SetStateAction, useState } from "react";

import { Section } from "./components/Section";
import { record } from "./lib";
import { NumberInput } from "./NumberInput";
import { Segment, Settings, Vid } from "./types";

export const Rendering = ({
  segments,
  vids,
  config,
  settings,
  setSettings,
  preprocessSettings,
}: {
  segments: Segment[];
  vids: Vid[];
  config: VideoDecoderConfig | null;
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  preprocessSettings: Settings;
}) => {
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [src, setSrc] = useState("");
  const [downloadName, setDownloadName] = useState("");
  const [hardwareAcceleration, setHardwareAcceleration] =
    useState<HardwareAcceleration>("prefer-software");
  const [error, setError] = useState("");

  return (
    <Section name="Rendering">
      <p>
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
        {[
          { name: "480p", width: 640, height: 480 },
          { name: "720p", width: 1280, height: 720 },
          { name: "1080p", width: 1920, height: 1080 },
        ].map(({ name, width, height }) => (
          <button
            key={name}
            onClick={() => setSettings({ width, height })}
            disabled={settings.width === width && settings.height === height}
          >
            {name}
          </button>
        ))}
        <button
          onClick={() =>
            setSettings({ width: settings.height, height: settings.width })
          }
        >
          flip
        </button>
      </p>
      <p>
        Hardware acceleration{" "}
        <select
          value={hardwareAcceleration}
          onChange={(evt) =>
            setHardwareAcceleration(evt.target.value as HardwareAcceleration)
          }
        >
          <option value="no-preference">Auto</option>
          <option value="prefer-software">CPU</option>
          <option value="prefer-hardware">GPU</option>
        </select>
      </p>

      {segments.length === 0 || config === null ? (
        <p>Please add segments in the timeline</p>
      ) : segments.every(
          (s) => vids.find((v) => v.name === s.name)!.chunks.length == 1,
        ) ? (
        <p>
          Can't render when all segments are of length 1, as that would mean
          rendering a sequence of images, which would not produce any glitch
        </p>
      ) : JSON.stringify(preprocessSettings) !== JSON.stringify(settings) ? (
        <p>
          Rendering settings differ from files settings, please reprocess the
          files
        </p>
      ) : (
        <div>
          <button
            onClick={async () => {
              setRendering(true);
              setSrc("");
              setError("");

              const chunks = segments.flatMap((s) =>
                Array(s.repeat)
                  .fill(null)
                  .flatMap(() =>
                    vids
                      .find((vid) => vid.name === s.name)!
                      .chunks.slice(s.from, s.to),
                  ),
              );
              const mimeType = MediaRecorder.isTypeSupported("video/mp4")
                ? "video/mp4"
                : "video/webm";
              try {
                const newSrc = await record(
                  chunks,
                  config,
                  mimeType,
                  settings,
                  hardwareAcceleration,
                  setProgress,
                );
                setSrc(newSrc);
                setDownloadName(
                  `Supermosh_${new Date()
                    .toISOString()
                    .substring(0, 19)
                    .replaceAll(":", "-")}.${
                    mimeType === "video/mp4" ? "mp4" : "webm"
                  }`,
                );
              } catch (e) {
                setError(
                  `Rendering failed: ${
                    e
                  }. Please try with the latest Firefox or Chromium, use CPU as hardware acceleration, and if the error persists, report the issue on github.`,
                );
              } finally {
                setRendering(false);
              }
            }}
            disabled={rendering}
          >
            render
          </button>
          {rendering && <progress value={progress} />}
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
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
    </Section>
  );
};
