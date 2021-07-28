import React from "../_snowpack/pkg/react.js";
import {BrowserRouter, Switch, Route, Link} from "../_snowpack/pkg/react-router-dom.js";
import Home from "./Home.js";
import About from "./About.js";
import Studio from "./Studio.js";
export default () => /* @__PURE__ */ React.createElement(BrowserRouter, null, /* @__PURE__ */ React.createElement("div", {
  className: "App"
}, /* @__PURE__ */ React.createElement("nav", null, /* @__PURE__ */ React.createElement(Link, {
  to: "/"
}, /* @__PURE__ */ React.createElement("img", {
  src: "/icons/home.svg",
  alt: "home icon"
})), /* @__PURE__ */ React.createElement(Link, {
  to: "/studio"
}, /* @__PURE__ */ React.createElement("img", {
  src: "/icons/studio.svg",
  alt: "studio icon"
})), /* @__PURE__ */ React.createElement(Link, {
  to: "/about"
}, /* @__PURE__ */ React.createElement("img", {
  src: "/icons/info.svg",
  alt: "info icon"
}))), /* @__PURE__ */ React.createElement(Switch, null, /* @__PURE__ */ React.createElement(Route, {
  path: "/studio"
}, /* @__PURE__ */ React.createElement(Studio, null)), /* @__PURE__ */ React.createElement(Route, {
  path: "/about"
}, /* @__PURE__ */ React.createElement(About, null)), /* @__PURE__ */ React.createElement(Route, {
  path: "/"
}, /* @__PURE__ */ React.createElement(Home, null)))));
