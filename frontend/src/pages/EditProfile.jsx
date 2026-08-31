// src/pages/EditProfile.jsx
import { useState } from 'react';
import { ChevronLeft, Person, Envelope, Telephone, CalendarEvent, GenderMale } from 'react-bootstrap-icons';
import { useProfile } from '../context/ProfileContext';

const EditProfile = ({ onBack }) => {
  const { activeProfile, updateActiveProfile } = useProfile();

  const [name, setName] = useState(activeProfile.name);
  const [email, setEmail] = useState(activeProfile.email);
  const [phone, setPhone] = useState(activeProfile.phone);
  const [dob, setDob] = useState(activeProfile.dob); // Store as YYYY-MM-DD for input
  const [gender, setGender] = useState(activeProfile.gender);

  const handlePhotoClick = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = () => {
      alert("Image selected! (Backend upload integration pending)");
    };
    fileInput.click();
  };

  const handleSave = () => {
    if (!name || !email || !phone) {
      alert("Please fill in all required fields.");
      return;
    }
    updateActiveProfile({ name, email, phone, dob, gender }); // Store the ISO string
    alert("Profile updated successfully!");
    onBack();
  };

  return (
    <div className="d-flex flex-column h-100 bg-white">
      <div className="d-flex justify-content-center align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
        <button className="btn p-0 border-0 position-absolute" style={{ left: '15px' }} onClick={onBack}>
          <ChevronLeft size={28} />
        </button>
        <h1 className="fw-bold m-0" style={{ fontSize: '24px' }}>Edit Profile</h1>
      </div>

      <div className="d-flex flex-column justify-content-center align-items-center mt-4 mb-4">
        <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold" 
             style={{ width: '100px', height: '100px', backgroundColor: activeProfile.color, fontSize: '40px' }}>
          {activeProfile.initial}
        </div>
        <button className="btn p-0 border-0 mt-2" 
                style={{ color: '#0033CC', fontWeight: '600', cursor: 'pointer' }}
                onClick={handlePhotoClick}>
          Change Photo
        </button>
      </div>

      <div className="px-3">
        {/* ... Other fields ... */}
        <div className="mb-3">
          <label className="fw-bold mb-2">Name</label>
          <div className="d-flex align-items-center border rounded-3 p-2">
            <Person size={18} className="me-2" color="#000" />
            <input className="form-control border-0 shadow-none p-0" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="fw-bold mb-2">Email Address</label>
          <div className="d-flex align-items-center border rounded-3 p-2">
            <Envelope size={18} className="me-2" color="#000" />
            <input className="form-control border-0 shadow-none p-0" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="fw-bold mb-2">Phone Number</label>
          <div className="d-flex align-items-center border rounded-3 p-2">
            <Telephone size={18} className="me-2" color="#000" />
            <input className="form-control border-0 shadow-none p-0" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="mb-3">
          <label className="fw-bold mb-2">Date of Birth</label>
          <div className="d-flex align-items-center border rounded-3 p-2">
            <CalendarEvent size={18} className="me-2" color="#000" />
            <input 
              className="form-control border-0 shadow-none p-0" 
              type="date" 
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="fw-bold mb-2">Gender</label>
          <div className="d-flex align-items-center border rounded-3 p-2">
            <GenderMale size={18} className="me-2" color="#000" />
            <select className="form-control border-0 shadow-none p-0" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 mt-auto">
        <button className="btn w-100 py-3 fw-bold text-white mb-3" 
                style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
                onClick={handleSave}>
          Save Changes
        </button>
        <button className="btn w-100 py-3 fw-bold"
                style={{ backgroundColor: '#FFF', color: '#0033CC', border: '1px solid #0033CC', borderRadius: '8px' }}
                onClick={onBack}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;