// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RegistryProvider } from "./context/RegistryContext";
import App from "./components/App.jsx";
import GraphView from "./components/GraphView.jsx";
import "@xyflow/react/dist/style.css";

import "./App.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RegistryProvider>
      <GraphView />
    </RegistryProvider>
  </StrictMode>
);
