import React, {useEffect, useRef, useState} from "../_snowpack/pkg/react.js";
import Modal from "./Modal.js";
export default ({
  segment,
  onChange
}) => {
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(segment.start);
  const [end, setEnd] = useState(segment.end);
  const startVideo = useRef(null);
  const loopVideo = useRef(null);
  const endVideo = useRef(null);
  const loopTimeoutId = useRef(0);
  const onStartChange = (newStart) => {
    setStart(newStart);
    startVideo.current.currentTime = newStart;
    if (newStart > end) {
      setEnd(newStart);
      endVideo.current.currentTime = newStart;
    }
  };
  const onEndChange = (newEnd) => {
    setEnd(newEnd);
    endVideo.current.currentTime = newEnd;
    if (newEnd < start) {
      setStart(newEnd);
      startVideo.current.currentTime = newEnd;
    }
  };
  const loop = () => {
    if (!loopVideo.current)
      return;
    if (end === start) {
      loopVideo.current.currentTime = start;
      loopVideo.current.pause();
      return;
    }
    loopVideo.current.currentTime = start;
    if (loopVideo.current.paused)
      loopVideo.current.play();
    loopTimeoutId.current = setTimeout(loop, (end - start) * 1e3);
  };
  const cancel = () => {
    setEditing(false);
    setStart(segment.start);
    setEnd(segment.end);
  };
  const save = () => {
    setEditing(false);
    onChange(start, end);
  };
  useEffect(() => {
    if (!loopVideo.current)
      return;
    if (loopTimeoutId.current)
      clearTimeout(loopTimeoutId.current);
    loop();
  }, [start, end, editing]);
  return /* @__PURE__ */ React.createElement("div", {
    className: "StartEndInput"
  }, /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button display-button",
    onClick: () => setEditing(true)
  }, `${segment.start}s - ${segment.end}s`), editing && /* @__PURE__ */ React.createElement(Modal, {
    onClose: () => setEditing(false)
  }, /* @__PURE__ */ React.createElement("div", {
    className: "modal-content"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "videos"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("video", {
    src: segment.src,
    ref: startVideo
  })), /* @__PURE__ */ React.createElement("div", null, `Start: ${start}s`), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    min: "0",
    max: loopVideo.current?.duration,
    step: "0.1",
    value: start,
    onChange: (evt) => onStartChange(+evt.target.value)
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("video", {
    src: segment.src,
    ref: loopVideo,
    muted: true
  }), /* @__PURE__ */ React.createElement("div", null, `Duration: ${(end - start).toFixed(1)}s`)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("video", {
    src: segment.src,
    ref: endVideo
  }), /* @__PURE__ */ React.createElement("div", null, `End: ${end}s`), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    min: "0",
    max: loopVideo.current?.duration,
    step: "0.1",
    value: end,
    onChange: (evt) => onEndChange(+evt.target.value)
  })))), /* @__PURE__ */ React.createElement("div", {
    className: "buttons"
  }, /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button cancel",
    onClick: cancel
  }, "Cancel"), /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button save",
    onClick: save
  }, "Save")))));
};
