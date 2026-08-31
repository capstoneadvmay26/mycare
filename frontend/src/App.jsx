//import { useState } from 'react';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Placeholder from './pages/Placeholder';
import AppShell from './components/layout/AppShell';
import Symptoms from './pages/Symptoms';
import Medications from './pages/Medications';
import History from './pages/History';
import Profiles from './pages/Profiles';

// Fixed: useApp is imported from useApp.js, not AppContext.jsx!
import { AppProvider } from './context/AppContext';
import { ProfileProvider } from './context/ProfileContext';
import { useApp } from './context/useApp';

const AppContent = () => {
  const { isOnboarded, currentTab, setCurrentTab, userName } = useApp();

  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings', 'Help & Support'];

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <Home />;
      case 'Medications': return <Medications />;
      case 'Symptoms': return <Symptoms />;
      case 'History': return <History />;
      case 'Profiles': return <Profiles />;
      case 'Settings': return <Placeholder title="Settings" />;
      case 'Help & Support': return <Placeholder title="Help & Support" />;
      default: return <Home />;
    }
  };

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <AppShell 
      navItems={navItems}
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      userName={userName}
    >
      {renderScreen()}
    </AppShell>
  );
};

const App = () => {
  return (
  <AppProvider>        {/* AppProvider stays on the outside */}
    <ProfileProvider>  {/* ProfileProvider goes inside */}
      {/* AppShell and page content goes here */}
      <AppContent />
    </ProfileProvider>
  </AppProvider>
);
};

export default App;