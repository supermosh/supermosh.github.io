import { useState } from "react";

import { decode, encode, record } from "./core";
import type { Segment } from "./types";

export const Renderer = ({
  files,
  segments,
}: {
  files: File[];
  segments: Segment[];
}) => {
  const [src, setSrc] = useState("");
  const [rendering, setRendering] = useState(false);

  const render = async () => {
    setRendering(true);

    const encoded = await Promise.all(files.map(encode));
    const [head, ...tail] = encoded;
    if (!head) throw new Error("not enough segments");
    const { width, height } = head;
    if (!tail.every((e) => e.width === width && e.height === height))
      throw new Error("should be of the same dimensions");
    const chunksByName = Object.fromEntries(
      files.map((file, i) => [file.name, encoded[i].chunks])
    );

    const allChunks = segments.flatMap((segment) => {
      const chunks = chunksByName[segment.name];
      if (segment.kind === "copy") return chunks;
      if (segment.kind === "glide")
        return Array(30)
          .fill(null)
          .map(() => chunks.slice(-1)[0]);
      throw new Error("not impl");
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
      <video src={src} muted loop autoPlay controls />
    </>
  );
};
