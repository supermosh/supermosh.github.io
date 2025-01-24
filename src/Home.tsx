import { Link } from "react-router-dom";

import { Icon } from "./Icon";

export const Home = () => (
  <main className="Home">
    <h1>Supermosh</h1>
    <h2>The first browser-based datamosh maker</h2>
    <p>
      Datamoshing is the most sought-after video glitch effect, yet demands
      complex technical expertise.
    </p>
    <p>
      Supermosh brings this powerful technique to everyone through a free
      web-based editor, allowing anyone to glitch their images and videos.
    </p>
    <p className="button-row">
      <Link to="/studio" className="link-button">
        <Icon name="movie" /> Start glitching
      </Link>
      <a
        href="https://www.youtube.com/watch?v=4JTZRixhSAM"
        className="link-button"
      >
        <Icon name="info" /> Watch the tutorial
      </a>
    </p>
    <p>
      Made with &lt;3 by <a href="https://ninofiliu.com">Nino Filiu</a>.
    </p>
  </main>
);
