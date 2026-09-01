import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import AppShell from './components/layout/AppShell';
import Medications from './pages/Medications';
import Symptoms from './pages/Symptoms';
import History from './pages/History';
import Profiles from './pages/Profiles';
import Settings from './pages/Settings';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp'; 
import { ProfileProvider } from './context/ProfileContext';
import { ThemeProvider } from './context/ThemeContext';

const AppContent = () => {
  const { isOnboarded, currentTab, setCurrentTab, userName } = useApp();
  
  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings'];

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <Home />;
      case 'Medications': return <Medications />;
      case 'Symptoms': return <Symptoms />;
      case 'History': return <History />;
      case 'Profiles': return <Profiles />;
      case 'Settings': return <Settings />;

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