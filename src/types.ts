export type Video = {
  file: File;
  url: string;
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
