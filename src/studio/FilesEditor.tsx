import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";

import { x } from "../shorts";
import { encode } from "./core";
import type { Vid } from "./types";
import styled from "@emotion/styled";
import { IconButton } from "../components/IconButton";

const VidLines = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const VidLine = styled.div`
  display: flex;
  height: 46px;
  align-items: center;
  gap: 8px;
  video {
    height: 100%;
  }
`;

const FileInputContainer = styled.label<{ disabled: boolean }>`
  font: inherit;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  border: 1px solid white;
  background-color: transparent;
  padding: 0.5em 1em;
  display: inline-block;
  margin: 0.5em 0;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  :hover,
  :focus {
    background-color: rgba(255, 255, 255, 0.1);
  }
  input {
    display: none;
  }
`;

export const FilesEditor = ({
  vids,
  setVids,
}: {
  vids: Record<string, Vid>;
  setVids: Dispatch<SetStateAction<Record<string, Vid>>>;
}) => {
  const [uploading, setUploading] = useState(false);

  const onUpload: ChangeEventHandler<HTMLInputElement> = async (evt) => {
    setUploading(true);
    const file = x(evt.target.files)[0];
    evt.target.value = "";
    const src = URL.createObjectURL(file);
    const { width, height, chunks } = await encode(file);
    let name = file.name;
    while (name in vids) name += ".";
    setVids({ ...vids, [name]: { src, chunks, width, height } });
    setUploading(false);
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
    fetched.current = true;
  })();

  return (
    <>
      <h1>Files</h1>
      {Object.keys(vids).length ? (
        <VidLines>
          {Object.entries(vids)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, vid]) => (
              <VidLine key={name}>
                <IconButton
                  name="delete"
                  onClick={() => {
                    delete vids[name];
                    setVids({ ...vids });
                  }}
                />
                <video src={vid.src} muted loop autoPlay />
                <div>
                  {`${name} (${vid.width}x${vid.height}px, ${vid.chunks.length} frames)`}
                </div>
              </VidLine>
            ))}
        </VidLines>
      ) : (
        <p>No video uploaded yet</p>
      )}
      <FileInputContainer disabled={uploading}>
        {uploading ? "Uploading..." : "Add video"}
        <input
          type="file"
          accept="video/*"
          onChange={onUpload}
          disabled={uploading}
        />
      </FileInputContainer>
    </>
  );
};
