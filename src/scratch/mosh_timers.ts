type Clip = {
  start: number;
  end: number;
  rate: number;
};

export const clipIndices = ({ start, end, rate }: Clip) => {
  const length = Math.floor((end - start) / rate);
  return Array(length)
    .fill(null)
    .map((_, i) => Math.floor(start + ((end - start) * i) / length));
};
