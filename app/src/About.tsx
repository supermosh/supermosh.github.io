/* eslint-disable react/jsx-one-expression-per-line */
import React, { useState } from "react";
import { Link } from "react-router-dom";

export default () => {
  const [expanded, setExpanded] = useState<number>(-1);

  return (
    <div className="About">
      <div className="article">
        <h1>About Supermosh</h1>

        <div>Made with &lt;3 by Nino Filiu</div>
        <div>
          <a
            href="https://ninofiliu.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            ninofiliu.com
          </a>
        </div>
        <div>
          <a
            href="https://www.instagram.com/ssttaacckkyy/"
            target="_blank"
            rel="noreferrer noopener"
          >
            instagram.com/ssttaacckkyy
          </a>
        </div>
        <div>
          <a
            href="https://twitter.com/ninofiliu"
            target="_blank"
            rel="noreferrer noopener"
          >
            twitter.com/ninofiliu
          </a>
        </div>
        <div>
          <a
            href="mailto:nino.filiu@gmail.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            nino.filiu@gmail.com
          </a>
        </div>
        <div>
          <a
            href="https://github.com/supermosh/supermosh.github.io"
            target="_blank"
            rel="noreferrer noopener"
          >
            Source code
          </a>
        </div>

        <section className={expanded === 0 ? "--expanded" : ""}>
          <h2
            onClick={() => setExpanded(expanded === 0 ? -1 : 0)}
            role="button"
          >
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;Is Supermosh free?
          </h2>
          <div className="section-content">
            <p>Yes.</p>
            <p>
              Supermosh is completely free. Just go to{" "}
              <Link to="/studio">the studio</Link> and start glitching.
            </p>
            <p>
              There is no hidden cost. You will not have to create an account.
              Your personal data will not be harvested. Supermosh will not use
              your computer to mine bitcoins in the background. Nothing.
            </p>
            <p>
              By coding Supermosh, I want to experiment, do something that has
              never been done before, and enable artists to get creative. I do
              not care about the money.
            </p>
            <p>
              That being said, you are encouraged to mention me when posting
              Supermosh-generated visuals! I&apos;m on{" "}
              <a
                href="https://www.instagram.com/ssttaacckkyy/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Instagram
              </a>{" "}
              and{" "}
              <a
                href="https://twitter.com/ninofiliu"
                target="_blank"
                rel="noreferrer noopener"
              >
                Twitter
              </a>
              .
            </p>
          </div>
        </section>

        <section className={expanded === 1 ? "--expanded" : ""}>
          <h2 onClick={() => setExpanded(expanded === 1 ? -1 : 1)}>
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;What is datamoshing?
          </h2>
          <div className="section-content">
            <p>
              Datamoshing is a category of special effects based on the
              deletion, repetition, and reordering or compressed video frames.
              There is no simpler way to put this, but if you are looking for
              technical details, here it goes:
            </p>
            <p>
              The naïve way to encode a video would be to store on disk one
              image for every single frame of the video, but that would take a
              lot of disk space. Most videos are not random: often the current
              frame does not update a lot of pixels from the previous frame, we
              can just encode the movement and the color shift from the previous
              frame. Moreover we can often get away with describing only a
              fraction of the frames, and just say that whatever happens in
              between is a mix of what happens before and after.
            </p>
            <p>
              So most compression algorithms take advantage of these possible
              simplifications by encoding a video into a series of compressed
              frames that can be of three types:
            </p>
            <ul>
              <li>
                Intra frames, or I-frames: naïve copy of the uncompressed frame
              </li>
              <li>
                Predicted frames, or P-frames: approximation of the current
                uncompressed frame based on the movement and color shift from
                some previous frame
              </li>
              <li>
                Bidirectional frames, or B-frames: approximation of the current
                uncompressed frame based on a mix between some previous and
                future frame
              </li>
            </ul>
            <p>
              So for example, the video of a ball falling on the ground would be
              compressed as such:
            </p>
            <ol>
              <li>i-frame: picture of the ball</li>
              <li>b-frame: 75% frame 1, 25% frame 5</li>
              <li>b-frame: 50% frame 1, 50% frame 5</li>
              <li>b-frame: 25% frame 1, 75% frame 5</li>
              <li>p-frame: frame 1 but the ball is 5 pixels lower</li>
              <li>b-frame: 75% frame 5, 25% frame 9</li>
              <li>b-frame: 50% frame 5, 50% frame 9</li>
              <li>b-frame: 25% frame 5, 75% frame 9</li>
              <li>p-frame: frame 5 but the ball is 10 pixels lower</li>
              <li>...</li>
            </ol>
            <p>
              I-frames are heavy but P-frames takes less bits to describe and
              B-frames take almost no disk space, so by having only a few
              I-frames, some P-frames, and as much B-frames as possible, the
              video is compressed. Let&apos;s forget about B-frames though,
              because they only complicate the understanding, but they often
              come up, so bear them in mind.
            </p>
            <p>
              Now what happens when we delete, re-order, or repeat some frames
              where they&apos;re not supposed to be? Datamosh, that&apos;s what
              happens.
            </p>
          </div>
        </section>

        <section className={expanded === 2 ? "--expanded" : ""}>
          <h2
            onClick={() => setExpanded(expanded === 2 ? -1 : 2)}
            role="button"
          >
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;What are typical datamosh effects?
          </h2>
          <div className="section-content">
            <p>
              <strong>Glide</strong>: one P-frame is copied several times
              instead of appearing just once, thus repeating a movement over and
              over
            </p>
            <p>
              <strong>Movement</strong>: an I-frame is deleted, making the
              P-frames afterward apply to the first part of the video, thus
              applying the movement of the second part to the image of the first
              part
            </p>
          </div>
        </section>

        <section className={expanded === 3 ? "--expanded" : ""}>
          <h2
            onClick={() => setExpanded(expanded === 3 ? -1 : 3)}
            role="button"
          >
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;How is datamosh typically done?
          </h2>
          <div className="section-content">
            <p>
              You can use existing software taylored for datamoshing but they
              are expensive. After Effects starts at $21/mo and the only
              datamoshing plugin available there costs $40.
            </p>
            <p>
              But you can do it manually, which is more interesting but also
              much more complex. First you have to convert your video to a codec
              where datamoshing is possible, typically using a command line tool
              like{" "}
              <a
                href="https://ffmpeg.org/"
                target="_blank"
                rel="noreferrer noopener"
              >
                ffmpeg
              </a>
              , because web-based conversions are rate-limited, malware-prone,
              and not tweakable enough.
            </p>
            <p>
              Then you would use{" "}
              <a
                href="http://avidemux.sourceforge.net/"
                target="_blank"
                rel="noreferrer noopener"
              >
                Avidemux
              </a>
              , a software from the early 2000s. You <em>have to use</em> a
              software this old and broken, since modern software fixes your
              glitches... which is not what you want! Avidemux allows you to do
              frame-by-frame manipulation, but as soon as you start doing weird
              stuff, the preview window breaks. You have to export your video
              everytime in order to preview them.
            </p>
            <p>
              That is pretty much it but this journey is painful, expecially the
              part when you have to specify codec configurations to ffmpeg,
              because, besides the fact that ffmpeg is a pain in the ass to
              configure, that is when you really have to have precise technical
              knowledge on how compression algorithms work.
            </p>
          </div>
        </section>

        <section className={expanded === 4 ? "--expanded" : ""}>
          <h2
            onClick={() => setExpanded(expanded === 4 ? -1 : 4)}
            role="button"
          >
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;I have found a bug, what should I do?
          </h2>
          <div className="section-content">
            <p>
              Supermosh is under active development in an experimental area of
              web technologies. There will be bugs, I know. If you found one,
              please report it!
            </p>
            <p>
              You can contact me directly, or if you prefer you can{" "}
              <a
                href="https://github.com/supermosh/supermosh.github.io/issues"
                target="_blank"
                rel="noreferrer noopener"
              >
                open an issue on Github
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
