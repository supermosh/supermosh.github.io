import { createRoot } from "react-dom/client";
import "./track";
import App from "./App";
import { setup } from "./db";

(async () => {
  await setup();
  createRoot(document.querySelector("#root")!).render(<App />);
})();
