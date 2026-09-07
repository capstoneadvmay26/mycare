// src/pages/Home.jsx
import { useState } from 'react';
import { useApp } from '../context/useApp';
import { useProfile } from '../context/ProfileContext';
import { useTheme } from '../context/ThemeContext';
import CheckIn from './CheckIn';
import DoctorNudge from './DoctorNudge';
import { Alarm, Clock, CheckCircle, ChevronRight, ArrowLeftRight } from 'react-bootstrap-icons';

const Home = () => {
  const { userName } = useApp();
  const { activeProfile, profiles, switchProfile } = useProfile();
  const { isDark } = useTheme();

  const [checkInState, setCheckInState] = useState('idle'); // 'idle', 'active', 'nudge'

  // Determine the displayed name
  const displayName = activeProfile && activeProfile.name !== 'Tolu' ? activeProfile.name : (userName || 'Tolu');
  const isDependent = activeProfile && activeProfile.isDependent;

  // If dependent, show 67% adherence as per Figma; otherwise 33%
  const adherence = isDependent ? 67 : 33;
  const doses = isDependent ? '2 of 3 doses taken' : '1 of 3 doses taken';

  const schedule = {
    dueNow: [{ name: 'Amlodipine', dosage: '5mg', time: '8:00am' }],
    upcoming: [{ name: 'Losartan', dosage: '50mg', time: '2:00pm' }],
    completed: [{ name: 'Metformin', dosage: '500mg', time: '12:00pm' }]
  };

  // Conditionally render Check-in flow
  if (checkInState === 'active') {
    return (
      <CheckIn 
        symptom="Headache" 
        onBack={() => setCheckInState('idle')} 
        onComplete={(result) => {
          if (result === 'nudge') setCheckInState('nudge');
          else setCheckInState('idle');
        }} 
      />
    );
  }

  if (checkInState === 'nudge') {
    return (
      <DoctorNudge 
        onBack={() => setCheckInState('idle')} 
        onClose={() => setCheckInState('idle')} 
      />
    );
  }

  // Simple cycle to next profile
  const handleSwitch = () => {
    const currentIndex = profiles.findIndex(p => p.id === activeProfile.id);
    const nextProfile = profiles[(currentIndex + 1) % profiles.length];
    switchProfile(nextProfile.id);
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      <div className="mb-3 mt-2">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px', color: isDark ? '#FFF' : '#000' }}>
          Good morning, {displayName}
        </h1>
        <p className="m-0" style={{ fontSize: '15px', color: isDark ? '#A0A0A0' : '#000' }}>
          {isDependent ? `Here is ${activeProfile.name}'s health overview for today.` : 'Today, Wed Aug 12'}
        </p>
      </div>

      {/* Dependent Profile Card */}
      {isDependent && (
        <div 
          className="d-flex align-items-center p-3 mb-4 rounded-3"
          style={{ backgroundColor: 'rgba(0, 51, 204, 0.1)' }}
        >
          <div 
            className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
            style={{ width: '50px', height: '50px', backgroundColor: activeProfile.color, fontSize: '20px' }}
          >
            {activeProfile.initial}
          </div>
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '18px', color: '#000' }}>{activeProfile.name}</p>
            <p className="m-0" style={{ fontSize: '13px', color: '#666' }}>Managing {activeProfile.relationship}'s care</p>
          </div>
          <button 
            className="btn p-2 rounded-circle"
            style={{ backgroundColor: '#FFF', border: '1px solid #ccc' }}
            onClick={handleSwitch}
          >
            <ArrowLeftRight size={20} color="#000" />
          </button>
        </div>
      )}

      {/* Adherence Card */}
      <div className="bg-white rounded-3 p-3 mb-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="m-0 mb-1" style={{ fontSize: '16px', color: isDark ? '#FFF' : '#000' }}>Today's Adherence</p>
            <p className="m-0 mb-2 fw-bold" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>{doses}</p>
          </div>
          <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', border: '8px solid #E5E7EB', borderTop: `8px solid ${activeProfile.color}` }}>
            <span className="fw-bold" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>{adherence}%</span>
          </div>
        </div>
      </div>

      <h6 className="fw-bold mb-3" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>Schedule</h6>
      
      {/* Due Now */}
      <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: 'rgba(217, 45, 32, 0.06)', border: '1.054px solid rgba(217, 45, 32, 0.3)' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#D92D20' }}>Due Now</span>
          <span style={{ fontSize: '12px', color: '#D92D20' }}>{schedule.dueNow.length} medication</span>
        </div>
        {schedule.dueNow.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <Alarm size={32} className="me-3" style={{ color: isDark ? '#FFF' : '#000' }} />
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>{med.name} <span style={{ fontSize: '13px', fontWeight: '400' }}>{med.dosage}</span></p>
              <p className="m-0" style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#000' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" style={{ color: isDark ? '#FFF' : '#000' }} />
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: 'rgba(247, 200, 27, 0.06)', border: '1.054px solid rgba(247, 200, 27, 0.3)' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#F7C81B' }}>Upcoming</span>
          <span style={{ fontSize: '12px', color: isDark ? '#A0A0A0' : '#000' }}>{schedule.upcoming.length} medication</span>
        </div>
        {schedule.upcoming.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <Clock size={32} className="me-3" style={{ color: isDark ? '#FFF' : '#000' }} />
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>{med.name} <span style={{ fontSize: '13px', fontWeight: '400' }}>{med.dosage}</span></p>
              <p className="m-0" style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#000' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" style={{ color: isDark ? '#FFF' : '#000' }} />
          </div>
        ))}
      </div>

      {/* Completed */}
      <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: 'rgba(76, 187, 23, 0.06)', border: '1.054px solid rgba(76, 187, 23, 0.3)' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#4CBB17' }}>Completed</span>
          <span style={{ fontSize: '12px', color: isDark ? '#A0A0A0' : '#000' }}>{schedule.completed.length} medication</span>
        </div>
        {schedule.completed.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <CheckCircle size={32} className="me-3" style={{ color: isDark ? '#FFF' : '#000' }} />
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px', color: isDark ? '#FFF' : '#000' }}>{med.name} <span style={{ fontSize: '13px', fontWeight: '400' }}>{med.dosage}</span></p>
              <p className="m-0" style={{ fontSize: '13px', color: isDark ? '#A0A0A0' : '#000' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" style={{ color: isDark ? '#FFF' : '#000' }} />
          </div>
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="mt-auto">
        <button 
          className="btn w-100 py-3 fw-bold mb-2"
          style={{ backgroundColor: 'rgba(0, 51, 204, 0.1)', color: '#0033CC', borderRadius: '8px' }}
          onClick={() => setCheckInState('active')}
        >
          Start Daily Check-in
        </button>
        <button 
          className="btn w-100 py-3 fw-bold"
          style={{ backgroundColor: 'rgba(0, 51, 204, 0.06)', color: '#0033CC', borderRadius: '8px' }}
          onClick={() => alert("View full schedule coming soon!")}
        >
          View full schedule
        </button>
      </div>
    </div>
  );
};

export default Home;