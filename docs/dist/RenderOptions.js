import React, {useState} from "../_snowpack/pkg/react.js";
import {config} from "../_snowpack/link/core/dist/index.js";
export default () => {
  const [fps, setFps] = useState(config.fps.toString());
  const [size, setSize] = useState(config.size.toString());
  const [xyShifts, setXyShifts] = useState(config.xyShifts.toString());
  const [error, setError] = useState("");
  return /* @__PURE__ */ React.createElement("div", {
    className: "RenderOptions"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Frames per second"), /* @__PURE__ */ React.createElement("input", {
    type: "number",
    value: fps,
    onChange: (evt) => {
      setFps(evt.target.value);
      config.fps = +evt.target.value;
    }
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Block size"), /* @__PURE__ */ React.createElement("input", {
    type: "number",
    value: size,
    onChange: (evt) => {
      setSize(evt.target.value);
      config.size = +evt.target.value;
    }
  })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Block shifts"), /* @__PURE__ */ React.createElement("input", {
    value: xyShifts,
    onChange: (evt) => {
      setXyShifts(evt.target.value);
      const newXyShifts = evt.target.value.split(",").map((value) => +value);
      if (newXyShifts.some((value) => Number.isNaN(value))) {
        setError('Shifts should be a comma-separated list of numbers, like "0,1,-1,2,-2"');
      } else {
        setError("");
        config.xyShifts = newXyShifts;
      }
    }
  })), error && /* @__PURE__ */ React.createElement("div", null, error));
};
