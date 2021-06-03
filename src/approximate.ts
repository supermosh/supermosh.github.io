import { MinShifts } from './types';

export default (previous: ImageData, minShifts: MinShifts, size: number): ImageData => {
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
