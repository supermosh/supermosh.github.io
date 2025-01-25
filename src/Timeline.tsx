import React, { Dispatch, SetStateAction } from "react";
import { useState } from "react";

import { Section } from "./components/Section";
import { NumberInput } from "./NumberInput";
import { RangePreview } from "./RangePreview";
import { SelectInput } from "./SelectInput";
import { Segment, Vid } from "./types";

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const Timeline = ({
  segments,
  setSegments,
  vids,
}: {
  segments: Segment[];
  setSegments: Dispatch<SetStateAction<Segment[]>>;
  vids: Vid[];
}) => {
  const [preview, setPreview] = useState<null | { vid: Vid; i: number }>(null);
  return (
    <Section name="Timeline">
      {vids.length === 0 ? (
        <p>Please upload a video</p>
      ) : (
        <>
          {segments.length === 0 ? (
            <p>No segments defined</p>
          ) : (
            <div className="segments">
              {segments.map((s, i) => {
                const getVid = () => vids.find((vid) => vid.name === s.name)!;
                const swap = (j: number, k: number) => {
                  [segments[j], segments[k]] = [segments[k], segments[j]];
                  segments[0].from = 0;
                  setSegments([...segments]);
                };

                return (
                  <React.Fragment key={i}>
                    <SelectInput
                      value={s.name}
                      onChange={(name) => {
                        s.name = name;
                        s.to = clamp(s.to, -Infinity, getVid().chunks.length);
                        s.from = clamp(s.from, 0, s.to - 1);
                        setSegments([...segments]);
                      }}
                      options={vids.map((vid) => vid.name)}
                    />
                    <NumberInput
                      value={s.from}
                      onChange={(from) => {
                        s.from = from;
                        setSegments([...segments]);
                        setPreview({ vid: getVid(), i: from });
                      }}
                      min={0}
                      max={s.to - 1}
                      disabled={i === 0}
                      onFocus={() => setPreview({ vid: getVid(), i: s.from })}
                      onBlur={() => setPreview(null)}
                    />
                    <NumberInput
                      value={s.to}
                      onChange={(to) => {
                        s.to = to;
                        setSegments([...segments]);
                        setPreview({ vid: getVid(), i: to });
                      }}
                      min={s.from + 1}
                      max={getVid().chunks.length}
                      onFocus={() => setPreview({ vid: getVid(), i: s.to })}
                      onBlur={() => setPreview(null)}
                    />
                    <NumberInput
                      value={s.repeat}
                      onChange={(repeat) => {
                        s.repeat = repeat;
                        setSegments([...segments]);
                      }}
                      min={1}
                    />
                    <button disabled={i === 0} onClick={() => swap(i, i - 1)}>
                      Up
                    </button>
                    <button
                      disabled={i === segments.length - 1}
                      onClick={() => swap(i, i + 1)}
                    >
                      down
                    </button>
                    <button
                      onClick={() => {
                        setSegments(segments.filter((_, j) => i !== j));
                      }}
                    >
                      delete
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <button
            onClick={() => {
              setSegments([
                ...segments,
                {
                  name: vids[0]!.name,
                  from: 0,
                  to: vids[0].chunks.length,
                  repeat: 1,
                },
              ]);
            }}
          >
            Add segment
          </button>
        </>
      )}
      {preview && <RangePreview vid={preview.vid} i={preview.i} />}
    </Section>
  );
};
