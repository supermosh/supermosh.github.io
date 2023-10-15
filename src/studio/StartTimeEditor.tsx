import { useRef } from "react";

import type { GlideSegment, InputProps, Vid } from "./types";

export const StartTimeEditor = ({
  vid,
  value,
  onChange,
}: { vid: Vid } & InputProps<GlideSegment>) => {
  const video = useRef<HTMLVideoElement | null>(null);

  if (video.current) video.current.currentTime = value.start;

  return (
    <div>
      <div>
        start
        <input
          type="range"
          min={0}
          max={video.current?.duration}
          step={1 / 29.97}
          value={value.start}
          onChange={(evt) => {
            const start = +evt.target.value;
            onChange({ ...value, start });
          }}
        />
      </div>
      <div>
        time
        <input
          type="range"
          min={0}
          max={10}
          value={value.time}
          onChange={(evt) => {
            const time = +evt.target.value;
            onChange({ ...value, time });
          }}
        />
      </div>
      <video ref={video} src={vid.src} muted playsInline />
    </div>
  );
};
