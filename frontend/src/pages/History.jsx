// src/pages/History.jsx
import { useState } from 'react';
import { JournalCheck, JournalX, HeartPulse, ChevronRight } from 'react-bootstrap-icons';

const History = () => {
  const [activeTab, setActiveTab] = useState('All');

  // PRD: Detailed history logs with date grouping
  const historyData = [
    {
      date: 'Today, Aug 30',
      items: [
        { id: 1, type: 'Medication', name: 'Amlodipine 5mg', status: 'Taken', time: '8:00 AM', iconColor: '#4CBB17' },
        { id: 2, type: 'Symptom', name: 'Headache', status: 'Moderate', time: '10:30 AM', iconColor: '#F7C81B' },
      ]
    },
    {
      date: 'Yesterday, Aug 29',
      items: [
        { id: 3, type: 'Medication', name: 'Metformin 500mg', status: 'Taken', time: '12:00 PM', iconColor: '#4CBB17' },
        { id: 4, type: 'Medication', name: 'Atorvastatin 20mg', status: 'Skipped', time: '9:00 PM', iconColor: '#D92D20' },
      ]
    }
  ];

  const filteredData = historyData.map(group => ({
    ...group,
    items: group.items.filter(item => activeTab === 'All' || item.type === activeTab)
  })).filter(group => group.items.length > 0);

  const getActionIcon = (status) => {
    if (status === 'Taken') return <JournalCheck size={16} color="#4CBB17" />;
    if (status === 'Skipped') return <JournalX size={16} color="#D92D20" />;
    return <HeartPulse size={16} color="#F7C81B" />;
  };

  return (
    <div className="d-flex flex-column h-100 p-3 bg-white">
      {/* Header */}
      <h1 className="fw-bold mb-4" style={{ fontSize: '24px', color: '#000' }}>History</h1>

      {/* Tabs */}
      <div className="d-flex mb-4 border-bottom" style={{ borderColor: '#DEDFE2' }}>
        {['All', 'Medication', 'Symptom'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-grow-1 pb-2 fw-bold"
            style={{
              border: 'none',
              borderBottom: activeTab === tab ? '3px solid #0033CC' : '2px solid transparent',
              background: 'transparent',
              color: activeTab === tab ? '#0033CC' : '#000',
              fontSize: '15px'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="d-flex flex-column overflow-auto">
        {filteredData.length === 0 ? (
          <div className="text-center mt-5 text-muted">No history found.</div>
        ) : (
          filteredData.map((group, idx) => (
            <div key={idx} className="mb-4">
              {/* Date Header */}
              <p className="text-secondary fw-bold mb-2" style={{ fontSize: '13px' }}>{group.date}</p>
              
              {/* Items */}
              <div className="d-flex flex-column gap-2">
                {group.items.map((item) => (
                  <div
                    key={item.id}
                    className="d-flex align-items-center justify-content-between bg-white p-3"
                    style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <div
                        className="d-flex justify-content-center align-items-center rounded-3 me-3"
                        style={{
                          width: '42px',
                          height: '42px',
                          backgroundColor: `${item.iconColor}15`, // 15 is hex for 8% opacity
                          color: item.iconColor,
                          flexShrink: 0
                        }}
                      >
                        {getActionIcon(item.status)}
                      </div>
                      <div>
                        <p className="m-0 fw-bold" style={{ fontSize: '15px', color: '#000' }}>{item.name}</p>
                        <p className="m-0" style={{ fontSize: '13px', color: '#666' }}>{item.time}</p>
                      </div>
                    </div>
                    <div className="text-end">
                      <span
                        className="fw-bold"
                        style={{ fontSize: '12px', color: item.iconColor }}
                      >
                        {item.status}
                      </span>
                      <ChevronRight size={18} className="ms-2" color="#999" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;