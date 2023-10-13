export const x = <T>(x: T | null | undefined): T => {
  if (x === undefined || x === null) throw new Error(`should not be undefined`);
  return x;
};
