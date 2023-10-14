import { useState } from "react";

import { x } from "../shorts";
import { decode, record } from "./core";
import type { Segment, Vid } from "./types";

export const Renderer = ({
  vids,
  segments,
}: {
  vids: Record<string, Vid>;
  segments: Segment[];
}) => {
  const [src, setSrc] = useState("");
  const [rendering, setRendering] = useState(false);

  const render = async () => {
    setRendering(true);

    const { width, height } = vids[segments[0].name];

    const allChunks = segments.flatMap((segment) => {
      const chunks = x(vids[segment.name]).chunks;
      switch (segment.kind) {
        case "copy":
          return chunks;
        case "glide":
          return Array(chunks.length)
            .fill(null)
            .map(() => chunks.slice(-1)[0]);
        case "drift":
          return chunks.slice(1);
      }
    });

    const frames = await decode(allChunks);
    const newSrc = await record(width, height, frames);
    setSrc(newSrc);
    setRendering(false);
  };

  return (
    <>
      <h1>Render</h1>
      <button onClick={render} disabled={rendering}>
        render
      </button>
      <a href={src} download="supermosh.webm">
        download
      </a>
      <video src={src} muted loop autoPlay controls />
    </>
  );
};
