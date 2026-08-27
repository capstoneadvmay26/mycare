import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';

//import { AppProvider, useApp } from './context/AppContext';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Placeholder from './pages/Placeholder';
import AppShell from './components/layout/AppShell';

const AppContent = () => {
  const { isOnboarded, currentTab } = useApp();

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <Home />; // <--- NO userName prop passed here!
      case 'Medications': return <Placeholder title="Medications" />;
      case 'Symptoms': return <Placeholder title="Symptoms" />;
      case 'History': return <Placeholder title="History" />;
      case 'Profiles': return <Placeholder title="Profiles" />;
      case 'Settings': return <Placeholder title="Settings" />;
      case 'Help & Support': return <Placeholder title="Help & Support" />;
      default: return <Home />;
    }
  };

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <AppShell>
      {renderScreen()}
    </AppShell>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;