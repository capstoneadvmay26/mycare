// src/components/layout/NotificationCenter.jsx
import { useState } from 'react'; // <-- ONLY useState, NO useEffect!
import { Bell, Clock } from 'react-bootstrap-icons'; 
import { useReminder } from '../../context/ReminderContext';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch due medication from context
  const { dueMedication } = useReminder();

  // FIX: Calculate notifications directly without useEffect
  const baseNotifications = [
    { id: 1, type: 'Reminder', title: 'Amlodipine due now', time: '8:00 AM', icon: <Clock size={16} color="#F7C81B" /> },
    { id: 2, type: 'Alert', title: 'Your trial ends in 3 days', time: 'Today', icon: <Clock size={16} color="#D92D20" /> },
  ];

  const notifications = dueMedication
    ? [
        { id: 99, type: 'Reminder', title: `Time for ${dueMedication.name}`, time: 'Now', icon: <Clock size={16} color="#0033CC" /> },
        ...baseNotifications
      ]
    : baseNotifications;

  const unreadCount = notifications.length;

  return (
    <div className="position-relative">
      {/* Bell Button */}
      <button 
        className="btn position-relative p-0 border-0" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ outline: 'none' }}
      >
        <Bell size={24} color="currentColor" />
        {unreadCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
            style={{ backgroundColor: '#D92D20', fontSize: '10px', color: '#fff', transform: 'translate(-50%, -50%)' }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="position-absolute p-3 shadow-lg"
          style={{ 
            top: '40px', 
            right: '-10px', 
            width: '320px', 
            maxHeight: '400px', 
            overflowY: 'auto',
            backgroundColor: '#fff', 
            borderRadius: '12px',
            border: '1px solid rgba(0,0,0,0.1)',
            zIndex: 1060
          }}
        >
          <h6 className="fw-bold mb-3" style={{ color: '#000' }}>Notifications</h6>
          
          {notifications.length === 0 ? (
            <p className="text-secondary m-0 text-center" style={{ fontSize: '13px' }}>You're all caught up!</p>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="d-flex align-items-start border-bottom py-2" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
                <div className="me-2 mt-1">{notif.icon}</div>
                <div className="flex-grow-1">
                  <p className="m-0 fw-bold" style={{ fontSize: '14px', color: '#000' }}>{notif.title}</p>
                  <p className="m-0" style={{ fontSize: '12px', color: '#888' }}>{notif.time}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;