// src/pages/HelpSupport.jsx
import { useState } from 'react';
import { 
  QuestionCircle, Headphones, Book, HeartPulse, GeoAlt, 
  ChatDots, Envelope, Telephone, ChevronRight, ChevronLeft 
} from 'react-bootstrap-icons';

const HelpSupport = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('hub'); // 'hub' | 'contact'

  if (currentView === 'contact') {
    return (
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <div className="d-flex align-items-center p-3 border-bottom">
          <button className="btn p-0 border-0 me-3" onClick={() => setCurrentView('hub')}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="fw-bold m-0" style={{ fontSize: '20px' }}>Contact Us</h1>
        </div>

        {/* Content */}
        <div className="p-3 flex-grow-1 overflow-auto">
          <p className="text-secondary mb-4" style={{ fontSize: '14px' }}>
            How would you like to reach us?
          </p>

          <div className="d-flex flex-column gap-3">
            {/* Live Chat */}
            <div className="border rounded-3 p-3 shadow-sm bg-white cursor-pointer">
              <div className="d-flex align-items-start gap-3">
                <ChatDots size={24} className="text-primary mt-1" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">Live Chat</h6>
                  <p className="text-secondary small mb-2">Chat with our support team</p>
                  <span className="badge bg-light text-dark border">Available 8am - 8pm daily</span>
                </div>
                <ChevronRight size={18} className="text-secondary mt-1" />
              </div>
            </div>

            {/* Email Us */}
            <a 
              href="mailto:suupport@mycare.com" 
              className="border rounded-3 p-3 shadow-sm bg-white text-decoration-none text-dark d-block"
            >
              <div className="d-flex align-items-start gap-3">
                <Envelope size={24} className="text-primary mt-1" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">Email Us</h6>
                  <p className="text-secondary small mb-1">Send us an email</p>
                  <span className="fw-semibold text-primary small">suupport@mycare.com</span>
                </div>
                <ChevronRight size={18} className="text-secondary mt-1" />
              </div>
            </a>

            {/* Call Us */}
            <a 
              href="tel:+2348881119999" 
              className="border rounded-3 p-3 shadow-sm bg-white text-decoration-none text-dark d-block"
            >
              <div className="d-flex align-items-start gap-3">
                <Telephone size={24} className="text-primary mt-1" />
                <div className="flex-grow-1">
                  <h6 className="fw-bold mb-1">Call Us</h6>
                  <p className="text-secondary small mb-1">Speak with our support team</p>
                  <span className="fw-semibold text-primary small">+234 888 111 9999</span>
                </div>
                <ChevronRight size={18} className="text-secondary mt-1" />
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <div className="d-flex align-items-center p-3 border-bottom">
        {onBack && (
          <button className="btn p-0 border-0 me-3" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="fw-bold m-0" style={{ fontSize: '20px' }}>Help & Support</h1>
      </div>

      {/* Main Hub Menu */}
      <div className="p-3 flex-grow-1 overflow-auto">
        {/* Get Help Section */}
        <p className="text-secondary fw-bold mb-2" style={{ fontSize: '14px' }}>Get Help</p>
        <div className="border rounded-3 overflow-hidden mb-4">
          <div className="d-flex align-items-center p-3 border-bottom cursor-pointer">
            <QuestionCircle size={22} className="me-3 text-secondary" />
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>FAQs</p>
              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Find answers to common questions</p>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          <div 
            className="d-flex align-items-center p-3 border-bottom cursor-pointer"
            onClick={() => setCurrentView('contact')}
          >
            <Headphones size={22} className="me-3 text-secondary" />
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>Contact Us</p>
              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Chat or email our support team</p>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3 cursor-pointer">
            <Book size={22} className="me-3 text-secondary" />
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>User Guide</p>
              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Learn how to use MyCare</p>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>
        </div>

        {/* Resources Section */}
        <p className="text-secondary fw-bold mb-2" style={{ fontSize: '14px' }}>Resources</p>
        <div className="border rounded-3 overflow-hidden">
          <div className="d-flex align-items-center p-3 border-bottom cursor-pointer">
            <HeartPulse size={22} className="me-3 text-secondary" />
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>Health Resources</p>
              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Trusted health information</p>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3 cursor-pointer">
            <GeoAlt size={22} className="me-3 text-secondary" />
            <div className="flex-grow-1">
              <p className="m-0 fw-bold" style={{ fontSize: '15px' }}>Find Care</p>
              <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Find doctors and facilities near you</p>
            </div>
            <ChevronRight size={18} className="text-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;