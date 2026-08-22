import { NavLink } from "react-router-dom";

/*
  BottomNavigation is designed specifically for
  our mobile-first application experience.

  We use NavLink instead of Link because NavLink
  can tell us which route is currently active.
*/

function BottomNavigation() {
  return (
    <nav className="dosewise-bottom-nav">

      {/* Home */}
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "dosewise-bottom-link active"
            : "dosewise-bottom-link"
        }
      >
        <span className="bottom-nav-icon">🏠</span>
        <span>Home</span>
      </NavLink>


      {/* Medications */}
      <NavLink
        to="/medications"
        className={({ isActive }) =>
          isActive
            ? "dosewise-bottom-link active"
            : "dosewise-bottom-link"
        }
      >
        <span className="bottom-nav-icon">💊</span>
        <span>Meds</span>
      </NavLink>


      {/* Symptoms */}
      <NavLink
        to="/symptoms"
        className={({ isActive }) =>
          isActive
            ? "dosewise-bottom-link active"
            : "dosewise-bottom-link"
        }
      >
        <span className="bottom-nav-icon">🩺</span>
        <span>Symptoms</span>
      </NavLink>


      {/* History */}
      <NavLink
        to="/history"
        className={({ isActive }) =>
          isActive
            ? "dosewise-bottom-link active"
            : "dosewise-bottom-link"
        }
      >
        <span className="bottom-nav-icon">📊</span>
        <span>History</span>
      </NavLink>


      {/* Profile */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive
            ? "dosewise-bottom-link active"
            : "dosewise-bottom-link"
        }
      >
        <span className="bottom-nav-icon">👤</span>
        <span>Profile</span>
      </NavLink>

    </nav>
  );
}

export default BottomNavigation;