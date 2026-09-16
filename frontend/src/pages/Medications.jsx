// src/pages/Medications.jsx
import { useState } from 'react'; 
import { Plus } from 'react-bootstrap-icons';
import MedicationCard from '../components/ui/MedicationCard';
import AddMedicationModal from '../components/medications/AddMedicationModal';

const Medications = () => {
  // 1. Initialize with fake data so the UI has content!
  const [medications, setMedications] = useState([
    { id: '1', name: 'Amlodipine', dosage: '5mg, 1 tablet', time: '8:00 AM', is_archived: false },
    { id: '2', name: 'Metformin', dosage: '500mg, 1 tablet', time: '8:00 AM', is_archived: false },
    { id: '3', name: 'Furosemide', dosage: '40mg, 1 tablet', time: '7:00 AM, 12:00 PM', is_archived: false },
    { id: '4', name: 'Atorvastatin', dosage: '20mg, 1 tablet', time: '9:00 PM', is_archived: true }
  ]);

  const [activeTab, setActiveTab] = useState('active');
  const [showModal, setShowModal] = useState(false);

  // 2. Handle Add Submit (Mocked)
  const handleAddSubmit = async (data) => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Add the new medication to the local state
    const newMed = {
      id: Date.now().toString(),
      name: data.name,
      dosage: data.dosage,
      time: data.time || '8:00 AM',
      is_archived: false
    };

    setMedications(prev => [...prev, newMed]);
    setShowModal(false);
  };

  // 3. Handle Toggle Archive (Mocked)
  const handleToggleArchive = async (medication) => {
    setMedications(prev => prev.map(med => 
      med.id === medication.id ? { ...med, is_archived: !med.is_archived } : med
    ));
  };

  // 4. Handle History Click (Mocked)
  const handleHistoryClick = () => {
    // Even without a backend, let's just log it or show an alert for now
    alert("Medication History clicked! (Backend not connected yet)");
    // Future: navigate('/medication-history')
  };

  // 5. Filtering
  const filteredMeds = medications.filter(med => 
    activeTab === 'active' ? !med.is_archived : med.is_archived
  );

  return (
    <div className="d-flex flex-column h-100 p-3 bg-white">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
           <h1 className="fw-bold m-0 me-3" style={{ fontSize: '24px', color: '#000' }}>Medications</h1>
           <button 
             className="btn btn-sm d-flex align-items-center fw-bold"
             style={{ backgroundColor: 'rgba(0, 51, 204, 0.1)', color: '#0033CC', borderRadius: '8px' }}
             onClick={() => setShowModal(true)}
           >
             <Plus size={16} className="me-1" /> Add
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="d-flex mb-4 border-bottom" style={{ borderColor: '#DEDFE2' }}>
        <button 
          className="flex-grow-1 pb-2 fw-bold"
          style={{ 
            border: 'none', 
            borderBottom: activeTab === 'active' ? '3px solid #0033CC' : '2px solid transparent',
            background: 'transparent', 
            color: activeTab === 'active' ? '#0033CC' : '#000',
            fontSize: '15px'
          }}
          onClick={() => setActiveTab('active')}
        >
          Active ({medications.filter(m => !m.is_archived).length})
        </button>
        <button 
          className="flex-grow-1 pb-2 fw-bold"
          style={{ 
            border: 'none', 
            borderBottom: activeTab === 'archived' ? '3px solid #0033CC' : '2px solid transparent',
            background: 'transparent', 
            color: activeTab === 'archived' ? '#0033CC' : '#000',
            fontSize: '15px'
          }}
          onClick={() => setActiveTab('archived')}
        >
          Archived ({medications.filter(m => m.is_archived).length})
        </button>
      </div>

      {/* List */}
      {filteredMeds.length === 0 ? (
        <div className="text-center mt-5 text-muted">
          No {activeTab} medications found.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2 overflow-auto">
          {filteredMeds.map((med) => (
            <MedicationCard 
              key={med.id} 
              medication={med}
              onToggleArchive={handleToggleArchive}
            />
          ))}
        </div>
      )}

      {/* Bottom History Button - Responsive, No Hover */}
      <div className="mt-auto pt-4 pb-2"> 
        <button 
          className="btn w-100 fw-bold py-3" 
          style={{ 
            backgroundColor: '#DEDFE2', 
            color: '#000', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
          onClick={handleHistoryClick}
        >
          View Medication History
        </button>
      </div>

      {/* Modal */}
      <AddMedicationModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSave={handleAddSubmit}
        profile_id="some-profile-id"
      />
    </div>
  );
};

export default Medications;