//import React from 'react';
import { ChevronRight } from 'react-bootstrap-icons';

const Home = ({ userName }) => {
  return (
    <div className="d-flex flex-column h-100 p-3">
      <div className="mb-4 mt-2">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px', color: '#000' }}>Good morning, {userName || 'Tolu'}</h1>
        <p className="m-0" style={{ fontSize: '15px', color: '#000' }}>Today, Wed Aug 12</p>
      </div>

      {/* Adherence */}
      <div className="bg-white rounded-3 p-3 mb-4 shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.1)' }}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="m-0 mb-1" style={{ fontSize: '16px' }}>Today’s Adherence</p>
            <p className="m-0 mb-2 fw-bold" style={{ fontSize: '20px' }}>1 of 3 doses taken</p>
            <p className="m-0" style={{ fontSize: '12px' }}>Streak: 5 days</p>
          </div>
          <div className="d-flex justify-content-center align-items-center rounded-circle" style={{ width: '80px', height: '80px', border: '8px solid #E5E7EB', borderTop: '8px solid rgba(0, 51, 204, 0.9)' }}>
            <span className="fw-bold" style={{ fontSize: '20px' }}>33%</span>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <h6 className="fw-bold mb-3" style={{ fontSize: '20px', color: '#000' }}>Schedule</h6>
      
      <div className="d-flex flex-column gap-3">
        <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(217, 45, 32, 0.06)', border: '1.05px solid rgba(217, 45, 32, 0.3)', borderRadius: '8px' }}>
          <div className="d-flex justify-content-between mb-2">
            <span style={{ fontSize: '16px', color: '#D92D20' }}>Due Now</span>
            <span style={{ fontSize: '12px', color: '#D92D20' }}>1 medication</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#128276;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>Amlodipine</p>
              <p className="m-0" style={{ fontSize: '13px' }}>5mg</p>
              <p className="m-0" style={{ fontSize: '13px' }}>8:00am</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        </div>

        <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(247, 200, 27, 0.06)', border: '1.05px solid rgba(247, 200, 27, 0.3)', borderRadius: '8px' }}>
          <div className="d-flex justify-content-between mb-2">
            <span style={{ fontSize: '16px', color: '#F7C81B' }}>Upcoming</span>
            <span style={{ fontSize: '12px', color: '#000' }}>2 medication</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#9200;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>Metformin</p>
              <p className="m-0" style={{ fontSize: '13px' }}>500mg</p>
              <p className="m-0" style={{ fontSize: '13px' }}>12:00pm</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        </div>

        <div className="rounded-3 p-3" style={{ backgroundColor: 'rgba(76, 187, 23, 0.06)', border: '1.05px solid rgba(76, 187, 23, 0.3)', borderRadius: '8px' }}>
          <div className="d-flex justify-content-between mb-2">
            <span style={{ fontSize: '16px', color: '#4CBB17' }}>Completed</span>
            <span style={{ fontSize: '12px', color: '#000' }}>2 medication</span>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3" style={{ fontSize: '34px' }}>&#9989;</div>
            <div>
              <p className="m-0 fw-bold" style={{ fontSize: '20px' }}>Atorvastatin</p>
              <p className="m-0" style={{ fontSize: '13px' }}>20mg</p>
              <p className="m-0" style={{ fontSize: '13px' }}>9:00pm</p>
            </div>
            <ChevronRight size={20} className="ms-auto" color="#000" />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button className="btn w-100 py-3 fw-bold" style={{ backgroundColor: 'rgba(0, 51, 204, 0.06)', color: '#0033CC', borderRadius: '8px' }}>
          View full schedule
        </button>
      </div>
    </div>
  );
};

export default Home;