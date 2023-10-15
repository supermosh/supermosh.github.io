import type { Dispatch, SetStateAction } from "react";

import { Select } from "../components/Select";
import { StartEndEditor } from "./StartEndEditor";
import { StartTimeEditor } from "./StartTimeEditor";
import type { Segment, Vid } from "./types";

export const SegmentsEditor = ({
  vids,
  segments,
  setSegments,
}: {
  vids: Record<string, Vid>;
  segments: Segment[];
  setSegments: Dispatch<SetStateAction<Segment[]>>;
}) => {
  return (
    <>
      <h1>Segments</h1>
      <ol>
        {segments.map((segment, i) => (
          <li key={i}>
            <button
              onClick={() => {
                const tmp = segments[i];
                segments[i] = segments[i - 1];
                segments[i - 1] = tmp;
                setSegments([...segments]);
              }}
              disabled={i === 0}
            >
              up
            </button>
            <button
              onClick={() => {
                const tmp = segments[i];
                segments[i] = segments[i + 1];
                segments[i + 1] = tmp;
                setSegments([...segments]);
              }}
              disabled={i === segments.length - 1}
            >
              down
            </button>
            <Select
              value={segment.kind}
              options={["copy", "glide", "drift"]}
              onChange={(kind) => {
                // @ts-ignore
                segments[i] = (
                  {
                    copy: {
                      name: segment.name,
                      kind,
                      start: 0,
                      end: 0,
                    },
                    glide: {
                      name: segment.name,
                      kind,
                      start: 0,
                      time: 0,
                    },
                    drift: {
                      name: segment.name,
                      kind,
                      start: 0,
                      end: 0,
                    },
                  } as const
                )[kind];
                setSegments([...segments]);
              }}
            />
            <Select
              value={segment.name}
              options={Object.keys(vids)}
              onChange={(name) => {
                segment.name = name;
                setSegments([...segments]);
              }}
            />
            {(segment.kind === "copy" || segment.kind === "drift") && (
              <StartEndEditor
                value={segment}
                onChange={(newSegment) => {
                  segments[i] = newSegment;
                  setSegments([...segments]);
                }}
                vid={vids[segment.name]}
              />
            )}
            {segment.kind === "glide" && (
              <StartTimeEditor
                value={segment}
                onChange={(newSegment) => {
                  segments[i] = newSegment;
                  setSegments([...segments]);
                }}
                vid={vids[segment.name]}
              />
            )}
          </li>
        ))}
      </ol>
      {Object.keys(vids).length > 0 && (
        <button
          onClick={() =>
            setSegments([
              ...segments,
              {
                name: Object.keys(vids)[0],
                kind: "copy",
                start: 0,
                end: 0,
              },
            ])
          }
        >
          add
        </button>
      )}
    </>
  );
};
