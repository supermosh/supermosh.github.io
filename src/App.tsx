import { Link, Route, Routes } from "react-router-dom";

import { Icon } from "./components/Icon";
import { Home } from "./Home";
import { V2 } from "./v2/V2";
import { V3 } from "./v3/V3";

export const App = () => {
  return (
    <>
      <nav>
        <Link to="/" className="link-button">
          <Icon name="home" /> <span className="no-mobile">Home</span>
        </Link>
        <Link to="/v3" className="link-button">
          <Icon name="movie" /> <span className="no-mobile">Studio v3</span>
        </Link>
        <Link to="/v2" className="link-button">
          <Icon name="history" /> <span className="no-mobile">Studio v2</span>
        </Link>
        <a
          href="https://github.com/supermosh/supermosh.github.io"
          className="link-button"
        >
          <Icon name="data_object" /> <span className="no-mobile">Github</span>
        </a>
        <a
          href="https://github.com/supermosh/supermosh.github.io/issues"
          className="link-button"
        >
          <Icon name="bug_report" />{" "}
          <span className="no-mobile">Report a bug</span>
        </a>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v2" element={<V2 />} />
        <Route path="/v3" element={<V3 />} />
      </Routes>
    </>
  );
};
