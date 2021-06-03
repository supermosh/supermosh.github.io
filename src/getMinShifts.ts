import { MinShifts } from './types';

export default (previous: ImageData, real: ImageData, size: number, shifts: number[]) => {
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
