import React, { useState } from 'react';
import { Video, Segment } from './lib';

type EditedSegment = {
  src: string;
  transform: string;
  first: string;
  second: string;
  error: string;
}

const debug = false;

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

export default ({ videos }: {videos: Video[]}) => {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [editedSegments, setEditedSegments] = useState<EditedSegment[]>([]);

  if (debug && editedSegments.length === 0) {
    setEditedSegments([
      { src: 'blob://123456789', transform: '', first: '10', second: '20', error: '' },
      { src: 'blob://789456123', transform: '', first: '10', second: '20', error: 'yooo' },
    ]);
  }

  const onEdit = (evt, i: number, key: 'src' | 'transform' | 'first' | 'second') => {
    const value = evt.target.value as string;
    editedSegments[i][key] = value;
    try {
      const segment = editedToReal(editedSegments[i]);
      editedSegments[i].error = '';
      segments.splice(i, 1, segment);
      setSegments([...segments]);
    } catch (e) {
      editedSegments[i].error = e.message;
    }
    setEditedSegments([...editedSegments]);
  };

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
            <input className="first" type="number" value={first} onInput={(evt) => onEdit(evt, i, 'first')} />
            <input className="second" type="number" value={second} onInput={(evt) => onEdit(evt, i, 'second')} />
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
