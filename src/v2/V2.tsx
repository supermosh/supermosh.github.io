import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { FilesEditor } from "./FilesEditor";
import { Rendering } from "./Rendering";
import { Timeline } from "./Timeline";
import { Segment, Vid } from "./types";

export const V2 = () => {
  const [loadingFfmpeg, setLoadingFfmpeg] = useState(true);
  const ffmpegRef = useRef(new FFmpeg());
  const [vids, setVids] = useState<Vid[]>([]);
  const [progress, setProgress] = useState(0);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [config, setConfig] = useState<VideoDecoderConfig | null>(null);
  const [settings, setSettings] = useState({
    width: 640,
    height: 480,
  });
  const [preprocessSettings, setPreprocessSettings] = useState(settings);

  useEffect(() => {
    (async () => {
      ffmpegRef.current.on("progress", (evt) => setProgress(evt.progress));

      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      console.log("loading ffmpeg...");
      await ffmpegRef.current.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
      });
      setLoadingFfmpeg(false);
      console.log("ffmpeg loaded");
    })();
  }, []);

  return (
    <>
      <div
        style={{
          border: "1px solid orange",
          color: "orange",
          margin: "8px",
          padding: "8px",
        }}
      >
        You are using the deprecated V2 version of the Supermosh Studio, kept
        while Studio V3 is still in beta, but you are encouraged to try out the
        (much!) faster <Link to="/v3">Studio V3</Link>
      </div>
      {loadingFfmpeg ? (
        <div>Loading...</div>
      ) : (
        <main className="Studio">
          <FilesEditor
            vids={vids}
            setVids={setVids}
            progress={progress}
            // eslint-disable-next-line react-hooks/refs
            ffmpeg={ffmpegRef.current}
            onConfig={setConfig}
            settings={settings}
            preprocessSettings={preprocessSettings}
            setPreprocessSettings={setPreprocessSettings}
          />
          <Timeline vids={vids} segments={segments} setSegments={setSegments} />
          <Rendering
            vids={vids}
            segments={segments}
            config={config}
            settings={settings}
            setSettings={setSettings}
            preprocessSettings={preprocessSettings}
          />
        </main>
      )}
    </>
  );
};
