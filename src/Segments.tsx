import React, { Dispatch, SetStateAction, useState } from 'react';
import { Video, Segment } from './lib';

const debug = true;

type EditedSegment = {
  src: string;
  transform: string;
  first: string;
  second: string;
  error: string;
}

const realToEdited = (real: Segment): EditedSegment => ({
  src: real.src,
  transform: real.transform,
  error: '',
  first: (real.transform === 'glide' ? real.time : real.start).toString(),
  second: (real.transform === 'glide' ? real.length : real.end).toString(),
});

const editedToReal = (editedSegment: EditedSegment): Segment => {
  if (!editedSegment.src) throw new Error('Missing video');
  if (!(editedSegment.transform === 'copy' || editedSegment.transform === 'glide' || editedSegment.transform === 'movement')) throw new Error('Effect should be one of "copy", "glide", "movement"');
  const first = parseFloat(editedSegment.first);
  if (Number.isNaN(first)) throw new Error('Third column is empty or not a number');
  if (first < 0) throw new Error('Third column should be greater or equal to 0');
  const second = parseFloat(editedSegment.second);
  if (Number.isNaN(second)) throw new Error('Fourth column is empty or not a number');
  if (editedSegment.transform === 'glide') {
    if (second <= 0) throw new Error('Third column should be greater than 0');
    return {
      src: editedSegment.src,
      transform: 'glide',
      time: first,
      length: second,
    };
  }
  if (first >= second) throw new Error('Third column should be less than fourth column');
  return {
    src: editedSegment.src,
    transform: editedSegment.transform,
    start: first,
    end: second,
  };
};

export default ({
  videos,
  segments,
  setSegments,
}: {
  videos: Video[],
  segments: Segment[],
  setSegments: Dispatch<SetStateAction<Segment[]>>
}) => {
  const [editedSegments, setEditedSegments] = useState<EditedSegment[]>([]);

  const updateSegments = () => {
    const newSegments = [];

    for (let i = 0; i < editedSegments.length; i++) {
      try {
        if (i === 0 && editedSegments[i].transform !== 'copy') throw new Error('First segment should have "copy" as its effect');
        const segment = editedToReal(editedSegments[i]);
        editedSegments[i].error = '';
        newSegments[i] = segment;
      } catch (e) {
        editedSegments[i].error = e.message;
      }
    }

    setEditedSegments([...editedSegments]);

    if (!(editedSegments.some((edited) => edited.error))) {
      setSegments(newSegments);
    }
  };

  const onEdit = (evt, i: number, key: 'src' | 'transform' | 'first' | 'second') => {
    const value = evt.target.value as string;
    editedSegments[i][key] = value;
    updateSegments();
  };

  const revert = () => {
    setEditedSegments(segments.map((real) => realToEdited(real)));
  };

  const add = () => setEditedSegments([
    ...editedSegments,
    {
      src: '',
      transform: '',
      first: '',
      second: '',
      error: 'Missing video',
    },
  ]);

  const moveUp = (i: number) => {
    editedSegments.splice(i - 1, 2, editedSegments[i], editedSegments[i - 1]);
    updateSegments();
  };

  const moveDown = (i: number) => {
    editedSegments.splice(i, 2, editedSegments[i + 1], editedSegments[i]);
    updateSegments();
  };

  const remove = (i: number) => {
    editedSegments.splice(i, 1);
    updateSegments();
  };

  if (debug && editedSegments.length === 0) {
    if (videos.length > 0) {
      requestAnimationFrame(() => {
        editedSegments.push({ src: videos[0].url, transform: 'copy', first: '0', second: '2', error: '' });
        editedSegments.push({ src: videos[0].url, transform: 'glide', first: '1', second: '2', error: '' });
        updateSegments();
      });
    }
  }

  return (
    <div className="Segments">
      {editedSegments.length === 0 ? (
        <p>No segments defined yet</p>
      ) : (
        editedSegments.map(({ src, transform, first, second, error }, i) => (
          <div className="row" key={`${i}-${src}`}>
            <select className="video" value={src} onInput={(evt) => onEdit(evt, i, 'src')}>
              <option value="">Video...</option>
              {videos.map((video) => (
                <option value={video.url} key={video.url}>{video.file.name}</option>
              ))}
            </select>
            <select className="transform" value={transform} onInput={(evt) => onEdit(evt, i, 'transform')}>
              <option value="">Effect...</option>
              <option value="copy">copy</option>
              <option value="glide">glide</option>
              <option value="movement">movement</option>
            </select>
            <input
              className="first"
              type="number"
              value={first}
              onInput={(evt) => onEdit(evt, i, 'first')}
            />
            <input
              className="second"
              type="number"
              value={second}
              onInput={(evt) => onEdit(evt, i, 'second')}
            />
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
              style={{ visibility: i < editedSegments.length - 1 ? 'visible' : 'hidden' }}
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
            <img
              src="/icons/warning.svg"
              alt=""
              title={error}
              style={{ visibility: error ? 'visible' : 'hidden' }}
            />
          </div>
        ))
      )}
      {videos.length === 0 ? (
        <p>Add videos to be able to define segments</p>
      ) : (
        <button
          className="u-normal-button"
          type="button"
          onClick={add}
        >
          Add a segment
        </button>
      )}
      {segments.length > 0 && editedSegments.some((edited) => edited.error) && (
        <button
          className="u-normal-button"
          type="button"
          onClick={revert}
        >
          Revert to last valid config
        </button>
      )}
    </div>
  );
};
