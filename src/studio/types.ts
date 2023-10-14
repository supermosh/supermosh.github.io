export type Vid = {
  src: string;
  chunks: EncodedVideoChunk[];
  width: number;
  height: number;
};

export type Segment = { name: string } & (
  | { kind: "copy"; start: number; end: number }
  | { kind: "glide"; start: number; time: number }
  | { kind: "drift"; start: number; end: number }
);
