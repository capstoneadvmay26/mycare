import Header from './Header';
import BottomNav from './BottomNav';
import DesktopNav from './DesktopNav';
import MobileDrawer from './MobileDrawer';

const AppShell = ({ children, userName, currentTab, onTabChange, isMenuOpen, onMenuClick, onMenuClose, onLogout }) => {
  return (
    <div className="d-flex flex-column vh-100 bg-light">
      <Header onMenuClick={onMenuClick} />
      <DesktopNav currentTab={currentTab} onTabChange={onTabChange} />
      <MobileDrawer 
        isOpen={isMenuOpen} 
        onClose={onMenuClose} 
        userName={userName} 
        currentTab={currentTab} 
        onTabChange={onTabChange} 
        onLogout={onLogout} 
      />
      <main className="flex-grow-1 pb-5 overflow-auto">
        {children}
      </main>
      <BottomNav currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

export default AppShell;