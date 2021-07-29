import React, {useState} from "../_snowpack/pkg/react.js";
import Modal from "./Modal.js";
const computeReadableSize = (size) => {
  if (size < 1024)
    return `${size}b`;
  if (size < 1024 * 1024)
    return `${Math.floor(size / 1024)}Kb`;
  return `${Math.floor(size / 1024)}Mb`;
};
export default ({output}) => {
  const [previewingVideo, setPreviewingVideo] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [previewingImage, setPreviewingImage] = useState(false);
  if (output === null) {
    return /* @__PURE__ */ React.createElement("div", {
      className: "Result-empty"
    }, /* @__PURE__ */ React.createElement("p", null, "No output yet rendered"));
  }
  const readableVideoDuration = [
    videoDuration >= 3600 && `${Math.floor(videoDuration / 3600)}h`,
    videoDuration >= 60 && `${Math.floor(videoDuration % 3600 / 60)}mn`,
    `${Math.floor(videoDuration % 60)}s`
  ].filter(Boolean).join("");
  const readableVideoSize = computeReadableSize(output.videoSize);
  const readableImageSize = computeReadableSize(output.imageSize);
  return /* @__PURE__ */ React.createElement("div", {
    className: "Result-done"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "desc"
  }, /* @__PURE__ */ React.createElement("div", null, "Video"), /* @__PURE__ */ React.createElement("div", null, `${output.width}x${output.height}`), /* @__PURE__ */ React.createElement("div", null, readableVideoDuration), /* @__PURE__ */ React.createElement("div", null, readableVideoSize), /* @__PURE__ */ React.createElement("div", null, `type: ${output.videoType}`)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("video", {
    className: "thumb",
    src: output.videoUrl,
    muted: true,
    autoPlay: true,
    loop: true,
    onClick: () => setPreviewingVideo(true),
    title: "Click to preview",
    onCanPlay: (evt) => setVideoDuration(evt.target.duration)
  })), /* @__PURE__ */ React.createElement("div", {
    className: "desc"
  }, /* @__PURE__ */ React.createElement("div", null, "Last frame"), /* @__PURE__ */ React.createElement("div", null, `${output.width}x${output.height}`), /* @__PURE__ */ React.createElement("div", null, readableImageSize), /* @__PURE__ */ React.createElement("div", null, `type: ${output.imageUrl.split(";")[0].split(":")[1]}`), output.imageUrl.length), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("img", {
    className: "thumb",
    src: output.imageUrl,
    alt: "",
    onClick: () => setPreviewingImage(true)
  })), previewingVideo && /* @__PURE__ */ React.createElement(Modal, {
    onClose: () => setPreviewingVideo(false)
  }, /* @__PURE__ */ React.createElement("video", {
    className: "preview",
    src: output.videoUrl,
    autoPlay: true,
    controls: true,
    loop: true
  })), previewingImage && /* @__PURE__ */ React.createElement(Modal, {
    onClose: () => setPreviewingImage(false)
  }, /* @__PURE__ */ React.createElement("img", {
    className: "preview",
    src: output.imageUrl,
    alt: ""
  })));
};
