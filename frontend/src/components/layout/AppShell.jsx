import { useState, useEffect } from 'react';
import { useApp } from '../../context/useApp'; // Fixed import path!
import { Offcanvas } from 'react-bootstrap';
import { List, Bell, House, Capsule, HeartPulse, Clock, People, Gear, QuestionCircle, BoxArrowRight } from 'react-bootstrap-icons';
import Logo from '../ui/Logo';

const AppShell = ({ children, navItems, currentTab, setCurrentTab, userName }) => {
  const { isMenuOpen, setIsMenuOpen, handleLogout } = useApp();
  
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const getIcon = (item) => {
    switch(item) {
      case 'Home': return <House size={22} />;
      case 'Medications': return <Capsule size={22} />;
      case 'Symptoms': return <HeartPulse size={22} />;
      case 'History': return <Clock size={22} />;
      case 'Profiles': return <People size={22} />;
      case 'Settings': return <Gear size={22} />;
      case 'Help & Support': return <QuestionCircle size={22} />;
      default: return <Gear size={22} />;
    }
  };

  return (
    <div className="d-flex flex-column vh-100 bg-light">
      
      <header className="bg-white shadow-sm sticky-top" style={{ zIndex: 1030 }}>
        <div className="d-flex align-items-center justify-content-between px-3 py-2">
          
          {!isDesktop && (
            <button onClick={() => setIsMenuOpen(true)} className="btn p-0 border-0 text-dark" aria-label="Open Menu">
              <List size={28} />
            </button>
          )}

          <div className="flex-grow-1 d-flex justify-content-center">
            <Logo />
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="position-relative">
              <Bell size={24} className="text-dark" />
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>2</span>
            </div>
            <div 
              className="rounded-circle overflow-hidden d-flex justify-content-center align-items-center text-white fw-bold border"
              style={{ width: '36px', height: '36px', backgroundColor: '#0033CC', fontSize: '14px', borderColor: 'rgba(0,0,0,0.25)!important' }}
            >
              {userName ? userName.charAt(0).toUpperCase() : 'T'}
            </div>
          </div>
        </div>
      </header>

      {isDesktop && (
        <nav className="d-flex align-items-center gap-4 px-4 py-3 bg-white border-bottom">
          {navItems.map((item) => (
            <button
              key={item}
              className={`btn border-0 p-0 ${currentTab === item ? 'text-primary fw-bold' : 'text-secondary'}`}
              style={{ fontSize: '16px', cursor: 'pointer' }}
              onClick={() => setCurrentTab(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      )}

      <Offcanvas show={isMenuOpen} onHide={() => setIsMenuOpen(false)} placement="start" className="w-75">
        <Offcanvas.Header closeButton className="pb-0">
          <Offcanvas.Title className="w-100 d-flex align-items-center">
            <div 
              className="rounded-circle overflow-hidden me-3 d-flex justify-content-center align-items-center text-white fw-bold border"
              style={{ width: '48px', height: '48px', backgroundColor: '#0033CC', borderColor: 'rgba(0,0,0,0.25)!important', fontSize: '18px' }}
            >
              {userName ? userName.charAt(0).toUpperCase() : 'T'}
            </div>
            <span className="fw-bold" style={{ fontSize: '24px', color: '#000' }}>Menu</span>
          </Offcanvas.Title>
        </Offcanvas.Header>
        
        <Offcanvas.Body className="pt-3">
          <div className="d-flex flex-column gap-4">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => { setCurrentTab(item); setIsMenuOpen(false); }}
                className="btn d-flex align-items-center justify-content-start border-0 p-0"
                style={{ 
                  fontSize: '16px', 
                  fontWeight: currentTab === item ? '700' : '600',
                  color: currentTab === item ? '#0033CC' : '#000'
                }}
              >
                <span className="me-3" style={{ color: currentTab === item ? '#0033CC' : '#000' }}>
                  {getIcon(item)}
                </span>
                {item}
              </button>
            ))}
            
            <hr style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '10px 0' }} />
            
            <button 
              className="btn d-flex align-items-center justify-content-start border-0 p-0"
              style={{ fontSize: '16px', fontWeight: '600', color: '#D92D20' }}
              onClick={handleLogout}
            >
              <BoxArrowRight size={22} className="me-3" />
              Log out
            </button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      <main className="flex-grow-1 pb-5 overflow-auto">
        {children}
      </main>

    </div>
  );
};

export default AppShell;