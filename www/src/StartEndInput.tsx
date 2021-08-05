import React, { useEffect, useRef, useState } from 'react';
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
  const loopTimeoutId = useRef<number>(0);

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

  const loop = () => {
    if (!loopVideo.current) return;
    if (end === start) {
      loopVideo.current.currentTime = start;
      loopVideo.current.pause();
      return;
    }
    loopVideo.current.currentTime = start;
    if (loopVideo.current.paused) loopVideo.current.play();
    loopTimeoutId.current = window.setTimeout(loop, (end - start) * 1000);
  };

  const cancel = () => {
    setEditing(false);
    setStart(segment.start);
    setEnd(segment.end);
  };

  const save = () => {
    setEditing(false);
    onChange(start, end);
  };

  useEffect(() => {
    if (!loopVideo.current) return;
    if (loopTimeoutId.current) clearTimeout(loopTimeoutId.current);
    loop();
  }, [start, end, editing]);

  return (
    <div className="StartEndInput">
      <button
        type="button"
        className="u-normal-button display-button"
        onClick={() => setEditing(true)}
      >
        {`${segment.start}s - ${segment.end}s`}
      </button>

      {editing && (
        <Modal onClose={() => setEditing(false)}>
          <div className="modal-content">
            <div className="videos">
              <div>
                <div>
                  <video src={segment.src} ref={startVideo} />
                </div>
                <div>
                  {`Start: ${start}s`}
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max={loopVideo.current?.duration}
                    step="0.1"
                    value={start}
                    onChange={(evt) => onStartChange(+evt.target.value)}
                  />
                </div>
              </div>
              <div>
                <video src={segment.src} ref={loopVideo} muted />
                <div>
                  {`Duration: ${(end - start).toFixed(1)}s`}
                </div>
              </div>
              <div>
                <video src={segment.src} ref={endVideo} />
                <div>
                  {`End: ${end}s`}
                </div>
                <div>
                  <input
                    type="range"
                    min="0"
                    max={loopVideo.current?.duration}
                    step="0.1"
                    value={end}
                    onChange={(evt) => onEndChange(+evt.target.value)}
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
