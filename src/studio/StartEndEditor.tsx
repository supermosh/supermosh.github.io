import styled from "@emotion/styled";
import { useRef } from "react";

import { RangeInput } from "../components/RangeInput";
import type { CopySegment, DriftSegment, InputProps, Vid } from "./types";
import { useFrame } from "./useFrame";

const Cont = styled.div`
  position: relative;
  height: 46px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  &:not(:hover) {
    video {
      display: none;
    }
  }
`;

const Video = styled.video`
  position: absolute;
  z-index: 100;
  bottom: calc(100% + 8px);
`;

export const StartEndEditor = ({
  vid,
  value,
  onChange,
}: { vid: Vid } & InputProps<CopySegment | DriftSegment>) => {
  const video = useRef<HTMLVideoElement | null>(null);
  const startRef = useRef(value.start);
  const endRef = useRef(value.end);

  useFrame(() => {
    if (!video.current) return;

    const startTime =
      (startRef.current * video.current.duration) / vid.chunks.length;
    const endTime =
      (endRef.current * video.current.duration) / vid.chunks.length;
    if (
      video.current.currentTime < startTime ||
      video.current.currentTime > endTime
    )
      video.current.currentTime = startTime;

    if (startRef.current === endRef.current) {
      if (video.current.played) video.current.pause();
    } else {
      if (video.current.paused) video.current.play();
    }
  });

  return (
    <Cont>
      <RangeInput
        label="start frame"
        min={0}
        max={vid.chunks.length - 1}
        step={1}
        value={value.start}
        onChange={(start) => {
          const end = Math.max(value.end, start);
          onChange({ ...value, start, end });
          startRef.current = start;
          endRef.current = end;
        }}
      />
      <RangeInput
        label="end frame"
        min={0}
        max={vid.chunks.length - 1}
        step={1}
        value={value.end}
        onChange={(end) => {
          const start = Math.min(value.start, end);
          onChange({ ...value, start, end });
          startRef.current = start;
          endRef.current = end;
        }}
      />
      <Video ref={video} src={vid.src} muted playsInline />
    </Cont>
  );
};
