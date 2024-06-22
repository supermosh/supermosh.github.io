/* eslint-disable react/jsx-one-expression-per-line */
import React from "react";
import { Link } from "react-router-dom";

export default () => (
  <div className="Home">
    <div className="article">
      <h1>Supermosh: Datamoshing in the browser</h1>
      <p>
        Datamosh is the coolest video effect but it&apos;s currently a pain in
        the ass to achieve: you have to use software from 20 years ago, use the
        command line, and struggle with the complex technicalities of video
        codecs. Either this or pay for expensive datamosh plugins to even more
        expensive video editing tools.
      </p>
      <p>
        The mission of Supermosh is to empower artists to create interesting
        visuals while being restrained by neither the complexity of the
        underlying technology nor the price barrier. As such, Supermosh is:
      </p>
      <p>
        <strong>Simple</strong>: upload your videos, define your effects,
        download your edit. That&apos;s it.
      </p>
      <p>
        <strong>Powerful</strong>: Supermosh allows you to preview your output
        and tweak parameters, unlike traditional datamoshing using Avidemux.
      </p>
      <p>
        <strong>Free</strong>: and I mean, actually free, not free in exchange
        for personal data, an account creation, or anything.
      </p>
      <p>
        That being said, you are encouraged to mention me when posting
        Supermosh-generated visuals! I&apos;m{" "}
        <a
          href="https://ninofiliu.com"
          target="_blank"
          rel="noreferrer noopener"
        >
          Nino Filiu
        </a>
        , I&apos;m on{" "}
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
      <div className="ctas">
        <Link className="cta" to="/studio">
          <img src="/icons/studio.svg" alt="studio icon" /> Start glitching
        </Link>
        <a
          className="cta"
          href="https://youtu.be/4JTZRixhSAM"
          target="_blank"
          rel="noreferrer noopener"
        >
          <img src="/icons/tutorial.svg" alt="tutorial icon" /> Watch tutorial
        </a>
        <Link className="cta" to="/about">
          <img src="/icons/info.svg" alt="info icon" /> Learn more
        </Link>
      </div>
      <p>
        Supermosh is currently in active development. If you spot a bug or have
        a feedback, please message me or{" "}
        <a
          href="https://github.com/supermosh/supermosh.github.io/issues"
          target="_blank"
          rel="noreferrer noopener"
        >
          open an issue
        </a>
        !
      </p>
      <p>
        <a
          href="https://github.com/supermosh/supermosh.github.io"
          target="_blank"
          rel="noreferrer noopener"
        >
          Source Code
        </a>
      </p>
    </div>
    <div className="media">
      {/* @ts-ignore */}
      <video src="/media/bg.webm" muted autoPlay loop loading="lazy" />
    </div>
  </div>
);
