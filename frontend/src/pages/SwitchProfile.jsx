// src/pages/SwitchProfile.jsx
import { ChevronLeft, CheckCircleFill } from 'react-bootstrap-icons';
import { useProfile } from '../context/ProfileContext';

const SwitchProfile = ({ onBack }) => {
  const { profiles, activeProfile, switchProfile } = useProfile();

  const handleSwitch = (id) => {
    switchProfile(id);
    alert(`Successfully switched to ${profiles.find(p => p.id === id).name}!`);
    onBack();
  };

  return (
    <div className="d-flex flex-column h-100 p-3 bg-white">
      <div className="d-flex align-items-center mb-4">
        <button className="btn p-0 border-0" onClick={onBack}><ChevronLeft size={28} /></button>
        <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '24px' }}>Switch Profile</h1>
      </div>

      <p className="mb-4 text-secondary">Select a profile to view their information.</p>

      <div className="d-flex flex-column gap-3">
        {profiles.map(profile => (
          <div 
            key={profile.id} 
            className="d-flex align-items-center p-3 rounded-3"
            style={{ 
              border: activeProfile.id === profile.id ? '2px solid #0033CC' : '1px solid rgba(0,0,0,0.1)', 
              cursor: 'pointer', 
              backgroundColor: activeProfile.id === profile.id ? 'rgba(0,51,204,0.05)' : '#FFF' 
            }}
            onClick={() => handleSwitch(profile.id)}
          >
            <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
                 style={{ width: '32px', height: '32px', backgroundColor: profile.color, fontSize: '16px' }}>
              {profile.initial}
            </div>
            <div className="flex-grow-1">
              <p className="m-0 fw-bold">{profile.name} {profile.relationship === 'Me' ? '(Me)' : ''}</p>
            </div>
            {activeProfile.id === profile.id && <CheckCircleFill size={24} color="#0033CC" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchProfile;