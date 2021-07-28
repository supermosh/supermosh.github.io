import {elementEvent} from "../_snowpack/link/core/dist/index.js";
export default async (savedFile) => {
  const src = URL.createObjectURL(savedFile.file);
  const elt = document.createElement("video");
  elt.src = src;
  await elementEvent(elt, "canplay");
  return {
    ...savedFile,
    src,
    previewing: false,
    width: elt.videoWidth,
    height: elt.videoHeight
  };
};
