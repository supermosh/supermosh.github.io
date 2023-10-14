import { useState } from "react";

import { FilesEditor } from "./FilesEditor";
import type { Vid } from "./types";

export const Studio = () => {
  const [vids, setVids] = useState<Record<string, Vid>>({});
  // const [segments, setSegments] = useState<Segment[]>([]);

  return (
    <>
      <FilesEditor vids={vids} setVids={setVids} />
      {/* <SegmentsEditor
        files={files}
        segments={segments}
        setSegments={setSegments}
      />
      <Renderer files={files} segments={segments} /> */}
    </>
  );
};
