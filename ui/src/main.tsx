import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// import { ChainlitAPI, ChainlitContext } from "@chainlit/react-client";
// import { RecoilRoot } from "recoil";

// const apiClient = new ChainlitAPI(import.meta.env.VITE_CHAINLIT_URL, "webapp");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* <ChainlitContext.Provider value={apiClient}>
      <RecoilRoot> */}
    <App />
    {/* </RecoilRoot>
    </ChainlitContext.Provider> */}
  </StrictMode>
);
