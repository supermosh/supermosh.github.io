export type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => unknown;
};

export type Vid = {
  name: string;
  src: string;
  chunks: EncodedVideoChunk[];
};

export type Segment = {
  name: string;
  from: number;
  to: number;
  repeat: number;
};
