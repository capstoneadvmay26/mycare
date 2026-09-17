// src/App.jsx
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import SignIn from "./pages/SignIn";
import WelcomeBack from "./pages/WelcomeBack";
import AccountCreated from "./pages/AccountCreated";
import MedicationWizard from "./pages/MedicationWizard";
import TrialFraming from "./pages/TrialFraming";
import MedicationHistory from "./pages/MedicationHistory";
import LogSymptom from "./pages/LogSymptom";
import SymptomHistory from "./pages/SymptomHistory";
import CheckIn from "./pages/CheckIn";
import DoctorNudge from "./pages/DoctorNudge";
import Notifications from "./pages/Notifications";
import AppShell from "./components/layout/AppShell";
import Medications from "./pages/Medications";
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
import { useFCM } from "./hooks/useFCM";
import { useEffect } from "react";
import { primeAudio } from "./services/audioUnlock";

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

  useEffect(() => {
    primeAudio();
  }, []);


  
  // 🆕 Mount FCM hook — handles token + foreground messages
  useFCM();

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
      case "Home":
        return <Home />;
      case "Medications":
        return <Medications />;
      case "Symptoms":
        return <Symptoms />;
      case "History":
        return <History />;
      case "Profiles":
        return <Profiles />;
      case "Settings":
        return <Settings />;
      case "MedicationHistory":
        return <MedicationHistory />;
      case "LogSymptom":
        return <LogSymptom />;
      case "SymptomHistory":
        return <SymptomHistory />;
      case "CheckIn":
        return <CheckIn />;
      case "DoctorNudge":
        return <DoctorNudge />;
      case "Notifications":
        return <Notifications />;
      default:
        return <Home />;
    }
  };

  // Not onboarded — auth flow
  if (!isOnboarded) {
    if (authScreen === "signin") return <SignIn />;
    if (authScreen === "welcome") return <WelcomeBack />;
    return <Onboarding />;
  }

  // Post-signup onboarding stages
  if (onboardingStage === "account-created") return <AccountCreated />;
  if (onboardingStage === "medication-wizard") return <MedicationWizard />;
  if (onboardingStage === "trial") return <TrialFraming />;

  // Fully onboarded — main app
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
