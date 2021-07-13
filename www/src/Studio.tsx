import React, { useEffect, useRef, useState } from 'react';
import { Segment } from 'supermosh';
import Videos from './Videos';
import Segments from './Segments';
import { Output, SavedSegment, Video } from './types';
import Render from './Render';
import Result from './Result';
import { filesStore, segmentsStore } from './db';
import savedFileToVideo from './savedFileToVideo';

export default () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [output, setOutput] = useState<Output>(null);
  const first = useRef<boolean>(true);

  useEffect(() => {
    (async () => {
      const savedFiles = await filesStore.getAll();
      if (savedFiles.length && window.confirm('Restore previous work?')) {
        const savedVideos = await Promise.all(savedFiles.map(savedFileToVideo));
        setVideos(savedVideos);
        const savedSegments = await segmentsStore.getAll();
        for (const segment of savedSegments) {
          segment.src = savedVideos.find((video) => video.key === segment.savedFileKey).src;
          delete segment.savedFileKey;
        }
        setSegments(savedSegments);
      } else {
        filesStore.clear();
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const savedSegments: SavedSegment[] = segments.map((segment) => ({
        ...segment,
        savedFileKey: videos.find((video) => video.src === segment.src).key,
      }));
      await segmentsStore.save(savedSegments);
    })();
  }, [segments]);

  return (
    <div className="Studio">
      <Videos {...{ videos, setVideos, segments, setSegments }} />
      <Segments {...{ videos, segments, setSegments }} />
      <Render {...{ segments, setOutput }} />
      <Result {...{ output }} />
    </div>
  );
};
