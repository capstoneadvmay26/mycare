// src/pages/Reminders.jsx
import { useState } from 'react';
import { ChevronLeft, ClockHistory, Alarm, Capsule, ChatHeart, BoxSeam } from 'react-bootstrap-icons'; // Changed Pill to Capsule

// Define Toggle OUTSIDE the component
const Toggle = ({ isOn, onClick }) => (
  <div 
    onClick={onClick}
    className="rounded-pill d-flex align-items-center"
    style={{
      width: '48px',
      height: '28px',
      backgroundColor: isOn ? '#0033CC' : 'rgba(107,114,128,0.5)',
      justifyContent: isOn ? 'flex-end' : 'flex-start',
      padding: '2px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
  >
    <div className="rounded-circle bg-white shadow-sm" style={{ width: '24px', height: '24px' }}></div>
  </div>
);

// Define ReminderRow OUTSIDE the component
const ReminderRow = ({ icon, title, subtitle, isOn, toggleKey, onToggle }) => (
  <div className="d-flex align-items-center py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
    <div className="me-3">{icon}</div>
    <div className="flex-grow-1">
      <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>{title}</p>
      <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>{subtitle}</p>
    </div>
    <Toggle isOn={isOn} onClick={() => onToggle(toggleKey)} />
  </div>
);

const Reminders = ({ onBack }) => {
  // State for all reminder settings
  const [settings, setSettings] = useState({
    medNotifications: true,
    checkInReminders: true,
    refillReminders: true,
    snoozeEnabled: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
        <button className="btn p-0 border-0" onClick={onBack}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '24px' }}>Reminders</h1>
      </div>

      <div className="p-3 flex-grow-1">
        <p className="text-secondary fw-bold mb-3" style={{ fontSize: '16px' }}>
          Manage medication & check-in reminders
        </p>

        {/* Medication Reminders */}
        <ReminderRow 
          icon={<Capsule size={24} />} 
          title="Medication Notifications" 
          subtitle="Alerts when it's time to take your meds"
          isOn={settings.medNotifications}
          toggleKey="medNotifications"
          onToggle={toggleSetting}
        />

        {/* Symptom Check-ins */}
        <ReminderRow 
          icon={<ChatHeart size={24} />} 
          title="Symptom Check-ins" 
          subtitle="Daily follow-ups for logged symptoms (Day 1, 2, 3)"
          isOn={settings.checkInReminders}
          toggleKey="checkInReminders"
          onToggle={toggleSetting}
        />

        {/* Refill Reminders */}
        <ReminderRow 
          icon={<BoxSeam size={24} />} 
          title="Refill Reminders" 
          subtitle="Get notified when medication supply is running low"
          isOn={settings.refillReminders}
          toggleKey="refillReminders"
          onToggle={toggleSetting}
        />

        {/* Snooze Options */}
        <ReminderRow 
          icon={<Alarm size={24} />} 
          title="Allow Snooze" 
          subtitle="Enable 10/30 minute snooze options"
          isOn={settings.snoozeEnabled}
          toggleKey="snoozeEnabled"
          onToggle={toggleSetting}
        />

        {/* Specific Time Settings */}
        <div className="d-flex align-items-center py-3">
          <ClockHistory size={24} className="me-3" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Default Reminder Time</p>
            <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Set when daily notifications are sent</p>
          </div>
          <span className="fw-bold" style={{ color: '#0033CC' }}>08:00 AM</span>
        </div>
      </div>

      {/* Info Note */}
      <div className="p-3">
        <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(0,51,204,0.05)', border: '1px solid rgba(0,51,204,0.2)' }}>
          <p className="m-0" style={{ fontSize: '12px', color: '#0033CC' }}>
            💡 Tip: Keep Medication Notifications on for the best health outcomes. You can snooze notifications in the main app if you're busy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reminders;