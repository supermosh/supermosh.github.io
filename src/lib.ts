type MinShifts = {
  [xOffset: number]: {
    [yOffset: number]: {
      x: number,
      y: number,
    };
  };
};
type BaseSegment = {
  src: string;
};
type CopySegment = BaseSegment & {
  transform: 'copy';
  start: number;
  end: number;
};
type PreparedCopySegment = CopySegment & {}
type GlideSegment = BaseSegment & {
  transform: 'glide';
  time: number;
  length: number;
};
type PreparedGlideSegment = GlideSegment & {
  minShifts: MinShifts;
};
type MovementSegment = BaseSegment & {
  transform: 'movement';
  start: number;
  end: number;
};
type PreparedMovementSegment = MovementSegment & {
  minShiftss: MinShifts[];
};
type Segment = CopySegment | GlideSegment | MovementSegment;
type PreparedSegment = PreparedCopySegment | PreparedGlideSegment | PreparedMovementSegment;

export type Video = {
  file: File;
  url: string;
  previewing: boolean;
}

const fps = 30;
const size = 16;
const shifts = [0, 1, -1, 2, -2, 4, -4, 8, -8];

const getMinShifts = (previous: ImageData, real: ImageData) => {
  const { width, height } = previous;
  const minShifts: MinShifts = {};

  for (let xOffset = 0; xOffset < width; xOffset += size) {
    if (!minShifts[xOffset]) minShifts[xOffset] = [];
    for (let yOffset = 0; yOffset < height; yOffset += size) {
      if (!minShifts[xOffset][yOffset]) minShifts[xOffset][yOffset] = { x: NaN, y: NaN };

      const xMax = Math.min(xOffset + size, width);
      const yMax = Math.min(yOffset + size, height);

      let minDiff = +Infinity;
      for (const xShift of shifts) {
        for (const yShift of shifts) {
          let diff = 0;

          for (let x = xOffset; x < xMax; x++) {
            for (let y = yOffset; y < yMax; y++) {
              const xsrc = (x + xShift + width) % width;
              const ysrc = (y + yShift + height) % height;
              const isrc = 4 * (width * ysrc + xsrc);
              const idst = 4 * (width * y + x);
              diff += Math.abs(previous.data[isrc + 0] - real.data[idst + 0]);
              diff += Math.abs(previous.data[isrc + 1] - real.data[idst + 1]);
              diff += Math.abs(previous.data[isrc + 2] - real.data[idst + 2]);
            }
          }

          if (diff < minDiff) {
            minDiff = diff;
            minShifts[xOffset][yOffset].x = xShift;
            minShifts[xOffset][yOffset].y = yShift;
          }
        }
      }
    }
  }

  return minShifts;
};

const approximate = (previous: ImageData, minShifts: MinShifts): ImageData => {
  const { width, height } = previous;
  const out = new ImageData(width, height);

  for (let i = 3; i < out.data.length; i += 4) {
    out.data[i] = 255;
  }

  for (let xOffset = 0; xOffset < width; xOffset += size) {
    for (let yOffset = 0; yOffset < height; yOffset += size) {
      const xMax = Math.min(xOffset + size, width);
      const yMax = Math.min(yOffset + size, height);

      for (let x = xOffset; x < xMax; x++) {
        for (let y = yOffset; y < yMax; y++) {
          const xsrc = (x + minShifts[xOffset][yOffset].x + width) % width;
          const ysrc = (y + minShifts[xOffset][yOffset].y + height) % height;
          const isrc = 4 * (width * ysrc + xsrc);
          const idst = 4 * (width * y + x);
          out.data[idst + 0] = previous.data[isrc + 0];
          out.data[idst + 1] = previous.data[isrc + 1];
          out.data[idst + 2] = previous.data[isrc + 2];
        }
      }
    }
  }

  return out;
};

const elementEvent = (element: HTMLElement, eventName: string) => new Promise((resolve) => {
  element.addEventListener(eventName, resolve, { once: true });
});

const getDimensions = async (segments: Segment[]): Promise<{width: number; height: number}> => {
  const allDimensions = await Promise.all(segments.map(async (segment) => {
    const video = document.createElement('video');
    video.src = segment.src;
    document.body.append(video);
    await elementEvent(video, 'canplaythrough');
    const width = video.videoWidth;
    const height = video.videoHeight;
    video.remove();
    return { width, height };
  }));
  const widths = new Set(allDimensions.map((d) => d.width));
  const heights = new Set(allDimensions.map((d) => d.height));
  if (widths.size > 1 || heights.size > 1) {
    throw new Error('Videos do not all have the same dimensions');
  }
  return {
    width: [...widths][0],
    height: [...heights][0],
  };
};

const prepareGlideSegment = async (segment: GlideSegment): Promise<PreparedGlideSegment> => {
  const video = document.createElement('video');
  document.body.append(video);
  video.src = segment.src;
  await elementEvent(video, 'canplaythrough');

  const width = video.videoWidth;
  const height = video.videoHeight;

  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  video.currentTime = segment.time;
  await elementEvent(video, 'seeked');
  ctx.drawImage(video, 0, 0);
  const previous = ctx.getImageData(0, 0, width, height);

  const real = await (async () => {
    while (!video.ended) {
      video.currentTime += 1 / fps;
      await elementEvent(video, 'seeked');
      await new Promise((resolve) => requestAnimationFrame(resolve));
      ctx.drawImage(video, 0, 0);
      const ret = ctx.getImageData(0, 0, width, height);
      if (ret.data.filter((r, i) => r !== previous.data[i]).length > 100) {
        return ret;
      }
    }
    throw new Error('All frames are almost identical');
  })();

  const minShifts = getMinShifts(previous, real);

  video.remove();
  canvas.remove();
  return { ...segment, minShifts };
};

const prepareMovementSegment = async (segment: MovementSegment): Promise<PreparedMovementSegment> => {
  const video = document.createElement('video');
  document.body.append(video);
  video.src = segment.src;
  await elementEvent(video, 'canplaythrough');

  const width = video.videoWidth;
  const height = video.videoHeight;

  const canvas = document.createElement('canvas');
  document.body.append(canvas);
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  video.currentTime = segment.start;
  await elementEvent(video, 'seeked');

  const minShiftss: MinShifts[] = [];

  while (video.currentTime < segment.end) {
    ctx.drawImage(video, 0, 0);
    const previous = ctx.getImageData(0, 0, width, height);
    video.currentTime += 1 / fps;
    await elementEvent(video, 'seeked');
    ctx.drawImage(video, 0, 0);
    const real = ctx.getImageData(0, 0, width, height);
    minShiftss.push(getMinShifts(previous, real));
  }

  video.remove();
  canvas.remove();

  return { ...segment, minShiftss };
};

const runCopySegment = async (segment: PreparedCopySegment, ctx: CanvasRenderingContext2D): Promise<void> => {
  const video = document.createElement('video');
  video.src = segment.src;
  document.body.append(video);
  await elementEvent(video, 'canplaythrough');
  video.currentTime = segment.start;
  await elementEvent(video, 'seeked');
  while (video.currentTime < segment.end) {
    ctx.drawImage(video, 0, 0);
    video.currentTime += 1 / fps;
    await elementEvent(video, 'seeked');
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  video.remove();
};

const runGlideSegment = async (segment: PreparedGlideSegment, ctx: CanvasRenderingContext2D): Promise<void> => {
  for (let i = 0; i < segment.length * fps; i++) {
    const previous = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const next = approximate(previous, segment.minShifts);
    ctx.putImageData(next, 0, 0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

const runMovementSegment = async (segment: PreparedMovementSegment, ctx: CanvasRenderingContext2D): Promise<void> => {
  for (const minShifts of segment.minShiftss) {
    const previous = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const next = approximate(previous, minShifts);
    ctx.putImageData(next, 0, 0);
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

const main = async (segments: Segment[]) => {
  const { width, height } = await getDimensions(segments);

  const preparedSegments: PreparedSegment[] = [];
  for (const segment of segments) {
    switch (segment.transform) {
      case 'copy': preparedSegments.push(segment); break;
      case 'glide': preparedSegments.push(await prepareGlideSegment(segment)); break;
      case 'movement': preparedSegments.push(await prepareMovementSegment(segment)); break;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.style.outline = '1px solid red';
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  // @ts-ignore
  const stream = canvas.captureStream();
  const recorder = new MediaRecorder(stream);
  recorder.start();

  for (const segment of preparedSegments) {
    switch (segment.transform) {
      case 'copy': await runCopySegment(segment, ctx); break;
      case 'glide': await runGlideSegment(segment, ctx); break;
      case 'movement': await runMovementSegment(segment, ctx); break;
    }
  }

  recorder.addEventListener('dataavailable', (evt) => {
    const url = URL.createObjectURL(evt.data);
    const video = document.createElement('video');
    video.src = url;
    video.controls = true;
    video.autoplay = true;
    document.body.append(video);
  }, { once: true });
  recorder.stop();
};

export default main;