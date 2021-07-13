import { SavedFile, Video } from './types';
import { elementEvent } from './lib';

export default async (savedFile: SavedFile): Promise<Video> => {
  const url = URL.createObjectURL(savedFile.file);
  const elt = document.createElement('video');
  elt.src = url;
  await elementEvent(elt, 'canplay');
  return {
    ...savedFile,
    url,
    previewing: false,
    width: elt.videoWidth,
    height: elt.videoHeight,
  };
};
