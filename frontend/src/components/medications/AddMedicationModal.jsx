// src/components/medications/AddMedicationModal.jsx
import { useState } from 'react';

const AddMedicationModal = ({ isOpen, onClose, onSave, profile_id }) => {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    start_date: '',
    quantity: ''
  });

  // 12-hour format state
  const [hour, setHour] = useState('8');
  const [minute, setMinute] = useState('00');
  const [period, setPeriod] = useState('AM');

  // State for mobile-friendly custom pickers
  const [activePicker, setActivePicker] = useState(null); // 'hour', 'minute', 'period', or null

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedTime = `${hour}:${minute} ${period}`; // e.g., "8:00 AM"
    
    onSave({ 
      ...formData, 
      time: formattedTime,
      profile_id 
    });
  };

  if (!isOpen) return null;

  // Helper to generate arrays
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM'];

  const handleSelect = (value) => {
    if (activePicker === 'hour') setHour(value);
    if (activePicker === 'minute') setMinute(value);
    if (activePicker === 'period') setPeriod(value);
    setActivePicker(null); // Close picker after selection
  };

  const renderPicker = () => {
    if (!activePicker) return null;
    
    let list = [];
    if (activePicker === 'hour') list = hours;
    if (activePicker === 'minute') list = minutes;
    if (activePicker === 'period') list = periods;

    return (
      <div className="mt-2 p-2 border rounded-3 bg-light" style={{ maxHeight: '150px', overflowY: 'auto', borderRadius: '8px' }}>
        {list.map((item) => (
          <div 
            key={item} 
            onClick={() => handleSelect(item)}
            style={{ 
              padding: '8px', 
              cursor: 'pointer', 
              textAlign: 'center',
              borderRadius: '6px',
              fontWeight: '600',
              backgroundColor: (activePicker === 'hour' && item === hour) || (activePicker === 'minute' && item === minute) || (activePicker === 'period' && item === period) ? '#0033CC' : 'transparent',
              color: (activePicker === 'hour' && item === hour) || (activePicker === 'minute' && item === minute) || (activePicker === 'period' && item === period) ? '#FFF' : '#000'
            }}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="modal fade show d-block" 
      tabIndex="-1" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered mx-auto px-3" style={{ maxWidth: '440px' }}>
        <div 
          className="modal-content border-0 shadow-lg" 
          style={{ borderRadius: '16px', overflow: 'hidden' }}
        >
          
          {/* Modal Header */}
          <div className="modal-header border-0 pb-0 pt-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-dark m-0">Add Medication</h5>
            <button 
              type="button" 
              className="btn-close ms-0" 
              onClick={onClose} 
              aria-label="Close" 
            />
          </div>

          {/* Modal Body */}
          <div className="modal-body px-4 py-3">
            <form onSubmit={handleSubmit}>
              
              {/* Medication Name */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Medication name</label>
                <input 
                  type="text" 
                  className="form-control py-2" 
                  placeholder="e.g. Amlodipine"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Dosage */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Dosage</label>
                <input 
                  type="text" 
                  className="form-control py-2" 
                  placeholder="e.g. 5mg, 1 tablet"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Frequency */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Frequency</label>
                <select 
                  className="form-select py-2" 
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="3 Times daily">3 Times daily</option>
                  <option value="At specific time">At specific time</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>
              
              {/* Mobile-First Custom Time Picker */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Time</label>
                <div className="row g-2">
                  <div className="col-4">
                    <button 
                      type="button"
                      className="btn w-100 py-2 text-center fw-semibold"
                      style={{ borderRadius: '8px', backgroundColor: '#FFF', border: '1px solid #DEDFE2', color: '#000' }}
                      onClick={() => setActivePicker(activePicker === 'hour' ? null : 'hour')}
                    >
                      {hour}
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      type="button"
                      className="btn w-100 py-2 text-center fw-semibold"
                      style={{ borderRadius: '8px', backgroundColor: '#FFF', border: '1px solid #DEDFE2', color: '#000' }}
                      onClick={() => setActivePicker(activePicker === 'minute' ? null : 'minute')}
                    >
                      {minute}
                    </button>
                  </div>
                  <div className="col-4">
                    <button 
                      type="button"
                      className="btn w-100 py-2 text-center fw-semibold"
                      style={{ borderRadius: '8px', backgroundColor: '#FFF', border: '1px solid #DEDFE2', color: '#000' }}
                      onClick={() => setActivePicker(activePicker === 'period' ? null : 'period')}
                    >
                      {period}
                    </button>
                  </div>
                </div>
                
                {/* Custom List */}
                {renderPicker()}
              </div>
              
              {/* Start Date & Quantity */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">Start date</label>
                  <input 
                    type="date" 
                    className="form-control py-2"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">Quantity</label>
                  <input 
                    type="number" 
                    className="form-control py-2"
                    placeholder="e.g. 60"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                className="btn w-100 text-white mt-2 py-2 fw-bold" 
                style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
                type="submit"
              >
                Next
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddMedicationModal;