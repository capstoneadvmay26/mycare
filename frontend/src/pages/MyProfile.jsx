// src/pages/MyProfile.jsx
import { ChevronLeft, Person, Envelope, Telephone, CalendarEvent, GenderMale, CameraFill } from 'react-bootstrap-icons';
import { useProfile } from '../context/ProfileContext';

// Helper function to format ISO date to "Month Day, Year"
const formatDate = (isoDate) => {
  if (!isoDate) return 'Not provided';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const MyProfile = ({ onBack, onEdit }) => {
  const { activeProfile } = useProfile();

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div className="d-flex justify-content-center align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
        <button className="btn p-0 border-0 position-absolute" style={{ left: '15px' }} onClick={onBack}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="fw-bold m-0" style={{ fontSize: '24px' }}>My Profile</h1>
      </div>

      {/* Large Avatar with Camera Badge */}
      <div className="d-flex justify-content-center mt-4 mb-4 position-relative" style={{ width: '110px', height: '110px', margin: '0 auto' }}>
        <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold" 
             style={{ width: '110px', height: '110px', backgroundColor: activeProfile.color, fontSize: '45px', border: '2px solid #ccc' }}>
          {activeProfile.initial}
        </div>
        {/* Camera Icon instead of Gender */}
        <div className="bg-white rounded-circle d-flex justify-content-center align-items-center" 
             style={{ width: '32px', height: '32px', position: 'absolute', bottom: 0, right: 0, border: '1px solid #ccc' }}>
          <CameraFill size={16} color="#000" />
        </div>
      </div>

      {/* Data List (Figma Style) */}
      <div className="mx-3 border rounded-3 overflow-hidden">
        <div className="d-flex align-items-center p-3 border-bottom">
          <Person size={20} className="me-3" color="#000" />
          <span className="flex-grow-1 fw-bold">Full Name</span>
          <span className="text-secondary">{activeProfile.name} (Me)</span>
        </div>
        
        <div className="d-flex align-items-center p-3 border-bottom">
          <Envelope size={20} className="me-3" color="#000" />
          <span className="flex-grow-1 fw-bold">Email Address</span>
          <span className="text-secondary">{activeProfile.email}</span>
        </div>

        <div className="d-flex align-items-center p-3 border-bottom">
          <Telephone size={20} className="me-3" color="#000" />
          <span className="flex-grow-1 fw-bold">Phone Number</span>
          <span className="text-secondary">{activeProfile.phone}</span>
        </div>

        <div className="d-flex align-items-center p-3 border-bottom">
          <CalendarEvent size={20} className="me-3" color="#000" />
          <span className="flex-grow-1 fw-bold">Date of Birth</span>
          {/* Format the date to display as Month Day, Year */}
          <span className="text-secondary">{formatDate(activeProfile.dob)}</span>
        </div>

        <div className="d-flex align-items-center p-3">
          <GenderMale size={20} className="me-3" color="#000" />
          <span className="flex-grow-1 fw-bold">Gender</span>
          <span className="text-secondary">{activeProfile.gender}</span>
        </div>
      </div>

      {/* Edit Button */}
      <div className="p-3 mt-auto">
        <button 
          className="btn w-100 py-3 fw-bold d-flex justify-content-center align-items-center"
          style={{ backgroundColor: 'rgba(0, 51, 204, 0.1)', color: '#0033CC', borderRadius: '8px' }}
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default MyProfile;