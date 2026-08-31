// src/pages/Profiles.jsx
import { useState } from 'react';
import { ChevronRight, PersonBoundingBox, PeopleFill, ArrowLeftRight } from 'react-bootstrap-icons';
import { useProfile } from '../context/ProfileContext';
import MyProfile from './MyProfile';
import EditProfile from './EditProfile';
import Dependents from './Dependents';
import SwitchProfile from './SwitchProfile';

const Profiles = () => {
  const { activeProfile } = useProfile();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'my-profile', 'edit-profile', 'dependents', 'switch'

  if (view === 'my-profile') return <MyProfile onBack={() => setView('dashboard')} onEdit={() => setView('edit-profile')} />;
  if (view === 'edit-profile') return <EditProfile onBack={() => setView('my-profile')} />;
  if (view === 'dependents') return <Dependents onBack={() => setView('dashboard')} />;
  if (view === 'switch') return <SwitchProfile onBack={() => setView('dashboard')} />;

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div className="d-flex justify-content-center align-items-center p-3 border-bottom">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px' }}>Profiles</h1>
      </div>

      {/* Active Profile Mini-Header */}
      <div className="d-flex align-items-center mx-3 mt-4 mb-3 p-3 rounded-3" style={{ backgroundColor: 'rgba(0, 51, 204, 0.06)' }}>
        <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
             style={{ width: '40px', height: '40px', backgroundColor: activeProfile.color, fontSize: '18px' }}>
          {activeProfile.initial}
        </div>
        <div>
          <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>{activeProfile.name} {activeProfile.relationship === 'Me' ? '(Me)' : ''}</p>
          <p className="m-0" style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)' }}>
            {activeProfile.relationship === 'Me' ? 'Current Profile' : `Managing ${activeProfile.relationship}'s care`}
          </p>
        </div>
      </div>

      {/* Menu List */}
      <div className="mt-2">
        <div className="d-flex align-items-center p-3 border-bottom" style={{ cursor: 'pointer' }} onClick={() => setView('my-profile')}>
          <PersonBoundingBox size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>My Profile</p>
            <p className="m-0" style={{ fontSize: '12px', color: '#000' }}>View and manage your personal information</p>
          </div>
          <ChevronRight size={20} color="#000" />
        </div>

        <div className="d-flex align-items-center p-3 border-bottom" style={{ cursor: 'pointer' }} onClick={() => setView('dependents')}>
          <PeopleFill size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Dependents</p>
            <p className="m-0" style={{ fontSize: '12px', color: '#000' }}>Manage your dependent and their profiles</p>
          </div>
          <ChevronRight size={20} color="#000" />
        </div>

        <div className="d-flex align-items-center p-3 border-bottom" style={{ cursor: 'pointer' }} onClick={() => setView('switch')}>
          <ArrowLeftRight size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Switch Profile</p>
            <p className="m-0" style={{ fontSize: '12px', color: '#000' }}>Switch between your profile and dependents</p>
          </div>
          <ChevronRight size={20} color="#000" />
        </div>
      </div>
    </div>
  );
};

export default Profiles;