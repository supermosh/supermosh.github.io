import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { useEffect, useRef, useState } from "react";

import { FilesEditor } from "./FilesEditor";
import { Rendering } from "./Rendering";
import { SegmentsEditor } from "./SegmentsEditor";
import { Segment, Vid } from "./types";

export const Studio = () => {
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
    <main>
      <FilesEditor
        vids={vids}
        setVids={setVids}
        progress={progress}
        ffmpeg={ffmpegRef.current}
        onConfig={setConfig}
        settings={settings}
        preprocessSettings={preprocessSettings}
        setPreprocessSettings={setPreprocessSettings}
      />
      <SegmentsEditor
        vids={vids}
        segments={segments}
        setSegments={setSegments}
      />
      <Rendering
        vids={vids}
        segments={segments}
        config={config}
        settings={settings}
        setSettings={setSettings}
        preprocessSettings={preprocessSettings}
      />
    </main>
  );
};
