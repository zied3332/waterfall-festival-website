import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { WebsiteSettingsProvider } from "./context/WebsiteSettingsContext";

import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    <WebsiteSettingsProvider>
      <App />
    </WebsiteSettingsProvider>
  </StrictMode>,
);