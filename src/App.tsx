import { Link, Route, Routes, useMatch } from "react-router-dom";

import { Icon } from "./components/Icon";
import { Home } from "./Home";
import { Studio } from "./Studio";

export const App = () => {
  const match = useMatch("/studio");
  return (
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
        {match && (
          <a
            href="https://github.com/supermosh/supermosh.github.io/issues"
            className="link-button"
          >
            <Icon name="bug_report" /> Report a bug
          </a>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/studio" element={<Studio />} />
      </Routes>
    </>
  );
};
