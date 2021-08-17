import React, { Dispatch, SetStateAction, useRef, useState } from 'react';
import {
  getDimensions,
  PreparedSegment,
  prepareGlideSegment,
  prepareMovementSegment,
  runCopySegment,
  runGlideSegment,
  runMovementSegment,
  Segment,
} from 'supermosh';
import track from './track';
import { Output } from './types';
import RenderOptions from './RenderOptions';

export default ({
  segments,
  setOutput,
}: {
  segments: Segment[],
  setOutput: Dispatch<SetStateAction<Output>>
}) => {
  const renderRootRef = useRef(null);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [prepProg, setPrepProg] = useState<number[]>([]);
  const [runProg, setRunProg] = useState<number[]>([]);

  const render = async () => {
    try {
      prepProg.splice(0, prepProg.length, ...segments.map(() => 0));
      setPrepProg([...prepProg]);
      runProg.splice(0, prepProg.length, ...segments.map(() => 0));
      setRunProg([...runProg]);
      setRendering(true);
      setError(null);
      track('begin render', { segments });
      const beginRenderTime = performance.now();

      const { width, height } = await getDimensions(segments);

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (
          (segment.transform === 'copy' || segment.transform === 'movement') && (segment.end - segment.start) === 0
          || (segment.transform === 'glide') && (segment.time === 0)
        ) {
          throw new Error('Segment has a duration of 0s');
        }
      }

      const preparedSegments: PreparedSegment[] = [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        switch (segment.transform) {
          case 'copy':
            prepProg[i] = 0.5;
            setPrepProg([...prepProg]);
            preparedSegments.push(segment);
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
            break;
          case 'glide':
            prepProg[i] = 0.5;
            setPrepProg([...prepProg]);
            preparedSegments.push(await prepareGlideSegment(segment, renderRootRef.current));
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
            break;
          case 'movement':
            prepProg[i] = 0;
            setPrepProg([...prepProg]);
            preparedSegments.push(await prepareMovementSegment(segment, renderRootRef.current, (prog) => {
              prepProg[i] = prog;
              setPrepProg([...prepProg]);
            }));
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
            break;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      renderRootRef.current.append(canvas);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, width, height);

      // @ts-ignore
      const stream = canvas.captureStream();
      const recorder = new MediaRecorder(stream);
      recorder.start();

      for (let i = 0; i < preparedSegments.length; i++) {
        const segment = preparedSegments[i];
        switch (segment.transform) {
          case 'copy':
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runCopySegment(segment, ctx, renderRootRef.current, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
            break;
          case 'glide':
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runGlideSegment(segment, ctx, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
            break;
          case 'movement':
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runMovementSegment(segment, ctx, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
            break;
        }
      }

      recorder.addEventListener('dataavailable', async (evt) => {
        const videoUrl = URL.createObjectURL(evt.data);
        const imageUrl = canvas.toDataURL('image/png');
        const resp = await fetch(imageUrl);
        const imageSize = +resp.headers.get('Content-Length');
        setOutput({
          width,
          height,
          videoUrl,
          videoType: evt.data.type,
          videoSize: evt.data.size,
          imageUrl,
          imageSize,
        });
        canvas.remove();

        setRendering(false);
        track('end render', { time: (performance.now() - beginRenderTime) / 1000 });
      }, { once: true });
      recorder.stop();
    } catch (e) {
      track('render error', { message: e.message });
      setError(e.message);
      setRendering(false);
    }
  };

  return (
    <div className="Render">
      {error && (<p>{error}</p>)}
      {rendering ? (
        <>
          <p>Rendering in progress...</p>
          <div>
            {prepProg.map((prog, i) => (
              <div key={i}>
                <progress value={prog} />
                {`Preparing segment ${i}/${segments.length} (${segments[i].transform})`}
              </div>
            ))}
          </div>
          <div>
            {runProg.map((prog, i) => (
              <div key={i}>
                <progress value={prog} />
                {`Running segment ${i}/${segments.length} (${segments[i].transform})`}
              </div>
            ))}
          </div>
          <p>Don&apos;t mind the weird stuff happening below</p>
        </>
      ) : (
        <>
          <button type="button" className="u-normal-button" onClick={render}>render</button>
          <RenderOptions />
        </>
      )}
      <div ref={renderRootRef} />
    </div>
  );
};
