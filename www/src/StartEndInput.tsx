import React, { useRef, useState } from 'react';
import { CopySegment, MovementSegment } from 'supermosh';
import Modal from './Modal';

export default ({
  segment,
  onChange,
}: {
  segment: CopySegment | MovementSegment
  onChange: (newStart: number, newEnd: number) => void
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [start, setStart] = useState<number>(segment.start);
  const [end, setEnd] = useState<number>(segment.end);
  const startVideo = useRef<HTMLVideoElement>(null);
  const loopVideo = useRef<HTMLVideoElement>(null);
  const endVideo = useRef<HTMLVideoElement>(null);

  const onStartChange = (newStart: number) => {
    setStart(newStart);
    startVideo.current.currentTime = newStart;
    if (newStart > end) {
      setEnd(newStart);
      endVideo.current.currentTime = newStart;
    }
  };

  const onEndChange = (newEnd: number) => {
    setEnd(newEnd);
    endVideo.current.currentTime = newEnd;
    if (newEnd < start) {
      setStart(newEnd);
      startVideo.current.currentTime = newEnd;
    }
  };

  return (
    <div className="StartEndInput">
      <button
        type="button"
        className="u-normal-button"
        onClick={() => setEditing(true)}
      >
        {`${segment.start}s-${segment.end}s`}
      </button>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <div className="modal-content">
            <div className="videos">
              <video src={segment.src} ref={startVideo} />
              <video src={segment.src} ref={loopVideo} />
              <video src={segment.src} ref={endVideo} />
            </div>
            <div className="row">
              <input
                type="range"
                min="0"
                max={loopVideo.current?.duration}
                step="0.1"
                value={start}
                onChange={(evt) => onStartChange(+evt.target.value)}
              />
              {`Start: ${start}s`}
            </div>
            <div className="row">
              <input
                type="range"
                min="0"
                max={loopVideo.current?.duration}
                step="0.1"
                value={end}
                onChange={(evt) => onEndChange(+evt.target.value)}
              />
              {`End: ${end}s`}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
