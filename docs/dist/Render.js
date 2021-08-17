import React, {useRef, useState} from "../_snowpack/pkg/react.js";
import {
  getDimensions,
  prepareGlideSegment,
  prepareMovementSegment,
  runCopySegment,
  runGlideSegment,
  runMovementSegment
} from "../_snowpack/link/core/dist/index.js";
import track from "./track.js";
import RenderOptions from "./RenderOptions.js";
export default ({
  segments,
  setOutput
}) => {
  const renderRootRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState(null);
  const [prepProg, setPrepProg] = useState([]);
  const [runProg, setRunProg] = useState([]);
  const render = async () => {
    try {
      prepProg.splice(0, prepProg.length, ...segments.map(() => 0));
      setPrepProg([...prepProg]);
      runProg.splice(0, prepProg.length, ...segments.map(() => 0));
      setRunProg([...runProg]);
      setRendering(true);
      setError(null);
      track("begin render", {segments});
      const beginRenderTime = performance.now();
      const {width, height} = await getDimensions(segments);
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if ((segment.transform === "copy" || segment.transform === "movement") && segment.end - segment.start === 0 || segment.transform === "glide" && segment.time === 0) {
          throw new Error("Segment has a duration of 0s");
        }
      }
      const preparedSegments = [];
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        switch (segment.transform) {
          case "copy":
            prepProg[i] = 0.5;
            setPrepProg([...prepProg]);
            preparedSegments.push(segment);
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
            break;
          case "glide":
            prepProg[i] = 0.5;
            setPrepProg([...prepProg]);
            preparedSegments.push(await prepareGlideSegment(segment, renderRootRef.current));
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
            break;
          case "movement":
            prepProg[i] = 0;
            setPrepProg([...prepProg]);
            preparedSegments.push(await prepareMovementSegment(segment, renderRootRef.current, (prog) => {
              prepProg[i] = prog;
              setPrepProg([...prepProg]);
            }));
            prepProg[i] = 1;
            setPrepProg([...prepProg]);
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
      for (let i = 0; i < preparedSegments.length; i++) {
        const segment = preparedSegments[i];
        switch (segment.transform) {
          case "copy":
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runCopySegment(segment, ctx, renderRootRef.current, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
            break;
          case "glide":
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runGlideSegment(segment, ctx, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
            break;
          case "movement":
            runProg[i] = 0;
            setRunProg([...runProg]);
            await runMovementSegment(segment, ctx, (prog) => {
              runProg[i] = prog;
              setRunProg([...runProg]);
            });
            runProg[i] = 1;
            setRunProg([...runProg]);
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
        track("end render", {time: (performance.now() - beginRenderTime) / 1e3});
      }, {once: true});
      recorder.stop();
    } catch (e) {
      track("render error", {message: e.message});
      setError(e.message);
      setRendering(false);
    }
  };
  return /* @__PURE__ */ React.createElement("div", {
    className: "Render"
  }, error && /* @__PURE__ */ React.createElement("p", null, error), rendering ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", null, "Rendering in progress..."), /* @__PURE__ */ React.createElement("div", null, prepProg.map((prog, i) => /* @__PURE__ */ React.createElement("div", {
    key: i
  }, /* @__PURE__ */ React.createElement("progress", {
    value: prog
  }), `Preparing segment ${i}/${segments.length} (${segments[i].transform})`))), /* @__PURE__ */ React.createElement("div", null, runProg.map((prog, i) => /* @__PURE__ */ React.createElement("div", {
    key: i
  }, /* @__PURE__ */ React.createElement("progress", {
    value: prog
  }), `Running segment ${i}/${segments.length} (${segments[i].transform})`))), /* @__PURE__ */ React.createElement("p", null, "Don't mind the weird stuff happening below")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", {
    type: "button",
    className: "u-normal-button",
    onClick: render
  }, "render"), /* @__PURE__ */ React.createElement(RenderOptions, null)), /* @__PURE__ */ React.createElement("div", {
    ref: renderRootRef
  }));
};
