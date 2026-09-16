import { Offcanvas } from 'react-bootstrap';
import { House, Capsule, HeartPulse, Clock, People, Gear, QuestionCircle, BoxArrowRight } from 'react-bootstrap-icons';

const MobileDrawer = ({ isOpen, onClose, userName, currentTab, onTabChange, onLogout }) => {
  const navItems = ['Home', 'Medications', 'Symptoms', 'History', 'Profiles', 'Settings', 'Help & Support'];
  
  const getIcon = (item) => {
    switch(item) {
      case 'Home': return <House size={22} />;
      case 'Medications': return <Capsule size={22} />;
      case 'Symptoms': return <HeartPulse size={22} />;
      case 'History': return <Clock size={22} />;
      case 'Profiles': return <People size={22} />;
      case 'Settings': return <Gear size={22} />;
      case 'Help & Support': return <QuestionCircle size={22} />;
      default: return <Gear size={22} />;
    }
  };

  return (
    /* Hidden entirely on 768px and above (d-md-none) */
    <Offcanvas show={isOpen} onHide={onClose} placement="start" className="w-75 d-md-none">
      <Offcanvas.Header closeButton className="pb-0">
        <Offcanvas.Title className="w-100 d-flex align-items-center">
          <div 
            className="rounded-circle overflow-hidden me-3 d-flex justify-content-center align-items-center text-white fw-bold border" 
            style={{ width: '48px', height: '48px', backgroundColor: '#0033CC', borderColor: 'rgba(0,0,0,0.25)!important', fontSize: '18px' }}
          >
            {userName ? userName.charAt(0).toUpperCase() : 'T'}
          </div>
          <span className="fw-bold" style={{ fontSize: '24px', color: '#000' }}>Menu</span>
        </Offcanvas.Title>
      </Offcanvas.Header>
      
      <Offcanvas.Body className="pt-3">
        <div className="d-flex flex-column gap-4">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => { onTabChange(item); onClose(); }}
              className="btn d-flex align-items-center justify-content-start border-0 p-0"
              style={{ 
                fontSize: '16px', 
                fontWeight: currentTab === item ? '700' : '600',
                color: currentTab === item ? '#0033CC' : '#000'
              }}
            >
              <span className="me-3" style={{ color: currentTab === item ? '#0033CC' : '#000' }}>
                {getIcon(item)}
              </span>
              {item}
            </button>
          ))}
          
          <hr style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '10px 0' }} />
          
          <button 
            className="btn d-flex align-items-center justify-content-start border-0 p-0"
            style={{ fontSize: '16px', fontWeight: '600', color: '#D92D20' }}
            onClick={onLogout}
          >
            <BoxArrowRight size={22} className="me-3" />
            Log out
          </button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default MobileDrawer;