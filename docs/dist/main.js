import React from "../_snowpack/pkg/react.js";
import ReactDOM from "../_snowpack/pkg/react-dom.js";
import mixpanel from "../_snowpack/pkg/mixpanel-browser.js";
import App from "./App.js";
import {setup} from "./db.js";
(async () => {
  mixpanel.init("eaea796d6217c6d87165d71ff1a82e0b", {debug: true});
  mixpanel.track("start");
  await setup();
  ReactDOM.render(/* @__PURE__ */ React.createElement(App, null), document.querySelector("#root"));
})();
