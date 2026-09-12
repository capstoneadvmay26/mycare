// src/App.jsx
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import SignIn from "./pages/SignIn";
import WelcomeBack from "./pages/WelcomeBack";
import AccountCreated from "./pages/AccountCreated";
import TrialFraming from "./pages/TrialFraming";
import AppShell from "./components/layout/AppShell";
import Medications from "./pages/Medications";
import MedicationWizard from "./pages/MedicationWizard";
import Symptoms from "./pages/Symptoms";
import History from "./pages/History";
import Profiles from "./pages/Profiles";
import Settings from "./pages/Settings";
import { ReminderProvider } from "./context/ReminderContext";
import GlobalReminderOverlay from "./components/layout/GlobalReminderOverlay";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/useApp";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";

import {
  House,
  Capsule,
  HeartPulse,
  ClockHistory,
  People,
  Gear,
} from "react-bootstrap-icons";

const AppWrapper = ({ children }) => {
  const { isDark } = useTheme();
  return (
    <div className={isDark ? "theme-dark" : ""} style={{ height: "100vh" }}>
      {children}
    </div>
  );
};

const AppContent = () => {
  const {
    isOnboarded,
    authScreen,
    onboardingStage,
    currentTab,
    setCurrentTab,
    userName,
  } = useApp();

  const navItems = [
    { id: "Home", label: "Home", icon: <House size={24} /> },
    { id: "Medications", label: "Medications", icon: <Capsule size={24} /> },
    { id: "Symptoms", label: "Symptoms", icon: <HeartPulse size={24} /> },
    { id: "History", label: "History", icon: <ClockHistory size={24} /> },
    { id: "Profiles", label: "Profiles", icon: <People size={24} /> },
    { id: "Settings", label: "Settings", icon: <Gear size={24} /> },
  ];

  const renderScreen = () => {
    switch (currentTab) {
      case "Home": return <Home />;
      case "Medications": return <Medications />;
      case "Symptoms": return <Symptoms />;
      case "History": return <History />;
      case "Profiles": return <Profiles />;
      case "Settings": return <Settings />;
      default: return <Home />;
    }
  };

  // 🚧 Not onboarded — show auth flow
  if (!isOnboarded) {
    if (authScreen === "signin") return <SignIn />;
    if (authScreen === "welcome") return <WelcomeBack />;
    return <Onboarding />; // signup
  }

  // 🎬 Post-signup onboarding stages
  // These run BEFORE the main app shell, only for new users.
  if (onboardingStage === "account-created") {
    return <AccountCreated />;
  }


  // "medication-wizard"
  if (onboardingStage === "medication-wizard") {
  return <MedicationWizard />;
}

// "trial-framing"
if (onboardingStage === "trial") {
  return <TrialFraming />;
}

  // ✅ Onboarded — show main app
  return (
    <AppShell
      navItems={navItems}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userName={userName}
    >
      {renderScreen()}
      <GlobalReminderOverlay />
    </AppShell>
  );
};

const App = () => {
  return (
    <AppProvider>
      <ThemeProvider>
        <ReminderProvider>
          <AppWrapper>
            <ProfileProvider>
              <AppContent />
            </ProfileProvider>
          </AppWrapper>
        </ReminderProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;