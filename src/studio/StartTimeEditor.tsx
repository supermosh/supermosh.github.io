import styled from "@emotion/styled";
import { useRef } from "react";

import { NumberInput } from "../components/NumberInput";
import { RangeInput } from "../components/RangeInput";
import type { GlideSegment, InputProps, Vid } from "./types";

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
  z-index: 100;
  transform: translateY(8px);
`;

const Hor = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

export const StartTimeEditor = ({
  vid,
  value,
  onChange,
}: { vid: Vid } & InputProps<GlideSegment>) => {
  const video = useRef<HTMLVideoElement | null>(null);

  if (video.current) {
    const timeStart =
      (value.start * video.current.duration) / vid.chunks.length;
    video.current.currentTime = timeStart;
  }

  return (
    <Cont>
      <RangeInput
        label="start frame"
        value={value.start}
        onChange={(start) => onChange({ ...value, start })}
        min={0}
        max={vid.chunks.length - 1}
        step={1}
      />
      <Hor>
        <NumberInput
          value={value.time}
          onChange={(time) => onChange({ ...value, time })}
          min={0}
          step={1}
        />
        nb frames
      </Hor>
      <Video ref={video} src={vid.src} autoPlay muted playsInline />
    </Cont>
  );
};
