import { List, X, BoxArrowRight } from 'react-bootstrap-icons';
import { useApp } from '../../context/useApp';
import { useTheme } from '../../context/ThemeContext';
import NotificationCenter from './NotificationCenter';
import Logo from '../ui/Logo';

const AppShell = ({ children, navItems, currentTab, setCurrentTab }) => {
  const { isMenuOpen, setIsMenuOpen, handleLogout } = useApp();
  const { isDark } = useTheme();

  // SAFE HELPER: Handle both strings and objects
  const getKey = (item, index) => (typeof item === 'string' ? item : item.id || index);
  const getLabel = (item) => (typeof item === 'string' ? item : item.label);
  const getIcon = (item) => (typeof item === 'string' ? null : item.icon);

  return (
    <div className={`d-flex flex-column h-100 ${isDark ? 'bg-dark text-white' : 'bg-white text-dark'}`}>
      
      {/* Header Bar */}
      <header className={`d-flex align-items-center justify-content-between px-3 px-md-4 py-2 border-bottom ${isDark ? 'border-secondary' : ''}`}>
        
        {/* Left Section: Mobile/Tablet Hamburger & Desktop Logo */}
        <div className="d-flex align-items-center gap-3">
          {/* Hamburger: Visible under 834px */}
          <button 
            className="btn p-0 border-0 hide-above-834" 
            onClick={() => setIsMenuOpen(true)}
            aria-label="Toggle navigation menu"
          >
            <List size={28} color={isDark ? '#FFF' : '#000'} />
          </button>

          {/* Desktop Logo: Visible 834px and above */}
          <div className="show-above-834">
            <Logo height="36px" />
          </div>
        </div>

        {/* Mobile/Tablet Logo: Centered under 834px */}
        <div className="hide-above-834">
          <Logo height="36px" />
        </div>

        {/* Desktop Navigation Links (Text-Only): Visible 834px and above */}
        <nav className="show-above-834 align-items-center gap-1 mx-auto fs-6 d-flex">
          {navItems.map((item, index) => {
            const key = getKey(item, index);
            const label = getLabel(item);
            const isActive = currentTab === key;
            
            return (
              <button
                key={key}
                className={`btn px-3 py-2 border-0 rounded-3 ${isActive ? (isDark ? 'bg-secondary bg-opacity-25' : 'bg-primary-subtle') : ''}`}
                style={{ 
                  color: isActive ? '#0033CC' : (isDark ? '#FFF' : '#333'),
                  fontWeight: isActive ? '600' : '500'
                }}
                onClick={() => setCurrentTab(key)}
              >
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Logout (Desktop) & Notification Center */}
        <div className="d-flex align-items-center gap-2">
          {/* Desktop Logout Button */}
          <button 
            className="btn show-above-834 align-items-center border-0 me-2 text-danger" 
            onClick={handleLogout}
            title="Log out"
          >
            <BoxArrowRight size={20} className="me-1" />
            <span className="fw-semibold">Log out</span>
          </button>

          <NotificationCenter />
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-grow-1 overflow-auto w-100">
        {children}
      </main>

      {/* Mobile/Tablet Navigation Drawer Overlay (Under 834px) */}
      {isMenuOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 hide-above-834" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} 
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className={`h-100 p-3 shadow-lg d-flex flex-column ${isDark ? 'bg-dark' : 'bg-white'}`} 
            style={{ width: '280px' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Logo height="30px" />
              <button className="btn p-0 border-0" onClick={() => setIsMenuOpen(false)}>
                <X size={24} color={isDark ? '#FFF' : '#000'} />
              </button>
            </div>

            <nav className="d-flex flex-column gap-2 flex-grow-1">
              {navItems.map((item, index) => {
                const key = getKey(item, index);
                const label = getLabel(item);
                const icon = getIcon(item);
                const isActive = currentTab === key;
                
                return (
                  <button
                    key={key}
                    className={`btn d-flex align-items-center py-3 border-0 text-start ${isActive ? (isDark ? 'bg-secondary bg-opacity-25' : 'bg-primary-subtle') : ''}`}
                    style={{ color: isActive ? '#0033CC' : (isDark ? '#FFF' : '#000') }}
                    onClick={() => {
                      setCurrentTab(key);
                      setIsMenuOpen(false);
                    }}
                  >
                    {icon && <span className="me-3 d-flex align-items-center">{icon}</span>}
                    <span className="fw-bold" style={{ fontSize: '16px' }}>{label}</span>
                  </button>
                );
              })}
            </nav>

            <div className={`pt-3 border-top mt-auto ${isDark ? 'border-secondary' : ''}`}>
              <button 
                className="btn d-flex align-items-center py-3 border-0 text-start w-100 text-danger" 
                onClick={handleLogout}
              >
                <BoxArrowRight size={24} className="me-3" />
                <span className="fw-bold" style={{ fontSize: '16px' }}>Log out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShell;