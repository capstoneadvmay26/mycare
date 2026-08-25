import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

// If you want a global CSS file, put it here. 
// (For now, we are using inline styles from the Figma, so this can be empty or just resets)
import "./styles/mycare.css"; 

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);