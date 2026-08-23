import Header from "./Header.jsx";
import BottomNavigation from "./BottomNavigation.jsx";
import Footer from "./Footer.jsx";
//import { useTheme } from "../../context/useTheme.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";




function AppShell({ children }) {
  const { theme, handleThemeToggle } = useTheme();

  

  return (
    <div
      className="mycare-app"
      data-theme={theme}
    >
      <Header
        theme={theme}
        handleThemeToggle={handleThemeToggle}
      />

      <main className="mycare-main">
        {children}
      </main>

      <BottomNavigation />

      <Footer />
    </div>
  );
}

export default AppShell;