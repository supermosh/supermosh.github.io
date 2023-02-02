import React, { useState } from 'react';
import { config } from 'supermosh';

export default () => {
  const [fps, setFps] = useState<string>(config.fps.toString());
  const [size, setSize] = useState<string>(config.size.toString());
  const [xyShifts, setXyShifts] = useState<string>(config.xyShifts.toString());
  const [error, setError] = useState<string>('');

  return (
    <div className="RenderOptions">
      <div>
        <span>Frames per second</span>
        <input
          type="number"
          value={fps}
          onChange={(evt) => {
            setFps(evt.target.value);
            config.fps = +evt.target.value;
          }}
        />
      </div>
      <div>
        <span>Block size</span>
        <input
          type="number"
          value={size}
          onChange={(evt) => {
            setSize(evt.target.value);
            config.size = +evt.target.value;
          }}
        />
      </div>
      <div>
        <span>Block shifts</span>
        <input
          value={xyShifts}
          onChange={(evt) => {
            setXyShifts(evt.target.value);
            const newXyShifts = evt.target.value.split(',').map((value) => +value);
            if (newXyShifts.some((value) => Number.isNaN(value))) {
              setError('Shifts should be a comma-separated list of numbers, like "0,1,-1,2,-2"');
            } else {
              setError('');
              config.xyShifts = newXyShifts;
            }
          }}
        />
      </div>
      {error && <div>{error}</div>}
    </div>
  );
};
