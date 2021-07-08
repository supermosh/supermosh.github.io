import React, { useState } from 'react';
import { Video } from './lib';
import Videos from './Videos';

const debug = true;

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);

  if (debug && videos.length === 0) {
    (async () => {
      const resp = await fetch('/media/bg.webm');
      const blob = await resp.blob();
      const file = new File([blob], 'bg.webm', { lastModified: +new Date() });
      const url = URL.createObjectURL(file);
      setVideos([{ file, url, previewing: false }]);
    })();
  }

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos }} />
      <div className="" />
      <div className="" />
      <div className="" />
    </div>
  );
};
