// src/pages/Notifications.jsx
import { useState } from 'react';
import { ChevronLeft, Bell, BellFill, Envelope } from 'react-bootstrap-icons';

const RenderToggle = ({ isOn, onClick }) => (
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

const Notifications = ({ onBack }) => {
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
        <button className="btn p-0 border-0" onClick={onBack}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '24px' }}>Notifications</h1>
      </div>

      <div className="p-3">
        <p className="text-secondary fw-bold mb-3" style={{ fontSize: '16px' }}>Manage your alerts & reminders</p>

        {/* In-App Notifications */}
        <div className="d-flex align-items-center py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <BellFill size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>In-App Notification</p>
            <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Medication & symptom reminders</p>
          </div>
          <RenderToggle isOn={settings.push} onClick={() => toggleSetting('push')} />
        </div>

        {/* Email Notifications */}
        <div className="d-flex align-items-center py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <Envelope size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Email Notification</p>
            <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Send updates to your email</p>
          </div>
          <RenderToggle isOn={settings.email} onClick={() => toggleSetting('email')} />
        </div>

        {/* SMS Notifications */}
        <div className="d-flex align-items-center py-3">
          <Bell size={24} className="me-3" color="#000" />
          <div className="flex-grow-1">
            <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>SMS Notifications</p>
            <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Text message alerts</p>
          </div>
          <RenderToggle isOn={settings.sms} onClick={() => toggleSetting('sms')} />
        </div>

        {/* Info note */}
        <div className="rounded-3 p-3 mt-4" style={{ backgroundColor: '#F8F9FA', border: '1px solid rgba(0,0,0,0.1)' }}>
          <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>
            *Note: Per our v1 PRD, SMS reminders are currently out of scope. Push and Email notifications are fully supported.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;