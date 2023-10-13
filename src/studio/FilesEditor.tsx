import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";
import { useRef } from "react";

import { x } from "../shorts";

export const FilesEditor = ({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}) => {
  const onUpload: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const file = x(evt.target.files)[0];
    evt.target.value = "";
    setFiles([...files, file]);
  };

  // debug
  const fetched = useRef(false);
  (async () => {
    if (fetched.current || files.length > 0) return;
    const [bike, motocross] = await Promise.all(
      ["bike.mp4", "motocross.mp4"].map(async (name) => {
        const resp = await fetch(`/${name}`);
        const blob = await resp.blob();
        const file = new File([blob], name);
        return file;
      })
    );
    setFiles([bike, motocross]);
  })();

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
    </>
  );
};
