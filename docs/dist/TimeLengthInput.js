import React, {useRef, useState} from "../_snowpack/pkg/react.js";
import Modal from "./Modal.js";
export default ({
  segment,
  onChange
}) => {
  const [editing, setEditing] = useState(false);
  const [time, setTime] = useState(segment.time);
  const [length, setLength] = useState(segment.length);
  const video = useRef(null);
  const onTimeChange = (newTime) => {
    setTime(newTime);
    video.current.currentTime = newTime;
  };
  const onLengthChange = (newLength) => {
    setLength(newLength);
  };
  const cancel = () => {
    setEditing(false);
    setTime(segment.time);
    setLength(segment.length);
  };
  const save = () => {
    setEditing(false);
    onChange(time, length);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "TimeLengthInput"
  }, /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button display-button",
    onClick: () => setEditing(true)
  }, `${segment.time}s, ${segment.length}s`), editing && /* @__PURE__ */ React.createElement(Modal, {
    onClose: () => setEditing(false)
  }, /* @__PURE__ */ React.createElement("div", {
    className: "modal-content"
  }, /* @__PURE__ */ React.createElement("video", {
    src: segment.src,
    ref: video
  }), /* @__PURE__ */ React.createElement("div", null, `Time: ${time}s`), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    min: "0",
    max: video.current?.duration,
    step: "0.1",
    value: time,
    onChange: (evt) => onTimeChange(+evt.target.value)
  })), /* @__PURE__ */ React.createElement("div", null, `Length: ${length.toFixed(1)}s`), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("input", {
    type: "range",
    min: "0",
    max: "10",
    step: "0.1",
    value: length,
    onChange: (evt) => onLengthChange(+evt.target.value)
  })), /* @__PURE__ */ React.createElement("div", {
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
