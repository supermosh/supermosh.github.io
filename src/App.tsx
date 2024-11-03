import { Link, Route, Routes } from "react-router-dom";

export const App = () => (
  <>
    <ul>
      <li>
        <Link to="/">Home</Link>
      </li>
      <li>
        <Link to="/studio">Studio</Link>
      </li>
      <li>
        <Link to="/about">About</Link>
      </li>
    </ul>
    <Routes>
      <Route path="/" element={<>Home</>} />
      <Route path="/studio" element={<>Studio</>} />
      <Route path="/about" element={<>About</>} />
    </Routes>
  </>
);
