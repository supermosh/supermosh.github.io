import { useRef } from "react";

import { Vid } from "./types";

export const RangePreview = ({ vid, i }: { vid: Vid; i: number }) => {
  const ref = useRef(null as null | HTMLVideoElement);
  if (ref.current) {
    ref.current.currentTime = (i * ref.current.duration) / vid.chunks.length;
  }
  return <video className="RangePreview" src={vid.src} ref={ref} />;
};
