import React, { useState } from 'react';
import { Segment } from './lib';
import Videos from './Videos';
import Segments from './Segments';
import { Output, Video } from './types';
import Render from './Render';
import Result from './Result';

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [output, setOutput] = useState<Output>(null);

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos, segments, setSegments }} />
      <Segments {...{ videos, segments, setSegments }} />
      <Render {...{ segments, setOutput }} />
      <Result {...{ output }} />
    </div>
  );
};
