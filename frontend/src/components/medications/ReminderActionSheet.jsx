// src/components/medications/ReminderActionSheet.jsx
import { CheckCircle, XCircle, Alarm } from 'react-bootstrap-icons';
import { useState } from 'react';

const ReminderActionSheet = ({ medication, onClose, onAction }) => {
  const [showSnooze, setShowSnooze] = useState(false);
  const snoozeOptions = [10, 30, 60];

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered mx-auto px-3" style={{ maxWidth: '440px' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          <div className="modal-header border-0 pb-0 pt-3 px-4">
            <h5 className="modal-title fw-bold text-dark m-0">Time for {medication.name}</h5>
            <button type="button" className="btn-close ms-0" onClick={onClose} aria-label="Close" />
          </div>
          
          <div className="modal-body px-4 py-3">
            <p className="mb-4" style={{ fontSize: '14px', color: '#666' }}>{medication.dosage}</p>

            <div className="row g-2 mb-3">
              <div className="col-4">
                <button className="btn w-100 py-3" style={{ backgroundColor: 'rgba(76,187,23,0.1)', color: '#4CBB17', borderRadius: '12px' }} onClick={() => onAction('taken')}>
                  <CheckCircle size={24} className="mb-1" />
                  <div className="fw-bold" style={{ fontSize: '13px' }}>Taken</div>
                </button>
              </div>
              <div className="col-4">
                <button className="btn w-100 py-3" style={{ backgroundColor: 'rgba(217,45,32,0.1)', color: '#D92D20', borderRadius: '12px' }} onClick={() => onAction('skipped')}>
                  <XCircle size={24} className="mb-1" />
                  <div className="fw-bold" style={{ fontSize: '13px' }}>Skipped</div>
                </button>
              </div>
              <div className="col-4">
                <button className="btn w-100 py-3" style={{ backgroundColor: 'rgba(0,51,204,0.1)', color: '#0033CC', borderRadius: '12px' }} onClick={() => setShowSnooze(!showSnooze)}>
                  <Alarm size={24} className="mb-1" />
                  <div className="fw-bold" style={{ fontSize: '13px' }}>Snooze</div>
                </button>
              </div>
            </div>

            {showSnooze && (
              <div className="mb-3">
                <div className="d-flex gap-2">
                  {snoozeOptions.map(min => (
                    <button key={min} className="btn btn-sm flex-grow-1 fw-bold" style={{ border: '1px solid rgba(0,0,0,0.2)' }} onClick={() => onAction('snooze')}>
                      {min} min
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderActionSheet;