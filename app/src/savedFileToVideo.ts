import { elementEvent } from "supermosh";
import { SavedFile, Video } from "./types";

export default async (savedFile: SavedFile): Promise<Video> => {
  const src = URL.createObjectURL(savedFile.file);
  const elt = document.createElement("video");
  elt.src = src;
  await elementEvent(elt, "canplay");
  return {
    ...savedFile,
    src,
    previewing: false,
    width: elt.videoWidth,
    height: elt.videoHeight,
  };
};
