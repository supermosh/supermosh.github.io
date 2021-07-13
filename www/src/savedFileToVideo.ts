import { SavedFile, Video } from './types';
import { elementEvent } from './lib';

export default async (savedFile: SavedFile): Promise<Video> => {
  const src = URL.createObjectURL(savedFile.file);
  const elt = document.createElement('video');
  elt.src = src;
  await elementEvent(elt, 'canplay');
  return {
    ...savedFile,
    src,
    previewing: false,
    width: elt.videoWidth,
    height: elt.videoHeight,
  };
};
