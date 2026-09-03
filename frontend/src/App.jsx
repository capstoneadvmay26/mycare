<<<<<<< Updated upstream
=======
// src/App.jsx
>>>>>>> Stashed changes
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import AppShell from './components/layout/AppShell';
import Medications from './pages/Medications';
import Symptoms from './pages/Symptoms';
import History from './pages/History';
import Profiles from './pages/Profiles';
import Settings from './pages/Settings';
<<<<<<< Updated upstream
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp'; 
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const { isOnboarded, currentTab, setCurrentTab, userName } = useApp();
  
  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings'];
=======

import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ReminderProvider } from './context/ReminderContext';
import GlobalReminderOverlay from './components/layout/GlobalReminderOverlay';

import { House, Capsule, HeartPulse, ClockHistory, People, Gear } from 'react-bootstrap-icons';

const AppWrapper = ({ children }) => {
  const { isDark } = useTheme();

  return (
    <div className={isDark ? 'theme-dark' : ''} style={{ height: '100vh' }}>
      {children}
    </div>
  );
};

const AppContent = () => {
  const { isOnboarded, currentTab, setCurrentTab, userName } = useApp();

  const navItems = [
    { id: 'Home', label: 'Home', icon: <House size={24} /> },
    { id: 'Medications', label: 'Medications', icon: <Capsule size={24} /> },
    { id: 'Symptoms', label: 'Symptoms', icon: <HeartPulse size={24} /> },
    { id: 'History', label: 'History', icon: <ClockHistory size={24} /> },
    { id: 'Profiles', label: 'Profiles', icon: <People size={24} /> },
    { id: 'Settings', label: 'Settings', icon: <Gear size={24} /> },
  ];
>>>>>>> Stashed changes

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <Home />;
      case 'Medications': return <Medications />;
      case 'Symptoms': return <Symptoms />;
      case 'History': return <History />;
      case 'Profiles': return <Profiles />;
      case 'Settings': return <Settings />;
<<<<<<< Updated upstream

=======
>>>>>>> Stashed changes
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
    <ThemeProvider>
      <AppProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;