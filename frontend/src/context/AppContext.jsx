// src/context/AppContext.jsx
import { createContext, useState, useEffect } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isOnboarded, setIsOnboarded] = useState(() => {
    return localStorage.getItem('mycare_onboarded') === 'true';
  });

  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('mycare_userName') || '';
  });

  const [currentProfile, setCurrentProfile] = useState(() => {
    return localStorage.getItem('mycare_currentProfile') || 'Tolu (Me)';
  });

  const [currentTab, setCurrentTab] = useState('Home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Which auth screen to show when not onboarded:
  //   "signup"  → Onboarding (fresh account)
  //   "signin"  → SignIn (existing account)
  //   "welcome" → WelcomeBack (transition after signin)
  const [authScreen, setAuthScreen] = useState('signup');

  // Transient greeting name for WelcomeBack
  const [welcomeName, setWelcomeName] = useState('');

  // Post-signup onboarding stage:
  //   null                  → normal flow
  //   "account-created"     → success screen
  //   "medication-wizard"   → 4-step guided medication add
  //   "trial"               → trial framing screen
  const [onboardingStage, setOnboardingStage] = useState(() => {
    return localStorage.getItem('mycare_onboarding_stage') || null;
  });

  // ---- Persistence effects ----
  useEffect(() => {
    localStorage.setItem('mycare_onboarded', isOnboarded);
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem('mycare_userName', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('mycare_currentProfile', currentProfile);
  }, [currentProfile]);

  useEffect(() => {
    if (onboardingStage) {
      localStorage.setItem('mycare_onboarding_stage', onboardingStage);
    } else {
      localStorage.removeItem('mycare_onboarding_stage');
    }
  }, [onboardingStage]);

  const handleLogout = () => {
    // Reset in-memory state
    setUserName('');
    setCurrentTab('Home');
    setIsOnboarded(false);
    setIsMenuOpen(false);
    setAuthScreen('signup');
    setWelcomeName('');
    setOnboardingStage(null);
    setCurrentProfile('Tolu (Me)');

    // Clear persisted state
    localStorage.removeItem('mycare_onboarded');
    localStorage.removeItem('mycare_userName');
    localStorage.removeItem('mycare_currentProfile');
    localStorage.removeItem('mycare_currentProfileId'); // 🔥 profile_id
    localStorage.removeItem('mycare_token');
    localStorage.removeItem('mycare_user');
    localStorage.removeItem('mycare_onboarding_stage');
  };

  return (
    <AppContext.Provider
      value={{
        // onboarding / auth flow
        isOnboarded, setIsOnboarded,
        authScreen, setAuthScreen,
        welcomeName, setWelcomeName,
        onboardingStage, setOnboardingStage,

        // user
        userName, setUserName,
        currentProfile, setCurrentProfile,

        // UI
        currentTab, setCurrentTab,
        isMenuOpen, setIsMenuOpen,

        // actions
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};