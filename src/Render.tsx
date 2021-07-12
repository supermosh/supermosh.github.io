import React, { Dispatch, SetStateAction, useRef } from 'react';
import {
  getDimensions,
  PreparedSegment,
  prepareGlideSegment,
  prepareMovementSegment,
  runCopySegment,
  runGlideSegment,
  runMovementSegment,
  Segment,
} from './lib';
import { Output } from './types';

export default ({
  segments,
  setOutput,
}: {
  segments: Segment[],
  setOutput: Dispatch<SetStateAction<Output>>
}) => {
  const renderRootRef = useRef(null);

  const render = async () => {
    const { width, height } = await getDimensions(segments, renderRootRef.current);

    const preparedSegments: PreparedSegment[] = [];
    for (const segment of segments) {
      switch (segment.transform) {
        case 'copy': preparedSegments.push(segment); break;
        case 'glide': preparedSegments.push(await prepareGlideSegment(segment, renderRootRef.current)); break;
        case 'movement': preparedSegments.push(await prepareMovementSegment(segment, renderRootRef.current)); break;
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

    for (const segment of preparedSegments) {
      switch (segment.transform) {
        case 'copy': await runCopySegment(segment, ctx, renderRootRef.current); break;
        case 'glide': await runGlideSegment(segment, ctx); break;
        case 'movement': await runMovementSegment(segment, ctx); break;
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
    }, { once: true });
    recorder.stop();
  };

  return (
    <div className="Render">
      <div>
        <button type="button" className="u-normal-button" onClick={render}>render</button>
      </div>
      <div ref={renderRootRef} />
    </div>
  );
};
