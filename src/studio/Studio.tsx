import type { ChangeEventHandler } from "react";
import { useState } from "react";

import { x } from "../shorts";

type Segment = { name: string } & (
  | { kind: "copy"; start: number; end: number }
  | { kind: "glide"; start: number; time: number }
  | { kind: "drift"; start: number; end: number }
);

export const Studio = () => {
  const [files, setFiles] = useState([] as File[]);

  const onUpload: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const file = x(evt.target.files)[0];
    evt.target.value = "";
    setFiles([...files, file]);
  };

  const [segments, setSegments] = useState<Segment[]>([]);

  return (
    <>
      <h1>Files</h1>
      <ul>
        {files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
        <li>
          <input type="file" accept="video/*" onChange={onUpload} />
        </li>
      </ul>
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
