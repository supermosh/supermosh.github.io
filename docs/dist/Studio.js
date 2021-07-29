import React, {useEffect, useRef, useState} from "../_snowpack/pkg/react.js";
import mixpanel from "../_snowpack/pkg/mixpanel-browser.js";
import Videos from "./Videos.js";
import Segments from "./Segments.js";
import Render from "./Render.js";
import Result from "./Result.js";
import {filesStore, segmentsStore} from "./db.js";
import savedFileToVideo from "./savedFileToVideo.js";
export default () => {
  const [videos, setVideos] = useState([]);
  const [segments, setSegments] = useState([]);
  const [output, setOutput] = useState(null);
  const first = useRef(true);
  useEffect(() => {
    (async () => {
      const savedFiles = await filesStore.getAll();
      if (savedFiles.length && window.confirm("Restore previous work?")) {
        mixpanel.track("restored previous work");
        const savedVideos = await Promise.all(savedFiles.map(savedFileToVideo));
        setVideos(savedVideos);
        const savedSegments = await segmentsStore.getAll();
        for (const segment of savedSegments) {
          segment.src = savedVideos.find((video) => video.key === segment.savedFileKey).src;
          delete segment.savedFileKey;
        }
        setSegments(savedSegments);
      } else {
        if (savedFiles.length) {
          mixpanel.track("ignored previous work restored");
        }
        await Promise.all([
          filesStore.clear(),
          segmentsStore.clear()
        ]);
      }
    })();
  }, []);
  useEffect(() => {
    (async () => {
      if (first.current) {
        first.current = false;
        return;
      }
      const savedSegments = segments.map((segment) => ({
        ...segment,
        savedFileKey: videos.find((video) => video.src === segment.src).key
      }));
      await segmentsStore.save(savedSegments);
    })();
  }, [segments]);
  useEffect(() => mixpanel.track("update videos", {dimensions: videos.map((video) => ({width: video.width, height: video.height}))}), [videos]);
  useEffect(() => mixpanel.track("update segments", {segments}), [segments]);
  return /* @__PURE__ */ React.createElement("div", {
    className: "Studio"
  }, /* @__PURE__ */ React.createElement(Videos, {
    ...{videos, setVideos, segments, setSegments}
  }), /* @__PURE__ */ React.createElement(Segments, {
    ...{videos, segments, setSegments}
  }), /* @__PURE__ */ React.createElement(Render, {
    ...{segments, setOutput}
  }), /* @__PURE__ */ React.createElement(Result, {
    ...{output}
  }));
};
