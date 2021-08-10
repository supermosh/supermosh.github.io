import React, { Dispatch, SetStateAction } from 'react';
import { CopySegment, GlideSegment, MovementSegment, Segment } from 'supermosh';
import StartEndInput from './StartEndInput';
import { Video } from './types';
import TimeLengthInput from './TimeLengthInput';

export default ({
  videos,
  segments,
  setSegments,
}: {
  videos: Video[];
  segments: Segment[];
  setSegments: Dispatch<SetStateAction<Segment[]>>;
}) => {
  const moveUp = (i: number) => {
    segments.splice(i - 1, 2, segments[i], segments[i - 1]);
    setSegments([...segments]);
  };

  const moveDown = (i: number) => {
    segments.splice(i, 2, segments[i + 1], segments[i]);
    setSegments([...segments]);
  };

  const remove = (i: number) => {
    segments.splice(i, 1);
    setSegments([...segments]);
  };

  const add = () => {
    setSegments([
      ...segments,
      {
        transform: 'copy',
        src: videos[0].src,
        start: 0,
        end: 0,
      },
    ]);
  };

  const setTransform = (i: number, transform: Segment['transform']) => {
    switch (transform) {
      case 'copy':
        segments[i] = {
          transform: 'copy',
          src: segments[i].src,
          start: 0,
          end: 0,
        };
        break;
      case 'glide':
        segments[i] = {
          transform: 'glide',
          src: segments[i].src,
          time: 0,
          length: 0,
        };
        break;
      case 'movement':
        segments[i] = {
          transform: 'movement',
          src: segments[i].src,
          start: 0,
          end: 0,
        };
        break;
    }
    setSegments([...segments]);
  };

  const setSrc = (i: number, src: string) => {
    segments[i].src = src;
    setSegments([...segments]);
  };

  const onStartEndChange = (i: number, start: number, end: number) => {
    (segments[i] as CopySegment | MovementSegment).start = start;
    (segments[i] as CopySegment | MovementSegment).end = end;
    setSegments([...segments]);
  };

  const onTimeLengthChange = (i: number, time: number, length: number) => {
    (segments[i] as GlideSegment).time = time;
    (segments[i] as GlideSegment).length = length;
    setSegments([...segments]);
  };

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
              <div className="row" key={i}>
                <button
                  className="u-icon-button"
                  type="button"
                  style={{ visibility: i > 0 ? 'visible' : 'hidden' }}
                  onClick={() => moveUp(i)}
                >
                  <img src="/icons/up.svg" alt="" />
                </button>
                <button
                  className="u-icon-button"
                  type="button"
                  style={{ visibility: i < segments.length - 1 ? 'visible' : 'hidden' }}
                  onClick={() => moveDown(i)}
                >
                  <img src="/icons/down.svg" alt="" />
                </button>
                <button
                  className="u-icon-button"
                  type="button"
                  onClick={() => remove(i)}
                >
                  <img src="/icons/delete.svg" alt="" />
                </button>
                <select
                  className="transform"
                  value={segment.transform}
                  onInput={(evt) => setTransform(i, (evt.target as HTMLSelectElement).value as Segment['transform'])}
                >
                  <option value="copy">copy</option>
                  <option value="glide">glide</option>
                  <option value="movement">movement</option>
                </select>
                {(segment.transform === 'copy' || segment.transform === 'movement') && (
                  <StartEndInput
                    segment={segment}
                    onChange={(start, end) => onStartEndChange(i, start, end)}
                  />
                )}
                {segment.transform === 'glide' && (
                  <TimeLengthInput
                    segment={segment}
                    onChange={(time, length) => onTimeLengthChange(i, time, length)}
                  />
                )}
                <select
                  className="src"
                  value={segment.src}
                  onInput={(evt) => setSrc(i, (evt.target as HTMLSelectElement).value)}
                >
                  {videos.map((video) => (
                    <option key={video.key} value={video.src}>{video.file.name}</option>
                  ))}
                </select>
              </div>
            ))
          )}
          <div>
            <button
              type="button"
              className="u-normal-button"
              onClick={add}
            >
              Add a segment
            </button>
          </div>
        </>
      )}
    </div>
  );
};
