import { useState } from "react";

const codec = "vp8";
const width = 640;
const height = 360;

const encode = (file: File) => {
  const chunks: EncodedVideoChunk[] = [];
  const encoder = new VideoEncoder({
    error: console.error,
    output: (chunk) => {
      chunks.push(chunk);
    },
  });
  encoder.configure({ codec, width, height });
};

type Media = {
  name: string;
  video: HTMLVideoElement;
  file: File;
};

export const Studio = () => {
  const [medias, setMedias] = useState<Media[]>([]);

  return (
    <>
      <h1>Files</h1>
      <ul>
        {medias.map((media) => (
          <li key={media.name}>
            {`${media.name} (${media.video.videoWidth}x${media.video.videoHeight}, ${media.video.duration}s)`}
          </li>
        ))}
        <li>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={async (evt) => {
              for (const file of evt.target.files ?? []) {
                const video = document.createElement("video");
                video.src = URL.createObjectURL(file);
                await new Promise((r) =>
                  video.addEventListener("canplaythrough", r)
                );
                let newName = file.name;
                let i = 2;
                while (medias.map((media) => media.name).includes(newName)) {
                  newName = `${file.name} (${i})`;
                  i++;
                }
                setMedias([...medias, { name: newName, file, video }]);
              }
              evt.target.value = "";
            }}
          />
        </li>
      </ul>
    </>
  );
};
