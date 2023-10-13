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
    const resp = await fetch("/motocross.mp4");
    const blob = await resp.blob();
    const file = new File([blob], "motocross.mp4");
    setFiles([file]);
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
