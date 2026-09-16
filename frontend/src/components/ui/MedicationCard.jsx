// src/components/ui/MedicationCard.jsx
import { ChevronRight } from 'react-bootstrap-icons';

const MedicationCard = ({ medication, onToggleArchive }) => {
  return (
    <div 
      className="d-flex align-items-center justify-content-between bg-white p-3 mb-2"
      style={{ 
        border: '1px solid rgba(0, 0, 0, 0.15)', 
        borderRadius: '8px',
        cursor: 'pointer',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
      onClick={() => onToggleArchive && onToggleArchive(medication)}
    >
      <div className="d-flex align-items-center">
        {/* Icon Container - Matches Figma border radius and size */}
        <div 
          className="d-flex justify-content-center align-items-center me-3"
          style={{ 
            width: '42px', 
            height: '42px', 
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #000',
            borderRadius: '8px',
            flexShrink: 0 
          }}
        >
          {/* Colored Pill Icon (User can customize color per medication later) */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
             <path d="M10.5 20.5L3.5 13.5C1.5 11.5 1.5 8.5 3.5 6.5C5.5 4.5 8.5 4.5 10.5 6.5L17.5 13.5C19.5 15.5 19.5 18.5 17.5 20.5C15.5 22.5 12.5 22.5 10.5 20.5Z" stroke="#0033CC" strokeWidth="2"/>
             <path d="M6.5 12.5L11.5 17.5" stroke="#0033CC" strokeWidth="2"/>
          </svg>
        </div>

        <div>
          <p className="m-0" style={{ fontSize: '16px', color: '#000' }}>
            <span className="fw-bold">{medication.name}</span> {medication.dosage ? medication.dosage.split(',')[0] : ''}
          </p>
          <p className="m-0" style={{ fontSize: '13px', color: '#000' }}>
            {medication.dosage ? medication.dosage.split(',')[1] : ''}
          </p>
        </div>
      </div>

      <div className="d-flex align-items-center">
        <div className="text-end me-2">
          <p className="m-0" style={{ fontSize: '13px', color: '#000' }}>
            {medication.time}
          </p>
        </div>
        <ChevronRight size={18} color="#000" />
      </div>
    </div>
  );
};

export default MedicationCard;