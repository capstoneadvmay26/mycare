import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Onboarding from './pages/Onboarding';
import Placeholder from './pages/Placeholder';

// Import Layout Components
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
// (Removed the unused Logo import here)

const App = () => {
  const [isOnboarded, setIsOnboarded] = useState(false); 
  const [userName, setUserName] = useState('');
  const [currentTab, setCurrentTab] = useState('Home'); 
  const [showMenu, setShowMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsDesktop(window.innerWidth >= 992);
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings', 'Help & Support'];

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
    setShowMenu(false);
  };

  if (!isOnboarded) {
    return (
      <Onboarding 
        onComplete={() => setIsOnboarded(true)} 
        setUserName={setUserName} 
      />
    );
  }

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      
      <Header onMenuClick={() => setShowMenu(true)} isDesktop={isDesktop} />

      {/* DESKTOP NAV */}
      {isDesktop && (
        <nav className="d-flex align-items-center gap-4 px-4 py-2 bg-white border-bottom">
          {navItems.map((item) => (
            <button
              key={item}
              className={`btn border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-secondary'}`}
              onClick={() => setCurrentTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      {showMenu && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100" 
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}
          onClick={() => setShowMenu(false)}
        ></div>
      )}

      {/* MOBILE DRAWER */}
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
          <button onClick={() => setShowMenu(false)} className="btn btn-link p-0 text-dark" style={{ fontSize: '28px' }}>
            &#10005;
          </button>
        </div>
        
        <div className="d-flex flex-column gap-3">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => { setCurrentTab(item); setShowMenu(false); }}
              className={`btn d-flex justify-content-start border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-dark'}`}
              style={{ fontSize: '18px' }}
            >
              {item}
            </button>
          ))}
          <button 
            onClick={handleLogout} 
            className="btn text-danger border-0 p-0 text-start fw-bold mt-4" 
            style={{ fontSize: '18px' }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 pb-5 overflow-auto">
        {renderScreen()}
      </main>

      {/* BOTTOM NAV */}
      {!isDesktop && <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />}

    </div>
  );
};

export default App;