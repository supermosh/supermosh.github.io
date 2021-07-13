import React, { useEffect, useState } from 'react';
import { Segment } from './lib';
import Videos from './Videos';
import Segments from './Segments';
import { Output, Video } from './types';
import Render from './Render';
import Result from './Result';
import { stores } from './db';
import savedFileToVideo from './savedFileToVideo';

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [output, setOutput] = useState<Output>(null);

  useEffect(() => {
    (async () => {
      const savedFiles = await stores.files.getAll();
      if (savedFiles.length && window.confirm('Restore previously uploaded videos?')) {
        const savedVideos = await Promise.all(savedFiles.map(savedFileToVideo));
        setVideos(savedVideos);
      } else {
        stores.files.clear();
      }
    })();
  }, []);

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos, segments, setSegments }} />
      <Segments {...{ videos, segments, setSegments }} />
      <Render {...{ segments, setOutput }} />
      <Result {...{ output }} />
    </div>
  );
};
