//import React from 'react';

const Placeholder = ({ title }) => {
  return (
    <div className="d-flex flex-column h-100 p-3">
      <h1 className="fw-bold mb-4" style={{ fontSize: '24px', color: '#000' }}>{title}</h1>
      <div className="flex-grow-1 d-flex flex-column justify-content-center align-items-center text-center">
        <h5 className="fw-bold mb-2">{title} Screen</h5>
        <p className="text-muted mb-4" style={{ maxWidth: '250px', fontSize: '14px' }}>
          This page is assigned to a developer and is under construction.
        </p>
      </div>
    </div>
  );
};

export default Placeholder;