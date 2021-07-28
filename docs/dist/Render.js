import React, {useRef, useState} from "../_snowpack/pkg/react.js";
import {
  getDimensions,
  prepareGlideSegment,
  prepareMovementSegment,
  runCopySegment,
  runGlideSegment,
  runMovementSegment
} from "../_snowpack/link/core/dist/index.js";
export default ({
  segments,
  setOutput
}) => {
  const renderRootRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const render = async () => {
    setRendering(true);
    const {width, height} = await getDimensions(segments);
    const preparedSegments = [];
    for (const segment of segments) {
      switch (segment.transform) {
        case "copy":
          preparedSegments.push(segment);
          break;
        case "glide":
          preparedSegments.push(await prepareGlideSegment(segment, renderRootRef.current));
          break;
        case "movement":
          preparedSegments.push(await prepareMovementSegment(segment, renderRootRef.current));
          break;
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    renderRootRef.current.append(canvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, width, height);
    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream);
    recorder.start();
    for (const segment of preparedSegments) {
      switch (segment.transform) {
        case "copy":
          await runCopySegment(segment, ctx, renderRootRef.current);
          break;
        case "glide":
          await runGlideSegment(segment, ctx);
          break;
        case "movement":
          await runMovementSegment(segment, ctx);
          break;
      }
    }
    recorder.addEventListener("dataavailable", async (evt) => {
      const videoUrl = URL.createObjectURL(evt.data);
      const imageUrl = canvas.toDataURL("image/png");
      const resp = await fetch(imageUrl);
      const imageSize = +resp.headers.get("Content-Length");
      setOutput({
        width,
        height,
        videoUrl,
        videoType: evt.data.type,
        videoSize: evt.data.size,
        imageUrl,
        imageSize
      });
      canvas.remove();
      setRendering(false);
    }, {once: true});
    recorder.stop();
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "Render"
  }, rendering ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", null, "Rendering in progress..."), /* @__PURE__ */ React.createElement("p", null, "Don't mind the weird stuff happening below")) : /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button",
    onClick: render
  }, "render"), /* @__PURE__ */ React.createElement("div", {
    ref: renderRootRef
  }));
};
