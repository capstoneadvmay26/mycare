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
          {/* Left Section: Mobile Menu Button + Brand Logo */}
          <div className="dosewise-header-left">
            <button
              type="button"
              className="dosewise-menu-toggle"
              onClick={handleMenuToggle}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            <Link to="/" className="dosewise-brand" onClick={handleMenuClose}>
              <span className="dosewise-logo">💊</span>
              <span className="dosewise-name">DoseWise</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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

          {/* Actions */}
          <div className="dosewise-header-actions">
            <button
              type="button"
              className="dosewise-theme-toggle"
              onClick={handleThemeToggle}
              aria-label="Toggle colour theme"
              title="Toggle theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <nav className="dosewise-mobile-nav">
            <Link
              to="/dashboard"
              className="dosewise-mobile-link"
              onClick={handleMenuClose}
            >
              Dashboard
            </Link>
            <Link
              to="/medications"
              className="dosewise-mobile-link"
              onClick={handleMenuClose}
            >
              Medications
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