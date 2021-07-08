import React, { useState } from 'react';
import { Video } from './lib';
import Videos from './Videos';
import Segments from './Segments';

const debug = true;

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);

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
    })();
  }

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos }} />
      <Segments {...{ videos }} />
      <div className="" />
      <div className="" />
    </div>
  );
};
