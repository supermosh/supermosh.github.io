import { useRef } from "react";

import type { CopySegment, DriftSegment, InputProps, Vid } from "./types";

export const StartEndEditor = ({
  vid,
  value,
  onChange,
}: { vid: Vid } & InputProps<CopySegment | DriftSegment>) => {
  const video = useRef<HTMLVideoElement | null>(null);
  const timout = useRef(0);

  const play = () => {
    if (!video.current) return;
    video.current.currentTime = value.start;
    video.current.play();
    clearInterval(timout.current);
    timout.current = window.setTimeout(play, (value.end - value.start) * 1000);
  };

  const pause = () => {
    if (!video.current) return;
    video.current.pause();
    clearInterval(timout.current);
  };

  if (video.current) {
    if (video.current.paused) {
      if (value.start !== value.end) play();
    } else {
      if (value.start === value.end) pause();
    }
  }

  return (
    <div>
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
              const end = Math.max(value.end, start);
              onChange({ ...value, start, end });
              play();
            }}
          />
        </div>
        <div>
          end
          <input
            type="range"
            min={0}
            max={video.current?.duration}
            step={1 / 29.97}
            value={value.end}
            onChange={(evt) => {
              const end = +evt.target.value;
              const start = Math.min(value.start, end);
              onChange({ ...value, start, end });
              play();
            }}
          />
        </div>
      </div>
      <video ref={video} src={vid.src} muted playsInline />
    </div>
  );
};
