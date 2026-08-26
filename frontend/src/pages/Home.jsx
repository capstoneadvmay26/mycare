// src/pages/Home.jsx
<<<<<<< Updated upstream
import { ChevronRight } from 'react-bootstrap-icons';

const Home = ({ userName }) => {
  // PRD: Section 4.4 (Daily Medication Schedule)
  // Mock data until backend is connected
=======
import { useApp } from '../context/useApp';
import { ChevronRight } from 'react-bootstrap-icons';


const Home = () => {
  // Pull the user's name directly from Context!
  const { userName } = useApp(); 

  // PRD: Section 4.4 (Daily Medication Schedule)
>>>>>>> Stashed changes
  const schedule = {
    dueNow: [{ name: 'Amlodipine', dosage: '5mg', time: '8:00am' }],
    upcoming: [{ name: 'Metformin', dosage: '500mg', time: '12:00pm' }],
    completed: [{ name: 'Atorvastatin', dosage: '20mg', time: '9:00pm' }]
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
<<<<<<< Updated upstream
      {/* Greeting */}
=======
      {/* Greeting - NOW USES THE CONTEXT USERNAME! */}
>>>>>>> Stashed changes
      <div className="mb-4 mt-2">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px', color: '#000' }}>
          Good morning, {userName || 'Tolu'}
        </h1>
        <p className="m-0" style={{ fontSize: '15px', color: '#000' }}>Today, Wed Aug 12</p>
      </div>

      {/* Adherence Card */}
      <div className="bg-white rounded-3 p-3 mb-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="m-0 mb-1" style={{ fontSize: '16px' }}>Today’s Adherence</p>
            <p className="m-0 mb-2 fw-bold" style={{ fontSize: '20px' }}>1 of 3 doses taken</p>
            <p className="m-0" style={{ fontSize: '12px' }}>Streak: 5 days</p>
          </div>
          {/* Donut Chart Placeholder */}
          <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', border: '8px solid #E5E7EB', borderTop: '8px solid rgba(0, 51, 204, 0.9)' }}>
            <span className="fw-bold" style={{ fontSize: '20px' }}>33%</span>
          </div>
        </div>
      </div>

      {/* Schedule Section */}
      <h6 className="fw-bold mb-3" style={{ fontSize: '20px' }}>Schedule</h6>
      
      {/* Due Now */}
      <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: 'rgba(217, 45, 32, 0.06)', border: '1.05px solid rgba(217, 45, 32, 0.3)', borderRadius: '8px' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#D92D20' }}>Due Now</span>
          <span style={{ fontSize: '12px', color: '#D92D20' }}>{schedule.dueNow.length} medication</span>
        </div>
        {schedule.dueNow.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#128276;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>{med.name}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.dosage}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="rounded-3 p-3 mb-3" style={{ backgroundColor: 'rgba(247, 200, 27, 0.06)', border: '1.05px solid rgba(247, 200, 27, 0.3)', borderRadius: '8px' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#F7C81B' }}>Upcoming</span>
          <span style={{ fontSize: '12px', color: '#000' }}>{schedule.upcoming.length} medication</span>
        </div>
        {schedule.upcoming.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#9200;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>{med.name}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.dosage}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        ))}
      </div>

      {/* Completed */}
      <div className="rounded-3 p-3 mb-4" style={{ backgroundColor: 'rgba(76, 187, 23, 0.06)', border: '1.05px solid rgba(76, 187, 23, 0.3)', borderRadius: '8px' }}>
        <div className="d-flex justify-content-between mb-2">
          <span style={{ fontSize: '16px', color: '#4CBB17' }}>Completed</span>
          <span style={{ fontSize: '12px', color: '#000' }}>{schedule.completed.length} medication</span>
        </div>
        {schedule.completed.map((med, idx) => (
          <div key={idx} className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#9989;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>{med.name}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.dosage}</p>
              <p className="m-0" style={{ fontSize: '13px' }}>{med.time}</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        ))}
      </div>

      {/* View Schedule Button */}
      <div className="mt-auto">
        <button className="btn w-100 py-3 fw-bold" style={{ backgroundColor: 'rgba(0, 51, 204, 0.06)', color: '#0033CC', borderRadius: '8px' }}>
          View full schedule
        </button>
      </div>
    </div>
  );
};

export default Home;