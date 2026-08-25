//import React from 'react';
import { List, Bell, Person } from 'react-bootstrap-icons';
import Logo from '../ui/Logo';

const Header = ({ onMenuClick, isDesktop }) => {
  return (
    <header className="bg-white shadow-sm sticky-top" style={{ zIndex: 1030 }}>
      <div className="d-flex align-items-center justify-content-between px-3 py-2">
        
        {!isDesktop && (
          <button onClick={onMenuClick} className="btn p-0 border-0 text-dark me-2">
            <List size={28} />
          </button>
        )}

        <div className="flex-grow-1 d-flex justify-content-center justify-content-lg-start">
          <Logo height="40px" />
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="position-relative">
            <Bell size={24} className="text-dark" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>3</span>
          </div>
          <Person size={28} className="text-secondary" />
        </div>
      </div>
    </header>
  );
};

export default Header;