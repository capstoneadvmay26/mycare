// src/pages/CheckIn.jsx
import { useState } from 'react';
import { ChevronLeft, EmojiSmile, EmojiNeutral, EmojiFrown } from 'react-bootstrap-icons';

const CheckIn = ({ symptom = 'Headache', onBack, onComplete }) => {
  const [day, setDay] = useState(1); // 1, 2, or 3
  const [responses, setResponses] = useState([]);
  
  const options = [
    { label: 'Better', desc: 'My symptoms are improving', color: '#4CBB17', icon: <EmojiSmile size={46} color="#4CBB17" /> },
    { label: 'Same', desc: 'About the same', color: '#000', icon: <EmojiNeutral size={46} color="#000" /> },
    { label: 'Worse', desc: 'My symptoms are worse', color: '#D92D20', icon: <EmojiFrown size={46} color="#D92D20" /> },
  ];

  const handleSelect = (status) => {
    const newResponses = [...responses, status];
    setResponses(newResponses);

    // PRD Logic: If any 'Worse', or 2+ 'Same'/'Worse' over 3 days -> Nudge
    const hasWorse = newResponses.includes('Worse');
    const nonBetterCount = newResponses.filter(r => r !== 'Better').length;

    if (day < 3) {
      setDay(day + 1);
    } else if (hasWorse || nonBetterCount >= 2) {
      onComplete('nudge');
    } else {
      onComplete('closed'); // Trending better, quietly go back home
    }
  };

  const skipForNow = () => {
    onComplete('skipped');
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex align-items-center p-3 border-bottom">
        <button className="btn p-0 border-0" onClick={onBack}><ChevronLeft size={28} /></button>
        <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '20px' }}>
          Check-in • Day {day} of 3
        </h1>
      </div>

      <div className="d-flex flex-column justify-content-center flex-grow-1 p-4">
        <p className="text-secondary mb-2" style={{ fontSize: '14px' }}>{symptom}</p>
        <h2 className="fw-bold mb-4" style={{ fontSize: '24px' }}>
          How are you feeling compared to yesterday?
        </h2>

        <div className="d-flex flex-column gap-3">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              className="d-flex align-items-center p-3 bg-white"
              style={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', textAlign: 'left' }}
            >
              <div className="me-3">{opt.icon}</div>
              <div>
                <p className="m-0 fw-bold" style={{ fontSize: '16px', color: opt.color }}>{opt.label}</p>
                <p className="m-0 text-secondary" style={{ fontSize: '13px' }}>{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <button className="btn p-0 border-0 align-self-center mt-4 text-secondary" style={{ fontSize: '14px' }} onClick={skipForNow}>
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default CheckIn;