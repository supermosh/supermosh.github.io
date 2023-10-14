import { useState } from "react";

import { FilesEditor } from "./FilesEditor";
import { Renderer } from "./Renderer";
import { SegmentsEditor } from "./SegmentsEditor";
import type { Segment, Vid } from "./types";

export const Studio = () => {
  const [vids, setVids] = useState<Record<string, Vid>>({});
  const [segments, setSegments] = useState<Segment[]>([]);

  return (
    <>
      <FilesEditor vids={vids} setVids={setVids} />
      <SegmentsEditor
        vids={vids}
        segments={segments}
        setSegments={setSegments}
      />
      <Renderer vids={vids} segments={segments} />
    </>
  );
};
