import type { Dispatch, SetStateAction } from "react";

import { Select } from "../components/Select";
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
              <li>
                <Select
                  value={segment.name}
                  options={files.map((file) => file.name)}
                  onChange={(name) => {
                    segment.name = name;
                    setSegments([...segments]);
                  }}
                />
              </li>
              <li>
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
              </li>
              {segment.kind === "copy" && (
                <>
                  <li>
                    <span>start</span>
                    <input
                      type="range"
                      value={segment.start}
                      onChange={(evt) => {
                        segment.start = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                  <li>
                    <span>end</span>
                    <input
                      type="range"
                      value={segment.end}
                      onChange={(evt) => {
                        segment.end = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                </>
              )}
              {segment.kind === "drift" && (
                <>
                  <li>
                    <span>start</span>
                    <input
                      type="range"
                      value={segment.start}
                      onChange={(evt) => {
                        segment.start = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                  <li>
                    <span>end</span>
                    <input
                      type="range"
                      value={segment.end}
                      onChange={(evt) => {
                        segment.end = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                </>
              )}
              {segment.kind === "glide" && (
                <>
                  <li>
                    <span>start</span>
                    <input
                      type="range"
                      value={segment.start}
                      onChange={(evt) => {
                        segment.start = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                  <li>
                    <span>time</span>
                    <input
                      type="range"
                      value={segment.time}
                      onChange={(evt) => {
                        segment.time = +evt.target.value;
                        setSegments([...segments]);
                      }}
                    />
                  </li>
                </>
              )}
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
