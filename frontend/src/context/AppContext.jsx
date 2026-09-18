// src/context/AppContext.jsx
import { clearFCMToken } from "../services/fcm";
import { createContext, useState, useEffect } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem("mycare_onboarded") === "true";
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem("mycare_userName") || "";
  });


  // In the state declarations, add:
const [user, setUser] = useState(() => {
  try {
    const raw = localStorage.getItem("mycare_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
});




  const [currentProfile, setCurrentProfile] = useState(() => {
    return localStorage.getItem("mycare_currentProfile") || "Tolu (Me)";
  });

  const [currentTab, setCurrentTab] = useState("Home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  

  // 🆕 Which auth screen to show when not onboarded:
  //   - If the user has EVER signed up before → "signin"
  //   - Otherwise → "signup" (Onboarding)
  const [authScreen, setAuthScreen] = useState(() => {
    const hasAccount =
      !!localStorage.getItem("mycare_user") ||
      localStorage.getItem("mycare_hasAccount") === "true";
    return hasAccount ? "signin" : "signup";
  });

  const [welcomeName, setWelcomeName] = useState("");

  const [onboardingStage, setOnboardingStage] = useState(() => {
    return localStorage.getItem("mycare_onboarding_stage") || null;
  });

  // ---- Persistence effects ----
  useEffect(() => {
    localStorage.setItem("mycare_onboarded", isOnboarded);
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem("mycare_userName", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("mycare_currentProfile", currentProfile);
  }, [currentProfile]);

  useEffect(() => {
    if (onboardingStage) {
      localStorage.setItem("mycare_onboarding_stage", onboardingStage);
    } else {
      localStorage.removeItem("mycare_onboarding_stage");
    }
  }, [onboardingStage]);

  // ============================================================
  // 🆕 LOGOUT — reset state, do NOT redirect
  // ============================================================
  const handleLogout = () => {
    // Clean up FCM token in the background
    clearFCMToken().catch((err) =>
      console.warn("[AppContext] FCM cleanup failed:", err.message),
    );


    // Reset in-memory state

    setUser(null);
    setUserName("");
    setCurrentTab("Home");
    setIsOnboarded(false);
    setIsMenuOpen(false);
    // 🆕 After logout, show SignIn (returning user), not Onboarding
    setAuthScreen("signin");
    setWelcomeName("");
    setOnboardingStage(null);
    setCurrentProfile("Tolu (Me)");

    // Clear persisted state — but KEEP the "hasAccount" flag so
    // the next app boot lands on SignIn, not Onboarding.
    localStorage.removeItem("mycare_onboarded");
    localStorage.removeItem("mycare_userName");
    localStorage.removeItem("mycare_currentProfile");
    localStorage.removeItem("mycare_currentProfileId");
    localStorage.removeItem("mycare_token");
    localStorage.removeItem("mycare_user");
    localStorage.removeItem("mycare_onboarding_stage");

    // Mark that this user has an account, so SignIn is shown
    localStorage.setItem("mycare_hasAccount", "true");
  };

  return (
    <AppContext.Provider
      value={{
        // onboarding / auth flow
        isOnboarded,
        setIsOnboarded,
        authScreen,
        setAuthScreen,
        welcomeName,
        setWelcomeName,
        onboardingStage,
        setOnboardingStage,

        // user
        user, 
        setUser,
        userName,
        setUserName,
        currentProfile,
        setCurrentProfile,

        // UI
        currentTab,
        setCurrentTab,
        isMenuOpen,
        setIsMenuOpen,

        // actions
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
