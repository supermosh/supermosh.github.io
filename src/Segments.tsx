import React, { useState } from 'react';
import { Video, Segment } from './lib';

type EditedSegment = {
  src: string;
  transform: string;
  first: string;
  second: string;
}

export default ({ videos }: {videos: Video[]}) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editedSegments, setEditedSegments] = useState<any[]>([
    {
      src: '/hello',
      transform: 'transforme',
      first: '0',
      second: '10',
    },
  ]);

  return (
    <div className="Segments">
      {editedSegments.map((editedSegment, i) => (
        <div className="row" key={i}>
          <select>
            <option value="">Chose a video</option>
            {videos.map((video) => (
              <option value={video.url}>{video.file.name}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};
