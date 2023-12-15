import styled from "@emotion/styled";
import type { ChangeEventHandler, Dispatch, SetStateAction } from "react";
import { useRef, useState } from "react";

import { IconButton } from "../components/IconButton";
import { ProgressBar } from "../components/ProgressBar";
import { x } from "../shorts";
import { encode } from "./core";
import type { Vid } from "./types";

const Hor = styled.div`
  display: flex;
  gap: 8px;
`;

const Vert = styled.div`
  display: flex;
  gap: 8px;
  flex-direction: column;
`;

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
  display: flex;
  align-items: center;
  justify-content: center;
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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const onUpload: ChangeEventHandler<HTMLInputElement> = async (evt) => {
    setUploading(true);
    setError("");
    try {
      const file = x(evt.target.files)[0];
      evt.target.value = "";
      const src = URL.createObjectURL(file);
      const { width, height, chunks } = await encode(file, setProgress);
      let name = file.name;
      while (name in vids) name += ".";
      setVids({ ...vids, [name]: { src, chunks, width, height } });
    } catch (e) {
      setError(`${e}`);
      console.error(e);
    }
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
      <Vert>
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
        <Hor>
          <FileInputContainer disabled={uploading}>
            {uploading ? "Uploading..." : "Add video"}
            <input
              type="file"
              accept="video/*"
              onChange={onUpload}
              disabled={uploading}
            />
          </FileInputContainer>
          {uploading && <ProgressBar progress={progress} />}
        </Hor>
        {error && (
          <Vert>
            <div>An error occurred while trying to encode this video:</div>
            <div>{error}</div>
            <div>
              You might fix this by uploading your video in another codec, or
              uploading a smaller file. If the issue persists, please let me
              know about it in a{" "}
              <a
                href="https://github.com/supermosh/supermosh.github.io/issues/"
                target="_blank"
              >
                bug issue
              </a>{" "}
              and I'll investigate. Thanks!
            </div>
          </Vert>
        )}
      </Vert>
    </>
  );
};
