import React, { Dispatch, SetStateAction } from 'react';
import { Video, Segment } from './lib';

export default ({
  videos,
  segments,
  setSegments,
}: {
  videos: Video[],
  segments: Segment[],
  setSegments: Dispatch<SetStateAction<Segment[]>>
}) => {
  console.log({ videos, segments, setSegments });
  return (
    <div className="Segments">
      {videos.length === 0 ? (
        <p>Add videos to be able to define segments</p>
      ) : (
        <>
          {segments.length === 0 ? (
            <p>No segments defined</p>
          ) : (
            segments.map((segment, i) => (
              <div className="row">
                <button
                  className="u-icon-button"
                  type="button"
                  style={{ visibility: i > 0 ? 'visible' : 'hidden' }}
                >
                  <img src="/icons/up.svg" alt="" />
                </button>
                <button
                  className="u-icon-button"
                  type="button"
                  style={{ visibility: i < segments.length - 1 ? 'visible' : 'hidden' }}
                >
                  <img src="/icons/down.svg" alt="" />
                </button>
                <button
                  className="u-icon-button"
                  type="button"
                >
                  <img src="/icons/delete.svg" alt="" />
                </button>
                <select className="transform" value={segment.transform}>
                  <option value="copy">copy</option>
                  <option value="glide">glide</option>
                  <option value="movement">movement</option>
                </select>
                <select className="src" value={segment.src}>
                  {videos.map((video) => (
                    <option key={video.url} value={video.url}>{video.file.name}</option>
                  ))}
                </select>
                {segment.transform === 'copy' && (
                  <>
                    <input type="number" placeholder="start" value={segment.start.toString()} />
                    <input type="number" placeholder="end" value={segment.end.toString()} />
                  </>
                )}
                {segment.transform === 'glide' && (
                  <>
                    <input type="number" placeholder="time" value={segment.time.toString()} />
                    <input type="number" placeholder="length" value={segment.length.toString()} />
                  </>
                )}
                {segment.transform === 'movement' && (
                  <>
                    <input type="number" placeholder="start" value={segment.start.toString()} />
                    <input type="number" placeholder="end" value={segment.end.toString()} />
                  </>
                )}
              </div>
            ))
          )}
          <div>
            <button type="button" className="u-normal-button">Add a segment</button>
          </div>
        </>
      )}
    </div>
  );
};
