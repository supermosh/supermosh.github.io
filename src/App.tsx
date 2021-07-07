import React from 'react';

export default () => (
  <div className="App">
    <nav>
      <a href="/"><img src="/icons/home.svg" alt="home icon" /></a>
      <a href="/studio"><img src="/icons/studio.svg" alt="studio icon" /></a>
      <a href="/about"><img src="/icons/info.svg" alt="info icon" /></a>
    </nav>
    <div className="content">
      <div className="article">
        <h1>Supermosh: Datamoshing in the browser</h1>
        <p>Datamosh is the coolest video effect but it&apos;s currently a pain in the ass to achieve: you have to use software from 20 years ago, use the command line, and struggle with the complex technicalities of video codecs. Either this or pay for expensive datamosh plugins to even more expensive video editing tools.</p>
        <p>The mission of Supermosh is to empower artists to create interesting visuals while being restrained by neither the complexity of the underlying technology nor the price barrier. As such, Supermosh is:</p>
        <p>
          <strong>Simple</strong>
          : upload your videos, define your effects, download your edit. That&apos;s it.
        </p>
        <p>
          <strong>Free</strong>
          : and I mean, actually free, not free in exchange for personal data, an account creation, or anything.
        </p>
        <p>
          <strong>Powerful</strong>
          : Supermosh allows you to preview your output, unlike traditional datamoshing using Avidemux
        </p>
        <div className="ctas">
          <a className="cta" href="/studio">
            <img src="/icons/studio.svg" alt="studio icon" />
            {' '}
            Start glitching
          </a>
          <a className="cta" href="/about">
            <img src="/icons/info.svg" alt="info icon" />
            {' '}
            Learn more
          </a>
        </div>
        <p>Supermosh is currently in active development. If you spot a bug or have a feedback, please message me!</p>
        <p>
          A project by
          {' '}
          <a href="https://ninofiliu.com" target="_blank" rel="noreferrer noopener">Nino Filiu</a>
          {' '}
          -
          {' '}
          <a href="https://www.instagram.com/ssttaacckkyy/" target="_blank" rel="noreferrer noopener">Instagram</a>
          {' '}
          /
          {' '}
          <a href="https://twitter.com/ninofiliu" target="_blank" rel="noreferrer noopener">Twitter</a>
          {' '}
          /
          {' '}
          <a href="https://github.com/supermosh/supermosh.github.io" target="_blank" rel="noreferrer noopener">Source Code</a>
        </p>
      </div>
      <div className="media">
        <video src="/media/bg.webm" muted autoPlay loop loading="lazy" />
      </div>
    </div>
  </div>
);
