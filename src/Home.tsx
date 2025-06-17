import { Link } from "react-router-dom";

import { Icon } from "./components/Icon";

export const Home = () => (
  <main className="Home">
    <video
      crossOrigin="anonymous"
      src="https://supermosh.s3.eu-west-3.amazonaws.com/cover.mp4"
      muted
      autoPlay
      loop
      playsInline
    />
    <header>
      <h1>The first browser-based datamosh editor</h1>
      <p>
        Datamoshing is one of the most sought-after video glitch effect, but
        demands complex technical expertise to achieve.
      </p>
      <p>
        Supermosh brings datamoshing capabilities to everyone through a free
        web-based editor, allowing anyone to glitch their images and videos.
      </p>
      <p className="button-row">
        <Link to="/studio" className="link-button">
          <Icon name="movie" /> Start glitching
        </Link>
        <a href="https://youtu.be/M1OCjF-aJyo" className="link-button">
          <Icon name="info" /> Watch the tutorial
        </a>
      </p>
      <p>
        Made with &lt;3 by <a href="https://ninofiliu.com">Nino Filiu</a>.
      </p>
    </header>
    <div className="faq">
      <video
        crossOrigin="anonymous"
        src="https://supermosh.s3.eu-west-3.amazonaws.com/1.mp4"
        muted
        autoPlay
        loop
        playsInline
      ></video>
      <div className="q">
        <h1>What is datamoshing?</h1>
        <p>
          It's a process in which video compression algorithms like the ones
          used in mp4 files are hacked: by playing frames not in the order they
          are supposed to be played at, we can make the video glitch out.
        </p>
      </div>
      <video
        crossOrigin="anonymous"
        src="https://supermosh.s3.eu-west-3.amazonaws.com/4.mp4"
        muted
        autoPlay
        loop
        playsInline
      ></video>
      <div className="q">
        <h1>How does Supermosh compares to alternatives?</h1>
        <p>There are two traditional datamoshing techniques:</p>
        <p>
          The buggy, technical way: using ffmpeg on the command line to
          pre-process videos, then using avidemux, a 20-year-old software, to
          manually edit video frames
        </p>
        <p>
          The expensive way: pay for overpriced plugins for video editing
          softwares that are already quite pricey
        </p>
        <p>
          Supermosh aims at empowering non-technical artists to glitch out their
          footage by providing a powerful yet free datamosh editor.
        </p>
      </div>
      <video
        crossOrigin="anonymous"
        src="https://supermosh.s3.eu-west-3.amazonaws.com/3.mp4"
        muted
        autoPlay
        loop
        playsInline
      ></video>
      <div className="q">
        <h1>How does Supermosh even works?</h1>
        <p>
          It uses{" "}
          <a href="https://ffmpegwasm.netlify.app/">the web assembly port</a> of{" "}
          <a href="https://www.ffmpeg.org/">ffmpeg</a> to pre-process videos
          (resize, remove key frames), then uses{" "}
          <a href="https://developer.mozilla.org/en-US/docs/Web/API/WebCodecs_API">
            web codecs
          </a>{" "}
          to reconstruct a video based on the timeline defined by the user in
          the Supermosh Studio.
        </p>
      </div>
      <video
        crossOrigin="anonymous"
        src="https://supermosh.s3.eu-west-3.amazonaws.com/5.mp4"
        muted
        autoPlay
        loop
        playsInline
      ></video>
      <div className="q">
        <h1>How free is Supermosh?</h1>
        <p>As free as I could make it:</p>
        <p>There's no account required, and no usage limits.</p>
        <p>
          There's no tracking whatsoever, and computation happens in the
          browser, so footage is not sent to anyone - even me.
        </p>
        <p>
          Obviously, it's{" "}
          <a href="https://github.com/supermosh/supermosh.github.io">
            open source
          </a>
          .
        </p>
        <p>
          Videos are not watermarked and you can do whatever you want with them.
          That being said, I always like when supermoshers send me their
          creations! All my socials and contact links are on{" "}
          <a href="https://ninofiliu.com">my website</a>.
        </p>
      </div>
      <video
        crossOrigin="anonymous"
        src="https://supermosh.s3.eu-west-3.amazonaws.com/2.mp4"
        muted
        autoPlay
        loop
        playsInline
      ></video>
    </div>
  </main>
);
