import React from "../_snowpack/pkg/react.js";
import ReactDOM from "../_snowpack/pkg/react-dom.js";
import "./track.js";
import App from "./App.js";
import {setup} from "./db.js";
(async () => {
  await setup();
  ReactDOM.render(/* @__PURE__ */ React.createElement(App, null), document.querySelector("#root"));
})();
