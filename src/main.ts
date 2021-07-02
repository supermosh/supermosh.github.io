// import approximate from './approximate';
import getMinShifts from './getMinShifts';
import { MinShifts } from './types';

type BaseSegment = {src: string}
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
}
type MovementSegment = BaseSegment & {
  transform: 'movement';
  start: number;
  end: number;
}
type PreparedMovementSegment = MovementSegment & {
  minShiftss: MinShifts[];
}
type Segment = CopySegment | GlideSegment | MovementSegment;
type PreparedSegment = PreparedCopySegment | PreparedGlideSegment | PreparedMovementSegment;

const fps = 30;
const size = 16;
const shifts = [0, 1, -1, 2, -2, 4, -4, 8, -8];

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
  video.currentTime = segment.time + 1 / fps;
  await elementEvent(video, 'seeked');
  ctx.drawImage(video, 0, 0);
  const real = ctx.getImageData(0, 0, width, height);

  const minShifts = getMinShifts(previous, real, size, shifts);

  video.remove();
  canvas.remove();
  return { ...segment, minShifts };
};

// TODO
const prepareMovementSegment = async (segment: MovementSegment): Promise<PreparedMovementSegment> => ({ ...segment, minShiftss: [[]] });

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
  }
  video.remove();
};

const main = async (segments: Segment[]) => {
  const { width, height } = await getDimensions(segments);

  const preparedSegments: PreparedSegment[] = await Promise.all(segments.map(async (segment) => {
    switch (segment.transform) {
      case 'copy': return segment;
      case 'glide': return prepareGlideSegment(segment);
      case 'movement': return prepareMovementSegment(segment);
    }
  }));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);
  const ctx = canvas.getContext('2d');

  for (const segment of preparedSegments) {
    switch (segment.transform) {
      case 'copy': runCopySegment(segment, ctx); break;
      default: throw new Error('not implemented yet');
    }
  }
};

{
  const segments: Segment[] = [
    {
      src: '/static/small/face-colors.mp4',
      transform: 'copy',
      start: 0,
      end: 4,
    },
    {
      src: '/static/small/face-colors.mp4',
      transform: 'glide',
      time: 4,
      length: 4,
    },
  ];

  main(segments);
}
