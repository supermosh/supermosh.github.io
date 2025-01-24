import { Link, Route, Routes } from "react-router-dom";

import { Home } from "./Home";
import { Icon } from "./Icon";
import { Studio } from "./Studio";

export const App = () => (
  <>
    <nav>
      <Link to="/" className="link-button">
        <Icon name="home" /> Home
      </Link>
      <Link to="/studio" className="link-button">
        <Icon name="movie" /> Studio
      </Link>
      <a
        href="https://github.com/supermosh/supermosh.github.io"
        className="link-button"
      >
        <Icon name="data_object" /> Github
      </a>
    </nav>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/studio" element={<Studio />} />
    </Routes>
  </>
);
