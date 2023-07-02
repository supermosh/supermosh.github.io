import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              base layout
              <Outlet />
            </>
          }
        >
          <Route index element={<div>index</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
