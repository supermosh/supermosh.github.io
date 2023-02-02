import mixpanel from "mixpanel-browser";

if (window.location.hostname === "supermosh.github.io") {
  mixpanel.init("eaea796d6217c6d87165d71ff1a82e0b");
}

const track: typeof mixpanel.track = (...args) => {
  if (window.location.hostname !== "supermosh.github.io") return;
  mixpanel.track(...args);
};

export default track;
