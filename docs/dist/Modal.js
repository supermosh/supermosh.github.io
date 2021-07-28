import React from "../_snowpack/pkg/react.js";
export default ({children, onClose}) => /* @__PURE__ */ React.createElement("div", {
  className: "Modal",
  onClick: () => {
    onClose();
  }
}, /* @__PURE__ */ React.createElement("div", {
  className: "box",
  onClick: (evt) => evt.stopPropagation()
}, children));
