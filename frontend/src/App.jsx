import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";

import AppShell from "./components/layout/AppShell";

import Dashboard from "./pages/Dashboard";
import Medications from "./pages/Medications";
import Symptoms from "./pages/Symptoms";
import History from "./pages/History";
import Profile from "./pages/Profile";

function App() {
  // Initialize state with stored theme or default to light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("mycare-theme") || "light";
  });

  // Function to switch between light and dark modes
  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Save selection so it persists on page refresh
  useEffect(() => {
    localStorage.setItem("mycare-theme", theme);
  }, [theme]);

  return (
    <AppShell theme={theme} handleThemeToggle={handleThemeToggle}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medications" element={<Medications />} />
        <Route path="/symptoms" element={<Symptoms />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AppShell>
  );
}

export default App;