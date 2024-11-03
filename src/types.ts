export type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => unknown;
};
