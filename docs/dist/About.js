import React, {useState} from "../_snowpack/pkg/react.js";
import {Link} from "../_snowpack/pkg/react-router-dom.js";
export default () => {
  const [expanded, setExpanded] = useState(-1);
  return /* @__PURE__ */ React.createElement("div", {
    className: "About"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "article"
  }, /* @__PURE__ */ React.createElement("h1", null, "About Supermosh"), /* @__PURE__ */ React.createElement("div", null, "Made with <3 by Nino Filiu"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://ninofiliu.com",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "ninofiliu.com")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://www.instagram.com/ssttaacckkyy/",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "instagram.com/ssttaacckkyy")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://twitter.com/ninofiliu",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "twitter.com/ninofiliu")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", {
    href: "mailto:nino.filiu@gmail.com",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "nino.filiu@gmail.com")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/supermosh/supermosh.github.io",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "Source code")), /* @__PURE__ */ React.createElement("section", {
    className: expanded === 0 ? "--expanded" : ""
  }, /* @__PURE__ */ React.createElement("h2", {
    onClick: () => setExpanded(expanded === 0 ? -1 : 0),
    role: "button"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "plus"
  }, "[+]"), /* @__PURE__ */ React.createElement("span", {
    className: "minus"
  }, "[-]"), " Is Supermosh free?"), /* @__PURE__ */ React.createElement("div", {
    className: "section-content"
  }, /* @__PURE__ */ React.createElement("p", null, "Yes."), /* @__PURE__ */ React.createElement("p", null, "Supermosh is completely free. Just go to ", /* @__PURE__ */ React.createElement(Link, {
    to: "/studio"
  }, "the studio"), " and start glitching."), /* @__PURE__ */ React.createElement("p", null, "There is no hidden cost. You will not have to create an account. Your personal data will not be harvested. Supermosh will not use your computer to mine bitcoins in the background. Nothing."), /* @__PURE__ */ React.createElement("p", null, "By coding Supermosh, I want to experiment, do something that has never been done before, and enable artists to get creative. I do not care about the money."), /* @__PURE__ */ React.createElement("p", null, "That being said, you are encouraged to mention me when posting Supermosh-generated visuals! I'm on ", /* @__PURE__ */ React.createElement("a", {
    href: "https://www.instagram.com/ssttaacckkyy/",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "Instagram"), " and ", /* @__PURE__ */ React.createElement("a", {
    href: "https://twitter.com/ninofiliu",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "Twitter"), "."))), /* @__PURE__ */ React.createElement("section", {
    className: expanded === 1 ? "--expanded" : ""
  }, /* @__PURE__ */ React.createElement("h2", {
    onClick: () => setExpanded(expanded === 1 ? -1 : 1)
  }, /* @__PURE__ */ React.createElement("span", {
    className: "plus"
  }, "[+]"), /* @__PURE__ */ React.createElement("span", {
    className: "minus"
  }, "[-]"), " What is datamoshing?"), /* @__PURE__ */ React.createElement("div", {
    className: "section-content"
  }, /* @__PURE__ */ React.createElement("p", null, "Datamoshing is a category of special effects based on the deletion, repetition, and reordering or compressed video frames. There is no simpler way to put this, but if you are looking for technical details, here it goes:"), /* @__PURE__ */ React.createElement("p", null, "The naïve way to encode a video would be to store on disk one image for every single frame of the video, but that would take a lot of disk space. Most videos are not random: often the current frame does not update a lot of pixels from the previous frame, we can just encode the movement and the color shift from the previous frame. Moreover we can often get away with describing only a fraction of the frames, and just say that whatever happens in between is a mix of what happens before and after."), /* @__PURE__ */ React.createElement("p", null, "So most compression algorithms take advantage of these possible simplifications by encoding a video into a series of compressed frames that can be of three types:"), /* @__PURE__ */ React.createElement("ul", null, /* @__PURE__ */ React.createElement("li", null, "Intra frames, or I-frames: naïve copy of the uncompressed frame"), /* @__PURE__ */ React.createElement("li", null, "Predicted frames, or P-frames: approximation of the current uncompressed frame based on the movement and color shift from some previous frame"), /* @__PURE__ */ React.createElement("li", null, "Bidirectional frames, or B-frames: approximation of the current uncompressed frame based on a mix between some previous and future frame")), /* @__PURE__ */ React.createElement("p", null, "So for example, the video of a ball falling on the ground would be compressed as such:"), /* @__PURE__ */ React.createElement("ol", null, /* @__PURE__ */ React.createElement("li", null, "i-frame: picture of the ball"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 75% frame 1, 25% frame 5"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 50% frame 1, 50% frame 5"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 25% frame 1, 75% frame 5"), /* @__PURE__ */ React.createElement("li", null, "p-frame: frame 1 but the ball is 5 pixels lower"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 75% frame 5, 25% frame 9"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 50% frame 5, 50% frame 9"), /* @__PURE__ */ React.createElement("li", null, "b-frame: 25% frame 5, 75% frame 9"), /* @__PURE__ */ React.createElement("li", null, "p-frame: frame 5 but the ball is 10 pixels lower"), /* @__PURE__ */ React.createElement("li", null, "...")), /* @__PURE__ */ React.createElement("p", null, "I-frames are heavy but P-frames takes less bits to describe and B-frames take almost no disk space, so by having only a few I-frames, some P-frames, and as much B-frames as possible, the video is compressed. Let's forget about B-frames though, because they only complicate the understanding, but they often come up, so bear them in mind."), /* @__PURE__ */ React.createElement("p", null, "Now what happens when we delete, re-order, or repeat some frames where they're not supposed to be? Datamosh, that's what happens."))), /* @__PURE__ */ React.createElement("section", {
    className: expanded === 2 ? "--expanded" : ""
  }, /* @__PURE__ */ React.createElement("h2", {
    onClick: () => setExpanded(expanded === 2 ? -1 : 2),
    role: "button"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "plus"
  }, "[+]"), /* @__PURE__ */ React.createElement("span", {
    className: "minus"
  }, "[-]"), " What are typical datamosh effects?"), /* @__PURE__ */ React.createElement("div", {
    className: "section-content"
  }, /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Glide"), ": one P-frame is copied several times instead of appearing just once, thus repeating a movement over and over"), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("strong", null, "Movement"), ": an I-frame is deleted, making the P-frames afterward apply to the first part of the video, thus applying the movement of the second part to the image of the first part"))), /* @__PURE__ */ React.createElement("section", {
    className: expanded === 3 ? "--expanded" : ""
  }, /* @__PURE__ */ React.createElement("h2", {
    onClick: () => setExpanded(expanded === 3 ? -1 : 3),
    role: "button"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "plus"
  }, "[+]"), /* @__PURE__ */ React.createElement("span", {
    className: "minus"
  }, "[-]"), " How is datamosh typically done?"), /* @__PURE__ */ React.createElement("div", {
    className: "section-content"
  }, /* @__PURE__ */ React.createElement("p", null, "You can use existing software taylored for datamoshing but they are expensive. After Effects starts at $21/mo and the only datamoshing plugin available there costs $40."), /* @__PURE__ */ React.createElement("p", null, "But you can do it manually, which is more interesting but also much more complex. First you have to convert your video to a codec where datamoshing is possible, typically using a command line tool like ", /* @__PURE__ */ React.createElement("a", {
    href: "https://ffmpeg.org/",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "ffmpeg"), ", because web-based conversions are rate-limited, malware-prone, and not tweakable enough."), /* @__PURE__ */ React.createElement("p", null, "Then you would use ", /* @__PURE__ */ React.createElement("a", {
    href: "http://avidemux.sourceforge.net/",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "Avidemux"), ", a software from the early 2000s. You ", /* @__PURE__ */ React.createElement("em", null, "have to use"), " a software this old and broken, since modern software fixes your glitches... which is not what you want! Avidemux allows you to do frame-by-frame manipulation, but as soon as you start doing weird stuff, the preview window breaks. You have to export your video everytime in order to preview them."), /* @__PURE__ */ React.createElement("p", null, "That is pretty much it but this journey is painful, expecially the part when you have to specify codec configurations to ffmpeg, because, besides the fact that ffmpeg is a pain in the ass to configure, that is when you really have to have precise technical knowledge on how compression algorithms work."))), /* @__PURE__ */ React.createElement("section", {
    className: expanded === 4 ? "--expanded" : ""
  }, /* @__PURE__ */ React.createElement("h2", {
    onClick: () => setExpanded(expanded === 4 ? -1 : 4),
    role: "button"
  }, /* @__PURE__ */ React.createElement("span", {
    className: "plus"
  }, "[+]"), /* @__PURE__ */ React.createElement("span", {
    className: "minus"
  }, "[-]"), " I have found a bug, what should I do?"), /* @__PURE__ */ React.createElement("div", {
    className: "section-content"
  }, /* @__PURE__ */ React.createElement("p", null, "Supermosh is under active development in an experimental area of web technologies. There will be bugs, I know. If you found one, please report it!"), /* @__PURE__ */ React.createElement("p", null, "You can contact me directly, or if you prefer you can ", /* @__PURE__ */ React.createElement("a", {
    href: "https://github.com/supermosh/supermosh.github.io/issues",
    target: "_blank",
    rel: "noreferrer noopener"
  }, "open an issue on Github"), ".")))));
};
