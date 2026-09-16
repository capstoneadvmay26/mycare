// src/pages/Symptoms.jsx
import { Plus } from 'react-bootstrap-icons';

const Symptoms = () => {
  const symptoms = [
    { id: 1, name: 'Headache', severity: 'Moderate', time: '8:00 AM' },
    { id: 2, name: 'Fatigue', severity: 'Mild', time: '12:00 PM' },
    { id: 3, name: 'Dizziness', severity: 'Severe', time: '3:00 PM' },
  ];

  const severityColor = (severity) => {
    if (severity === 'Mild') return '#4CBB17';
    if (severity === 'Moderate') return '#F7C81B';
    return '#D92D20';
  };

  return (
    <div className="d-flex flex-column h-100 p-3 bg-white">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px', color: '#000' }}>Symptoms</h1>
        <button 
          className="btn btn-sm d-flex align-items-center fw-bold"
          style={{ backgroundColor: 'rgba(0, 51, 204, 0.1)', color: '#0033CC', borderRadius: '8px' }}
          onClick={() => alert("Add Symptom clicked!")}
        >
          <Plus size={16} className="me-1" /> Add
        </button>
      </div>

      {/* List */}
      <div className="d-flex flex-column gap-2 overflow-auto">
        {symptoms.map((s) => (
          <div 
            key={s.id} 
            className="d-flex align-items-center justify-content-between bg-white p-3"
            style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
          >
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '16px', color: '#000' }}>{s.name}</p>
              <p className="m-0" style={{ fontSize: '13px', color: '#000' }}>{s.time}</p>
            </div>
            <div 
              className="px-3 py-1 rounded-pill fw-bold"
              style={{ backgroundColor: `${severityColor(s.severity)}20`, color: severityColor(s.severity), fontSize: '12px' }}
            >
              {s.severity}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <div className="mt-auto pt-4 pb-2">
        <button 
          className="btn w-100 fw-bold py-3"
          style={{ backgroundColor: '#DEDFE2', color: '#000', borderRadius: '8px' }}
          onClick={() => alert("View Symptom History clicked!")}
        >
          View Symptom History
        </button>
      </div>
    </div>
  );
};

export default Symptoms;