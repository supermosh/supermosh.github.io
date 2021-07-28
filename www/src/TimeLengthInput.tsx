import React, { useRef, useState } from 'react';
import { GlideSegment } from 'supermosh';
import Modal from './Modal';

export default ({
  segment,
  onChange,
}: {
  segment: GlideSegment;
  onChange: (newTime: number, newLength: number) => void;
}) => {
  const [editing, setEditing] = useState<boolean>(false);
  const [time, setTime] = useState<number>(segment.time);
  const [length, setLength] = useState<number>(segment.length);
  const video = useRef<HTMLVideoElement>(null);

  const onTimeChange = (newTime: number) => {
    setTime(newTime);
    video.current.currentTime = newTime;
  };

  const onLengthChange = (newLength: number) => {
    setLength(newLength);
  };

  const cancel = () => {
    setEditing(false);
    setTime(segment.time);
    setLength(segment.length);
  };

  const save = () => {
    setEditing(false);
    onChange(time, length);
  };

  return (
    <div className="TimeLengthInput">
      <button
        type="button"
        className="u-normal-button display-button"
        onClick={() => setEditing(true)}
      >
        {`${segment.time}s, ${segment.length}s`}
      </button>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <div className="modal-content">
            <video src={segment.src} ref={video} />
            <div>
              {`Time: ${time}s`}
            </div>
            <div>
              <input
                type="range"
                min="0"
                max={video.current?.duration}
                step="0.1"
                value={time}
                onChange={(evt) => onTimeChange(+evt.target.value)}
              />
            </div>
            <div>
              {`Length: ${length.toFixed(1)}s`}
            </div>
            <div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={length}
                onChange={(evt) => onLengthChange(+evt.target.value)}
              />
            </div>
            <div className="buttons">
              <button
                type="button"
                className="u-normal-button cancel"
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                type="button"
                className="u-normal-button save"
                onClick={save}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
