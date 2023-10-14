import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";
import { useRef } from "react";

import { x } from "../shorts";
import { encode } from "./core";
import type { Vid } from "./types";

export const FilesEditor = ({
  vids,
  setVids,
}: {
  vids: Record<string, Vid>;
  setVids: Dispatch<SetStateAction<Record<string, Vid>>>;
}) => {
  const onUpload: ChangeEventHandler<HTMLInputElement> = async (evt) => {
    const file = x(evt.target.files)[0];
    evt.target.value = "";
    const src = URL.createObjectURL(file);
    const { width, height, chunks } = await encode(file);
    let name = file.name;
    while (name in vids) name += ".";
    setVids({ ...vids, [name]: { src, chunks, width, height } });
  };

  // debug
  const fetched = useRef(false);
  (async () => {
    if (fetched.current || Object.keys(vids).length > 0) return;
    await Promise.all(
      ["motocross.mp4"].map(async (name) => {
        const resp = await fetch(`/${name}`);
        const blob = await resp.blob();
        const file = new File([blob], name);
        // @ts-ignores
        onUpload({ target: { files: [file] } });
      })
    );
  })();

  return (
    <>
      <h1>Files</h1>
      <ul>
        {Object.entries(vids).map(([name, vid]) => (
          <li key={name}>
            {name} ({vid.width}x{vid.height}, {vid.chunks.length} frames)
          </li>
        ))}
      </ul>
      <input type="file" accept="video/*" onChange={onUpload} />
    </>
  );
};
