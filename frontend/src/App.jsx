import { useState } from 'react';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Placeholder from './pages/Placeholder';
import AppShell from './components/layout/AppShell';

const App = () => {
  const [isOnboarded, setIsOnboarded] = useState(false); 
  const [userName, setUserName] = useState('');
  const [currentTab, setCurrentTab] = useState('Home'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home': return <Home userName={userName} />;
      case 'Medications': return <Placeholder title="Medications" />;
      case 'Symptoms': return <Placeholder title="Symptoms" />;
      case 'History': return <Placeholder title="History" />;
      case 'Profiles': return <Placeholder title="Profiles" />;
      case 'Settings': return <Placeholder title="Settings" />;
      case 'Help & Support': return <Placeholder title="Help & Support" />;
      default: return <Home userName={userName} />;
    }
  };

  const handleLogout = () => {
    setUserName('');
    setCurrentTab('Home');
    setIsOnboarded(false);
    setIsMenuOpen(false);
  };

  if (!isOnboarded) {
    return <Onboarding onComplete={() => setIsOnboarded(true)} setUserName={setUserName} />;
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <AppShell 
        userName={userName}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isMenuOpen={isMenuOpen}
        onMenuClick={() => setIsMenuOpen(true)}
        onMenuClose={() => setIsMenuOpen(false)}
        onLogout={handleLogout}
      >
        {renderScreen()}
      </AppShell>
    </div>
  );
};

export default App;