import Header from "./Header.jsx";
import BottomNavigation from "./BottomNavigation.jsx";

/*
  AppShell is the common structure that surrounds
  the main pages of our mobile application.

  Instead of repeating Header and BottomNavigation
  on every page, we keep them here once.
*/

function AppShell({ theme, handleThemeToggle, children }) {
  return (
    <div className="mycare-app" data-theme={theme}>

      {/* Application header */}
      <Header
        theme={theme}
        handleThemeToggle={handleThemeToggle}
      />

      {/* 
        Main content area.

        "children" means:
        Whatever page is placed inside AppShell
        will appear here.
      */}
      <main className="mycare-main">
        {children}
      </main>

      {/* Mobile application navigation */}
      <BottomNavigation />

    </div>
  );
}

export default AppShell;