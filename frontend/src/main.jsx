// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import "./index.css";

// ------------------------------------------------------------
// Initialize Firebase early — before React mounts
// ------------------------------------------------------------
import { getFirebaseApp } from "./services/firebase";
getFirebaseApp();
console.log("[main] Firebase initialized");

import App from "./App.jsx";

// 🆕 PWA service worker registration happens automatically
// via VitePWA's `injectRegister: 'auto'` setting.
// VitePWA injects a registration script into the built HTML.

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);