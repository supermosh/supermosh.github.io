import React, { useState } from 'react';

export default () => {
  const [expanded, setExpanded] = useState<number>(-1);

  return (
    <div className="About">
      <div className="article">

        <h1>About Supermosh</h1>

        <section className={expanded === 0 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 0 ? -1 : 0)}>
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;What is datamoshing?
          </h2>
          <div className="section-content">
            <p>Datamoshing is a category of special effects based on the deletion, repetition, and reordering or compressed video frames.</p>
            <p>The naïve way to encode a video would be to store on disk one image for every single frame of the video, but that would take a lot of disk space. Most videos are not random: often the current frame does not update a lot of pixels from the previous frame, we can just encode the movement and the color shift from the previous frame. Moreover we can often get away with describing only a fraction of the frames, and just say that whatever happens in between is a mix of what happens before and after.</p>
            <p>So most compression algorithms take advantage of these possible simplifications by encoding a video into a series of compressed frames that can be of three types:</p>
            <ul>
              <li>Intra frames, or I-frames: naïve copy of the uncompressed frame</li>
              <li>Predicted frames, or P-frames: approximation of the current uncompressed frame based on the movement and color shift from some previous frame</li>
              <li>Bidirectional frames, or B-frames: approximation of the current uncompressed frame based on a mix between some previous and future frame</li>
            </ul>
            <p>So for example, the video of a ball falling on the ground would be compressed as such:</p>
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
            <p>I-frames are heavy but P-frames takes less bits to describe and B-frames take almost no disk space, so by having only a few I-frames, some P-frames, and as much B-frames as possible, the video is compressed. Let&apos;s forget about B-frames though, because they only complicate the understanding, but they often come up, so bear them in mind.</p>
            <p>Now what happens when we delete, re-order, or repeat some frames where they&apos;re not supposed to be? Datamosh, that&apos;s what happens.</p>
          </div>
        </section>

        <section className={expanded === 1 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 1 ? -1 : 1)} role="button">
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;What are typical datamosh effects?
          </h2>
          <div className="section-content">
            <p />
          </div>
        </section>

        <section className={expanded === 2 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 2 ? -1 : 2)} role="button">
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;How is datamosh typically done?
          </h2>
          <div className="section-content">
            <p />
          </div>
        </section>

        <section className={expanded === 3 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 3 ? -1 : 3)} role="button">
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;Is Supermosh free?
          </h2>
          <div className="section-content">
            <p />
          </div>
        </section>

        <section className={expanded === 3 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 4 ? -1 : 4)} role="button">
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;I have found a bug, what should I do?
          </h2>
          <div className="section-content">
            <p />
          </div>
        </section>

        <section className={expanded === 3 ? '--expanded' : ''}>
          <h2 onClick={() => setExpanded(expanded === 4 ? -1 : 4)} role="button">
            <span className="plus">[+]</span>
            <span className="minus">[-]</span>
            &nbsp;Who is behind Supermosh?
          </h2>
          <div className="section-content">
            <p />
          </div>
        </section>

      </div>
    </div>
  );
};
