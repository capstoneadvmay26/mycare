import { useState } from "react";

import { Link } from "react-router-dom";

function Header({ theme, handleThemeToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen((previousState) => !previousState);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <header className="dosewise-header">
      <div className="container">
        <div className="dosewise-navbar">
          {/* =====================================
              BRAND
          ====================================== */}

          <div className="dosewise-brand">
            <span className="dosewise-logo">💊</span>

            <span className="dosewise-name">DoseWise</span>
          </div>

          {/* =====================================
              DESKTOP NAVIGATION
          ====================================== */}

          <nav className="dosewise-desktop-nav">
            <Link to="/dashboard" className="dosewise-nav-link">
              Dashboard
            </Link>

            <Link to="/medications" className="dosewise-nav-link">
              Medications
            </Link>
            <Link to="/symptoms" className="dosewise-nav-link">
              Symptoms
            </Link>

            <Link to="/profile" className="dosewise-nav-link">
              Profile
            </Link>
          </nav>

          {/* =====================================
              ACTIONS
          ====================================== */}

          <div className="dosewise-header-actions">
            {/* Theme Toggle */}

            <button
              type="button"
              className="dosewise-theme-toggle"
              onClick={handleThemeToggle}
              aria-label="Toggle colour theme"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* Hamburger */}

            <button
              type="button"
              className="dosewise-menu-toggle"
              onClick={handleMenuToggle}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* =====================================
            MOBILE NAVIGATION
        ====================================== */}

        {menuOpen && (
          <nav className="dosewise-mobile-nav">
            <Link
              to="/dashboard"
              className="dosewise-mobile-link"
              onClick={handleMenuClose}
            >
              Dashboard
            </Link>

            <Link to="/medications/add" className="btn btn-primary">
              + Add Medication
            </Link>

            <Link
              to="/symptoms"
              className="dosewise-mobile-link"
              onClick={handleMenuClose}
            >
              Symptoms
            </Link>

            <Link
              to="/profile"
              className="dosewise-mobile-link"
              onClick={handleMenuClose}
            >
              Profile
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;
