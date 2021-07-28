import React, { useEffect, useRef, useState } from 'react';
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
  const timeVideo = useRef<HTMLVideoElement>(null);
  const loopVideo = useRef<HTMLVideoElement>(null);
  const loopTimeoutId = useRef<number>(0);

  const onTimeChange = (newTime: number) => {
    setTime(newTime);
    timeVideo.current.currentTime = newTime;
    if (newTime + length > loopVideo.current.duration) {
      setLength(loopVideo.current.duration - newTime);
    }
  };

  const onLengthChange = (newLength: number) => {
    setLength(newLength);
    if (time + newLength > loopVideo.current.duration) {
      setTime(loopVideo.current.duration - newLength);
    }
  };

  const loop = () => {
    if (!loopVideo.current) return;
    if (time === loopVideo.current.duration || length === 0) {
      loopVideo.current.currentTime = time;
      loopVideo.current.pause();
      return;
    }
    loopVideo.current.currentTime = time;
    if (loopVideo.current.paused) loopVideo.current.play();
    loopTimeoutId.current = setTimeout(loop, length * 1000);
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

  useEffect(() => {
    if (!loopVideo.current) return;
    if (loopTimeoutId.current) clearTimeout(loopTimeoutId.current);
    loop();
  }, [time, length, editing]);

  return (
    <div className="RangeInput">
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
            <div className="videos">
              <div>
                <div>
                  <video src={segment.src} ref={timeVideo} />
                </div>
                <div>
                  {`Time: ${time}s`}
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max={loopVideo.current?.duration}
                    step="0.1"
                    value={time}
                    onChange={(evt) => onTimeChange(+evt.target.value)}
                  />
                </div>
              </div>
              <div>
                <video src={segment.src} ref={loopVideo} muted />
                <div>
                  {`Length: ${length.toFixed(1)}s`}
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max={loopVideo.current ? (loopVideo.current.duration - time) : Infinity}
                    step="0.1"
                    value={length}
                    onChange={(evt) => onLengthChange(+evt.target.value)}
                  />
                </div>
              </div>
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
