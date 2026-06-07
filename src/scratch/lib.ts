export const x = <T>(value: T | null | undefined): T => {
  if (value == null) throw new Error("Value should not be nullish");
  return value;
};

export const moshers = {
  copy: (from: number, to: number) =>
    Array(to - from)
      .fill(null)
      .map((_, i) => from + i),
  glide: (at: number, duration: number) =>
    Array(duration)
      .fill(null)
      .map(() => at),
  stretch: (from: number, to: number, rate: number) => {
    const length = Math.floor((to - from) / rate);
    return Array(length)
      .fill(null)
      .map((_, i) => Math.floor(from + i * rate));
  },
};
