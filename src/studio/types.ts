export type Vid = {
  src: string;
  chunks: EncodedVideoChunk[];
  width: number;
  height: number;
};

type BaseSegment = { name: string };

export type CopySegment = BaseSegment & {
  kind: "copy";
  start: number;
  end: number;
};

export type GlideSegment = BaseSegment & {
  kind: "glide";
  start: number;
  time: number;
};

export type DriftSegment = BaseSegment & {
  kind: "drift";
  start: number;
  end: number;
};

export type Segment = CopySegment | GlideSegment | DriftSegment;

export type InputProps<T> = {
  value: T;
  onChange: (newValue: T) => any;
};
