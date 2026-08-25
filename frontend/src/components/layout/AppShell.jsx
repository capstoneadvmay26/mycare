import { useState, useEffect } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const AppShell = ({ currentTab, onTabChange, onLogout, children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 992);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings', 'Help & Support'];

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      
      <Header onMenuClick={() => setShowMenu(true)} isDesktop={isDesktop} />

      {/* Desktop Nav (Only on desktop) */}
      {isDesktop && (
        <nav className="d-flex align-items-center gap-4 px-4 py-2 bg-white border-bottom">
          {navItems.map((item) => (
            <button
              key={item}
              className={`btn border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-secondary'}`}
              onClick={() => onTabChange(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      )}

      {/* MOBILE DRAWER START */}
      {showMenu && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      <div 
        className="position-fixed top-0 start-0 h-100 bg-white p-4"
        style={{ 
          width: '300px', 
          zIndex: 1050, 
          transform: showMenu ? 'translateX(0)' : 'translateX(-100%)', 
          transition: 'transform 0.3s ease-in-out',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-primary fw-bold m-0">Menu</h5>
          <button onClick={() => setShowMenu(false)} className="btn btn-link p-0 text-dark" aria-label="Close">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="d-flex flex-column gap-3">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => { onTabChange(item); setShowMenu(false); }}
              className={`btn d-flex justify-content-start border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-dark'}`}
              style={{ fontSize: '18px' }}
            >
              {item}
            </button>
          ))}
          
          <button 
            onClick={() => { setShowMenu(false); onLogout(); }} 
            className="btn text-danger border-0 p-0 text-start fw-bold mt-4" 
            style={{ fontSize: '18px' }}
          >
            Log out
          </button>
        </div>
      </div>
      {/* MOBILE DRAWER END */}

      {/* Main Area */}
      <main className="flex-grow-1 pb-5 overflow-auto">
        {children}
      </main>

      {/* Bottom Nav (Only on Mobile) */}
      {!isDesktop && <BottomNav currentTab={currentTab} onTabChange={onTabChange} />}
    </div>
  );
};

export default AppShell;