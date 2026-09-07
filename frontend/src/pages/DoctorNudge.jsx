// src/pages/DoctorNudge.jsx
import { PeopleFill } from 'react-bootstrap-icons';

const DoctorNudge = ({ onBack, onClose }) => {
  return (
    <div className="d-flex flex-column h-100 align-items-center justify-content-center p-4 text-center">
      <div className="mb-4" style={{ width: '120px', height: '120px', backgroundColor: 'rgba(0,51,204,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PeopleFill size={60} color="#0033CC" />
      </div>

      <h1 className="fw-bold mb-3" style={{ fontSize: '24px' }}>Consider seeing a doctor</h1>
      <p className="mb-2" style={{ fontSize: '15px' }}>Your symptoms haven't improved over the past 3 days.</p>
      <p className="mb-5 text-secondary" style={{ fontSize: '14px' }}>If this continues or gets worse, please consult a healthcare professional.</p>

      <div className="w-100">
        <button 
          className="btn w-100 py-3 fw-bold text-white mb-3"
          style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
          onClick={onClose}
        >
          Find a Doctor
        </button>
        <button 
          className="btn w-100 py-3 fw-bold"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #0033CC', color: '#0033CC', borderRadius: '8px' }}
          onClick={onBack}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default DoctorNudge;