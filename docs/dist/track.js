import mixpanel from "../_snowpack/pkg/mixpanel-browser.js";
if (window.location.hostname === "supermosh.github.io") {
  mixpanel.init("eaea796d6217c6d87165d71ff1a82e0b");
}
export default (...args) => {
  if (window.location.hostname !== "supermosh.github.io")
    return;
  mixpanel.track(...args);
};
