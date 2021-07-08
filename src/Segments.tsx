import React, { useState } from 'react';
import { Video, Segment } from './lib';

type EditedSegment = {
  src: string;
  transform: string;
  first: string;
  second: string;
  error: string;
}

const debug = true;

export default ({ videos }: {videos: Video[]}) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editedSegments, setEditedSegments] = useState<EditedSegment[]>([]);

  if (debug && editedSegments.length === 0) {
    setEditedSegments([
      { src: 'blob://123456789', transform: '', first: '10', second: '20', error: '' },
      { src: 'blob://789456123', transform: '', first: '10', second: '20', error: 'yooo' },
    ]);
  }

  return (
    <div className="Segments">
      {editedSegments.length === 0 ? (
        <p>No segments defined yet</p>
      ) : (
        editedSegments.map(({ src, transform, first, second, error }, i) => (
          <div className="row" key={`${i}-${src}`}>
            <select className="video">
              <option value="">Video...</option>
              {videos.map((video) => (
                <option value={video.url} key={video.url}>{video.file.name}</option>
              ))}
            </select>
            <select className="transform" value={transform}>
              <option value="">Effect...</option>
              <option value="copy">copy</option>
              <option value="glide">glide</option>
              <option value="movement">movement</option>
            </select>
            <input className="first" type="number" value={first} />
            <input className="second" type="number" value={second} />
            <button className="u-icon-button" type="button"><img src="/icons/up.svg" alt="" /></button>
            <button className="u-icon-button" type="button"><img src="/icons/down.svg" alt="" /></button>
            <button className="u-icon-button" type="button"><img src="/icons/delete.svg" alt="" /></button>
            <img src="/icons/warning.svg" alt="" title={error} style={{ visibility: error ? 'visible' : 'hidden' }} />
          </div>
        ))
      )}
      <button
        className="u-normal-button"
        type="button"
        onClick={() => setEditedSegments([...editedSegments, { src: '', transform: '', first: '', second: '', error: '' }])}
      >
        add a segment
      </button>
    </div>
  );
};
