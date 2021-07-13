import { Segment } from './lib';

export type Video = {
  key: number;
  file: File;
  src: string;
  previewing: boolean;
  width: number;
  height: number;
}
export type Output = null | {
  width: number;
  height: number;
  videoUrl: string;
  videoSize: number;
  videoType: string;
  imageUrl: string;
  imageSize: number;
}
export type SavedFile = {
  key: number;
  file: File;
}
export type SavedSegment = Segment & {
  savedFileKey: number;
}
