//import React from 'react';
import { House, Capsule, HeartPulse, Clock, People } from 'react-bootstrap-icons';

const BottomNav = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'Home', icon: <House size={24} /> },
    { id: 'Medications', icon: <Capsule size={24} /> },
    { id: 'Symptoms', icon: <HeartPulse size={24} /> },
    { id: 'History', icon: <Clock size={24} /> },
    { id: 'Profiles', icon: <People size={24} /> },
  ];

  return (
    <nav className="bg-white border-top py-2 position-fixed bottom-0 w-100 d-flex justify-content-around" style={{ zIndex: 1000 }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="btn border-0 d-flex flex-column align-items-center p-0"
          style={{ color: currentTab === tab.id ? '#0033CC' : '#6c757d' }}
        >
          {tab.icon}
          <span style={{ fontSize: '11px' }}>{tab.id}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;