// src/pages/Dependents.jsx
import { useState } from 'react';
import { ChevronLeft, Plus } from 'react-bootstrap-icons';
import { useProfile } from '../context/ProfileContext';

const Dependents = ({ onBack }) => {
  const { profiles, activeProfile, addDependent } = useProfile();
  
  // Filter strictly by the isDependent flag (Which excludes "Me")
  const dependents = profiles.filter(p => p.isDependent === true);
  
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('Parent');

  // THIS IS THE FIX! Save dependent AND close modal immediately
  const handleAdd = () => {
    if (!newName) return alert("Please enter a name");
    
    addDependent({ name: newName, relationship: newRelationship });
    
    // Close the modal
    setShowModal(false);
    
    // Clear the inputs
    setNewName('');
    setNewRelationship('Parent');
    
    // Let the user know
    alert("Dependent added successfully!");
  };

  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
        <button className="btn p-0 border-0" onClick={onBack}><ChevronLeft size={28} /></button>
        <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '24px' }}>Dependents</h1>
      </div>

      <div className="p-3">
        <p className="mb-4 text-secondary">Manage your profile and those of your dependents.</p>

        <p className="fw-bold mb-2">Current Profile</p>
        <div className="d-flex align-items-center border rounded-3 p-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)' }}>
          <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
               style={{ width: '32px', height: '32px', backgroundColor: activeProfile.color, fontSize: '16px' }}>
            {activeProfile.initial}
          </div>
          <span className="flex-grow-1 fw-bold">{activeProfile.name} (Me)</span>
          <div className="border rounded px-3 py-1 text-secondary" style={{ fontSize: '12px' }}>You</div>
        </div>

        <p className="fw-bold mb-2">Dependents</p>
        {dependents.map((dep) => (
          <div key={dep.id} className="d-flex align-items-center p-3 mb-3" style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <div className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
                 style={{ width: '32px', height: '32px', backgroundColor: dep.color, fontSize: '16px' }}>
              {dep.initial}
            </div>
            <div className="flex-grow-1">
              <p className="m-0 fw-bold">{dep.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 mt-auto">
        <button className="btn w-100 py-3 fw-bold text-white d-flex justify-content-center align-items-center gap-2"
                style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
                onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Dependent
        </button>
      </div>

      {/* Inline Add Dependent Modal */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
             style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white p-4 rounded-3 w-100" style={{ maxWidth: '400px' }}>
            <h5 className="fw-bold mb-3">Add Dependent</h5>
            
            <label className="fw-bold mb-1">Name</label>
            <input className="form-control mb-3" placeholder="e.g. Grandma" value={newName} onChange={(e) => setNewName(e.target.value)} />
            
            <label className="fw-bold mb-1">Relationship</label>
            <select className="form-control mb-4" value={newRelationship} onChange={(e) => setNewRelationship(e.target.value)}>
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Child">Child</option>
              <option value="Other">Other</option>
            </select>

            <button className="btn w-100 text-white fw-bold mb-2" style={{ backgroundColor: '#0033CC' }} onClick={handleAdd}>
              Save Dependent
            </button>
            <button className="btn w-100 fw-bold" style={{ backgroundColor: '#FFF', border: '1px solid #0033CC', color: '#0033CC' }} onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dependents;