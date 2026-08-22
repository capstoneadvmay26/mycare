import { useState } from "react";
import { Link } from "react-router-dom";
//import logo from "../assets/images/mycare-logo.png";

function Header({ theme, handleThemeToggle }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen((previousState) => !previousState);
  };

  const handleMenuClose = () => {
    setMenuOpen(false);
  };

  return (
    <header className="mycare-header">
      <div className="container">
        <div className="mycare-navbar">
          {/* Left Section: Mobile Menu Button + Brand Logo Image */}
          <div className="mycare-header-left">
            <button
              type="button"
              className="mycare-menu-toggle"
              onClick={handleMenuToggle}
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? "✕" : "☰"}
            </button>

            <Link to="/" className="mycare-brand" onClick={handleMenuClose}>
              <img
                src="/images/mycare-logo-transparent.png"
                alt="MyCare Logo"
                className="mycare-logo"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="mycare-desktop-nav">
            <Link to="/dashboard" className="mycare-nav-link">
              Dashboard
            </Link>
            <Link to="/medications" className="mycare-nav-link">
              Medications
            </Link>
            <Link to="/symptoms" className="mycare-nav-link">
              Symptoms
            </Link>
            <Link to="/profile" className="mycare-nav-link">
              Profile
            </Link>
          </nav>

          {/* Actions */}
          <div className="mycare-header-actions">
            <button
              type="button"
              className="mycare-theme-toggle"
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
          <nav className="mycare-mobile-nav">
            <Link
              to="/dashboard"
              className="mycare-mobile-link"
              onClick={handleMenuClose}
            >
              Dashboard
            </Link>
            <Link
              to="/medications"
              className="mycare-mobile-link"
              onClick={handleMenuClose}
            >
              Medications
            </Link>
            <Link
              to="/symptoms"
              className="mycare-mobile-link"
              onClick={handleMenuClose}
            >
              Symptoms
            </Link>
            <Link
              to="/profile"
              className="mycare-mobile-link"
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
