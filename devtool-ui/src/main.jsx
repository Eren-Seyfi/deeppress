// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RegistryProvider } from "./context/RegistryContext";
import { ThemeProvider } from "./context/ThemeContext";

import GraphView from "./views/GraphView";

import "@xyflow/react/dist/style.css";
import "./main.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RegistryProvider>
      <ThemeProvider>
        <GraphView />
      </ThemeProvider>
    </RegistryProvider>
  </StrictMode>
);
