export type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => unknown;
};

export type Vid = {
  src: string;
  file: File;
  name: string;
  chunks: EncodedVideoChunk[];
};

export type Segment = {
  name: string;
  from: number;
  to: number;
  repeat: number;
};

export type Settings = {
  width: number;
  height: number;
};
