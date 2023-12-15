import styled from "@emotion/styled";
import { useRef } from "react";

import { RangeInput } from "../components/RangeInput";
import type { CopySegment, DriftSegment, InputProps, Vid } from "./types";

const Cont = styled.div`
  position: relative;
  &:not(:hover) {
    video {
      display: none;
    }
  }
`;

const Video = styled.video`
  position: absolute;
`;

export const StartEndEditor = ({
  vid,
  value,
  onChange,
}: { vid: Vid } & InputProps<CopySegment | DriftSegment>) => {
  const video = useRef<HTMLVideoElement | null>(null);
  const timeout = useRef(0);

  const play = () => {
    if (!video.current) return;
    video.current.currentTime = value.start;
    video.current.play();
    clearInterval(timeout.current);
    timeout.current = window.setTimeout(play, (value.end - value.start) * 1000);
  };

  const pause = () => {
    if (!video.current) return;
    video.current.pause();
    clearInterval(timeout.current);
  };

  if (video.current) {
    if (video.current.paused) {
      if (value.start !== value.end) play();
    } else {
      if (value.start === value.end) pause();
    }
  }

  return (
    <Cont>
      <RangeInput
        label="start"
        min={0}
        max={video.current?.duration ?? Infinity}
        step={1 / 29.97}
        value={value.start}
        onChange={(start) => {
          const end = Math.max(value.end, start);
          onChange({ ...value, start, end });
          play();
        }}
      />
      <RangeInput
        label="end"
        min={0}
        max={video.current?.duration ?? Infinity}
        step={1 / 29.97}
        value={value.end}
        onChange={(end) => {
          const start = Math.min(value.start, end);
          onChange({ ...value, start, end });
          play();
        }}
      />
      <Video ref={video} src={vid.src} muted playsInline />
    </Cont>
  );
};
