import type { Dispatch, SetStateAction } from "react";

import type { Segment } from "./types";

export const SegmentsEditor = ({
  files,
  segments,
  setSegments,
}: {
  files: File[];
  segments: Segment[];
  setSegments: Dispatch<SetStateAction<Segment[]>>;
}) => {
  return (
    <>
      <h1>Segments</h1>
      <ol>
        {segments.map((segment, i) => (
          <li key={i}>
            <ul>
              {Object.entries(segment).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </li>
        ))}
        {files.length > 0 && (
          <li>
            <button
              onClick={() =>
                setSegments([
                  ...segments,
                  { name: files[0].name, kind: "copy", start: 0, end: 0 },
                ])
              }
            >
              add
            </button>
          </li>
        )}
      </ol>
    </>
  );
};
