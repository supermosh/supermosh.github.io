import React from "../_snowpack/pkg/react.js";
import Modal from "./Modal.js";
import savedFileToVideo from "./savedFileToVideo.js";
import {filesStore} from "./db.js";
export default ({
  videos,
  setVideos,
  segments,
  setSegments
}) => {
  const addVideo = async (evt) => {
    const file = evt.target.files[0];
    const key = await filesStore.add(file);
    const video = await savedFileToVideo({key, file});
    setVideos([...videos, video]);
    evt.target.value = "";
  };
  const removeVideo = async (i) => {
    await filesStore.delete(videos[i].key);
    const newSegments = segments.filter((segment) => segment.src !== videos[i].src);
    if (newSegments.length < segments.length) {
      setSegments(newSegments);
    }
    URL.revokeObjectURL(videos[i].src);
    videos.splice(i, 1);
    setVideos([...videos]);
  };
  const previewVideo = (i, previewing) => {
    videos[i].previewing = previewing;
    setVideos([...videos]);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "Videos"
  }, videos.length === 0 ? /* @__PURE__ */ React.createElement("p", null, "No video uploaded yet") : videos.map((video, i) => /* @__PURE__ */ React.createElement("div", {
    key: video.key,
    className: "media"
  }, /* @__PURE__ */ React.createElement("video", {
    className: "thumb",
    src: video.src,
    muted: true,
    loop: true,
    autoPlay: true,
    title: `preview ${video.file.name}`,
    onClick: () => {
      previewVideo(i, true);
    }
  }), /* @__PURE__ */ React.createElement("span", {
    className: "name",
    title: video.file.name
  }, `${video.width}x${video.height} ${video.file.name}`), /* @__PURE__ */ React.createElement("button", {
    className: "u-icon-button",
    type: "button",
    title: "delete",
    onClick: () => {
      removeVideo(i);
    }
  }, /* @__PURE__ */ React.createElement("img", {
    src: "/icons/delete.svg",
    alt: "delete video"
  })), video.previewing && /* @__PURE__ */ React.createElement(Modal, {
    onClose: () => {
      previewVideo(i, false);
    }
  }, /* @__PURE__ */ React.createElement("video", {
    className: "preview",
    src: video.src,
    autoPlay: true,
    controls: true,
    loop: true
  })))), /* @__PURE__ */ React.createElement("div", null, "Add video: ", /* @__PURE__ */ React.createElement("input", {
    type: "file",
    accept: "video/*",
    onInput: addVideo
  })));
};
