import { useState } from "react";

import { FilesEditor } from "./FilesEditor";
import { SegmentsEditor } from "./SegmentsEditor";
import type { Segment } from "./types";

export const Studio = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  return (
    <>
      <FilesEditor files={files} setFiles={setFiles} />
      <SegmentsEditor
        files={files}
        segments={segments}
        setSegments={setSegments}
      />
    </>
  );
};
