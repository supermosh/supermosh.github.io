import React, { useState } from 'react';
import { Video } from './lib';
import Videos from './Videos';

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos }} />
      <div className="" />
      <div className="" />
      <div className="" />
    </div>
  );
};
