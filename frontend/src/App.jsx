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
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ReminderProvider } from "./context/ReminderContext";
import GlobalReminderOverlay from "./components/layout/GlobalReminderOverlay";
import { AppProvider } from "./context/AppContext";
import { useApp } from "./context/useApp";
import { ProfileProvider } from "./context/ProfileContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { useFCM } from "./hooks/useFCM";
import { useEffect } from "react";
import { primeAudio } from "./services/audioUnlock";
import ConsultBrief from "./pages/ConsultBrief";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import IdleWarningModal from "./components/layout/IdleWarningModal";
import useIdleLogout from "./hooks/useIdleLogout";

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
    setAuthScreen,
    onboardingStage,
    currentTab,
    setCurrentTab,
    userName,
    handleLogout,
  } = useApp();

  useEffect(() => {
    primeAudio();
  }, []);

  // 🆕 Handle password-reset deep-link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasResetToken =
      params.has("token") &&
      window.location.pathname.includes("reset-password");
    if (hasResetToken && !isOnboarded) {
      setAuthScreen("reset-password");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 🆕 Idle auto-logout — 30 min of inactivity triggers logout
  /*
  const { isWarningVisible, resetTimer } = useIdleLogout({
    onLogout: handleLogout,
    onWarning: () => {
      console.log("[Idle] Warning shown — user inactive for 29 min");
    },
    onActivity: () => {
      console.log("[Idle] User active again — warning dismissed");
    },
    timeoutMs: 30 * 60 * 1000, // 30 min
    warningMs: 60 * 1000, // 60 s warning
    enabled: isOnboarded, // only when signed in
  });
*/

   // 🆕 Idle auto-logout — 30 min of inactivity triggers logout
  const { isWarningVisible, resetTimer } = useIdleLogout({
    onLogout: handleLogout,
    onWarning: () => {
      console.log("[Idle] Warning shown — user inactive for 29 min");
    },
    onActivity: () => {
      console.log("[Idle] User active again — warning dismissed");
    },
    timeoutMs: 60 * 1000, // 60s
    warningMs: 20 * 1000, // 20s warning
    enabled: isOnboarded, // only when signed in
  });


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
      case "ConsultBrief":
        return <ConsultBrief />;
      case "PrivacyPolicy":
        return <PrivacyPolicy />;
      default:
        return <Home />;
    }
  };

  // Not onboarded — auth flow
  if (!isOnboarded) {
    if (authScreen === "signin") return <SignIn />;
    if (authScreen === "welcome") return <WelcomeBack />;
    if (authScreen === "forgot") return <ForgotPassword />;
    if (authScreen === "reset-password") return <ResetPassword />;
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
      {isWarningVisible && (
        <IdleWarningModal
          onStaySignedIn={resetTimer}
          onLogoutNow={handleLogout}
        />
      )}
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
