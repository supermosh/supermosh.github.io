import React, { useState } from 'react';
import { Video, Segment } from './lib';
import Videos from './Videos';
import Segments from './Segments';

const debug = true;

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);

  if (debug && videos.length === 0) {
    (async () => {
      const resp = await fetch('/media/bg.webm');
      const blob = await resp.blob();
      const file = new File([blob], 'bg.webm', { lastModified: +new Date() });
      setVideos([
        {
          file,
          url: URL.createObjectURL(file),
          previewing: false,
        },
        {
          file,
          url: URL.createObjectURL(file),
          previewing: false,
        },
      ]);
      setSegments([
        { transform: 'copy', src: 'bg.webm', start: 0, end: 1 },
        { transform: 'glide', src: 'bg.webm', time: 1, length: 1 },
        { transform: 'movement', src: 'bg.webm', start: 1, end: 2 },
      ]);
    })();
  }

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos }} />
      <Segments {...{ videos, segments, setSegments }} />
      <div className="" />
      <div className="" />
    </div>
  );
};
