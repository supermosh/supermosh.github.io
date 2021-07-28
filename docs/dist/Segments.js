import React from "../_snowpack/pkg/react.js";
import StartEndInput from "./StartEndInput.js";
import TimeLengthInput from "./TimeLengthInput.js";
export default ({
  videos,
  segments,
  setSegments
}) => {
  const moveUp = (i) => {
    segments.splice(i - 1, 2, segments[i], segments[i - 1]);
    setSegments([...segments]);
  };
  const moveDown = (i) => {
    segments.splice(i, 2, segments[i + 1], segments[i]);
    setSegments([...segments]);
  };
  const remove = (i) => {
    segments.splice(i, 1);
    setSegments([...segments]);
  };
  const add = () => {
    setSegments([
      ...segments,
      {
        transform: "copy",
        src: videos[0].src,
        start: 0,
        end: 0
      }
    ]);
  };
  const setTransform = (i, transform) => {
    switch (transform) {
      case "copy":
        segments[i] = {
          transform: "copy",
          src: segments[i].src,
          start: 0,
          end: 0
        };
        break;
      case "glide":
        segments[i] = {
          transform: "glide",
          src: segments[i].src,
          time: 0,
          length: 0
        };
        break;
      case "movement":
        segments[i] = {
          transform: "movement",
          src: segments[i].src,
          start: 0,
          end: 0
        };
        break;
    }
    setSegments([...segments]);
  };
  const setSrc = (i, src) => {
    segments[i].src = src;
    setSegments([...segments]);
  };
  const onStartEndChange = (i, start, end) => {
    segments[i].start = start;
    segments[i].end = end;
    setSegments([...segments]);
  };
  const onTimeLengthChange = (i, time, length) => {
    segments[i].time = time;
    segments[i].length = length;
    setSegments([...segments]);
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "Segments"
  }, videos.length === 0 ? /* @__PURE__ */ React.createElement("p", null, "Add videos to be able to define segments") : /* @__PURE__ */ React.createElement(React.Fragment, null, segments.length === 0 ? /* @__PURE__ */ React.createElement("p", null, "No segments defined") : segments.map((segment, i) => /* @__PURE__ */ React.createElement("div", {
    className: "row",
    key: i
  }, /* @__PURE__ */ React.createElement("button", {
    className: "u-icon-button",
    type: "button",
    style: {visibility: i > 0 ? "visible" : "hidden"},
    onClick: () => moveUp(i)
  }, /* @__PURE__ */ React.createElement("img", {
    src: "/icons/up.svg",
    alt: ""
  })), /* @__PURE__ */ React.createElement("button", {
    className: "u-icon-button",
    type: "button",
    style: {visibility: i < segments.length - 1 ? "visible" : "hidden"},
    onClick: () => moveDown(i)
  }, /* @__PURE__ */ React.createElement("img", {
    src: "/icons/down.svg",
    alt: ""
  })), /* @__PURE__ */ React.createElement("button", {
    className: "u-icon-button",
    type: "button",
    onClick: () => remove(i)
  }, /* @__PURE__ */ React.createElement("img", {
    src: "/icons/delete.svg",
    alt: ""
  })), /* @__PURE__ */ React.createElement("select", {
    className: "transform",
    value: segment.transform,
    onInput: (evt) => setTransform(i, evt.target.value)
  }, /* @__PURE__ */ React.createElement("option", {
    value: "copy"
  }, "copy"), /* @__PURE__ */ React.createElement("option", {
    value: "glide"
  }, "glide"), /* @__PURE__ */ React.createElement("option", {
    value: "movement"
  }, "movement")), /* @__PURE__ */ React.createElement("select", {
    className: "src",
    value: segment.src,
    onInput: (evt) => setSrc(i, evt.target.value)
  }, videos.map((video) => /* @__PURE__ */ React.createElement("option", {
    key: video.key,
    value: video.src
  }, video.file.name))), (segment.transform === "copy" || segment.transform === "movement") && /* @__PURE__ */ React.createElement(StartEndInput, {
    segment,
    onChange: (start, end) => onStartEndChange(i, start, end)
  }), segment.transform === "glide" && /* @__PURE__ */ React.createElement(TimeLengthInput, {
    segment,
    onChange: (time, length) => onTimeLengthChange(i, time, length)
  }))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button",
    onClick: add
  }, "Add a segment"))));
};
