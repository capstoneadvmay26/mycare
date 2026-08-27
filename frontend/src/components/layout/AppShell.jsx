// src/components/layout/AppShell.jsx
//import { useApp } from '../../context/AppContext.jsx';
import Header from './Header';

import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';
import { useApp } from '../../context/useApp';


const AppShell = ({ children }) => {
  const { currentTab, setCurrentTab, isMenuOpen, setIsMenuOpen, handleLogout, userName, currentProfile } = useApp();

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <DesktopNav currentTab={currentTab} onTabChange={setCurrentTab} />
      <MobileDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        userName={userName} 
        currentTab={currentTab} 
        onTabChange={setCurrentTab} 
        onLogout={handleLogout} 
        currentProfile={currentProfile}
      />
      <main className="flex-grow-1 pb-5 overflow-auto">
        {children}
      </main>
      
    </div>
  );
};

export default AppShell;