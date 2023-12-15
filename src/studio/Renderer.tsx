import styled from "@emotion/styled";
import { useState } from "react";

import { Button, LinkButton } from "../components/Button";
import { ProgressBar } from "../components/ProgressBar";
import { x } from "../shorts";
import { decode, record } from "./core";
import type { Segment, Vid } from "./types";

const Vert = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
  align-items: flex-start;
  > video {
    max-width: 100%;
  }
`;

const Hor = styled.div`
  display: flex;
  gap: 8px;
`;

export const Renderer = ({
  vids,
  segments,
}: {
  vids: Record<string, Vid>;
  segments: Segment[];
}) => {
  const [src, setSrc] = useState("");
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);

  const cantRender = (() => {
    if (!segments.length) return "No segments added yet";
    if (segments[0]!.kind !== "copy")
      return "First segment should be of kind 'copy'";
    return "";
  })();

  const render = async () => {
    setRendering(true);
    setProgress(0);

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
    const newSrc = await record(width, height, frames, setProgress);
    setSrc(newSrc);
    setRendering(false);
  };

  return (
    <>
      <h1>Render</h1>
      <Vert>
        {cantRender && <div>Cant render: {cantRender}</div>}
        <Hor>
          <Button onClick={render} disabled={rendering || !!cantRender}>
            render
          </Button>
          {rendering && <ProgressBar progress={progress} />}
        </Hor>
        {src && (
          <>
            <video src={src} muted loop autoPlay controls />
            <LinkButton
              href={src}
              download={`supermosh_${new Date()
                .toISOString()
                .substring(0, 19)}`}
            >
              download
            </LinkButton>
          </>
        )}
      </Vert>
    </>
  );
};
