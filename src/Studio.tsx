import React, { useState } from 'react';
import { Segment } from './lib';
import Videos from './Videos';
import Segments from './Segments';
import { Output, Video } from './types';
import Render from './Render';
import Result from './Result';

const debug = true;

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [output, setOutput] = useState<Output>(null);

  if (debug && videos.length === 0) {
    (async () => {
      const resp = await fetch('/media/bg.webm');
      const blob = await resp.blob();
      const file0 = new File([blob], 'bg0.webm', { lastModified: +new Date() });
      const url0 = URL.createObjectURL(file0);
      const file1 = new File([blob], 'bg1.webm', { lastModified: +new Date() });
      const url1 = URL.createObjectURL(file1);
      setVideos([
        {
          file: file0,
          url: url0,
          previewing: false,
        },
        {
          file: file1,
          url: url1,
          previewing: false,
        },
      ]);
      setSegments([
        { transform: 'copy', src: url0, start: 0, end: 1 },
        { transform: 'glide', src: url0, time: 1, length: 1 },
      ]);
    })();
  }

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos }} />
      <Segments {...{ videos, segments, setSegments }} />
      <Render {...{ segments, setOutput }} />
      <Result {...{ output }} />
    </div>
  );
};
