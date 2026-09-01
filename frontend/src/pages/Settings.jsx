// src/pages/Settings.jsx
import { useState } from 'react';
import { 
  Bell, ClockHistory, Globe2, MoonStars, MoonStarsFill, BoxSeam, 
  Lock, Fingerprint, ShieldCheck, InfoCircle, 
  ChevronRight 
} from 'react-bootstrap-icons';
import Notifications from './Notifications';
import { useTheme } from '../context/ThemeContext';
import Logo from '../components/ui/Logo'; 
import Reminders from './Reminders';

// ==========================================
// GLOBAL REUSABLE TOGGLE COMPONENT (OUTSIDE)
// ==========================================
const Toggle = ({ isOn, onClick }) => (
  <div 
    onClick={onClick}
    className="rounded-pill d-flex align-items-center"
    style={{
      width: '48px', height: '28px',
      backgroundColor: isOn ? '#0033CC' : 'rgba(107,114,128,0.5)',
      justifyContent: isOn ? 'flex-end' : 'flex-start',
      padding: '2px', cursor: 'pointer', transition: 'all 0.2s'
    }}
  >
    <div className="rounded-circle bg-white shadow-sm" style={{ width: '24px', height: '24px' }}></div>
  </div>
);

// Define Sub-screens OUTSIDE the Settings component to avoid ESLint errors

const SimpleScreen = ({ title, onBack, children }) => (
  <div className="d-flex flex-column h-100">
    <div className="d-flex align-items-center p-3 border-bottom" style={{ position: 'relative' }}>
      <button className="btn p-0 border-0" onClick={onBack}>
        <ChevronRight size={28} className="rotate-180" />
      </button>
      <h1 className="fw-bold m-0 ms-3" style={{ fontSize: '24px' }}>{title}</h1>
    </div>
    <div className="p-3 flex-grow-1">
      {children}
    </div>
  </div>
);

const LanguageScreen = ({ onBack }) => {
  const [selected, setSelected] = useState('English');
  const options = ['English', 'Yoruba', 'Hausa', 'Igbo', 'French'];
  
  return (
    <SimpleScreen title="Language" onBack={onBack}>
      <p className="text-secondary mb-3">Choose your preferred language</p>
      <div className="border rounded-3 overflow-hidden">
        {options.map((lang, idx) => (
          <div 
            key={lang} 
            className="d-flex align-items-center p-3 border-bottom"
            style={{ cursor: 'pointer', backgroundColor: selected === lang ? 'rgba(0,51,204,0.05)' : 'transparent', borderBottom: idx === options.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.1)' }}
            onClick={() => setSelected(lang)}
          >
            <p className="m-0 flex-grow-1 fw-bold" style={{ fontSize: '16px' }}>{lang}</p>
            {selected === lang && <span style={{ color: '#0033CC', fontWeight: 'bold' }}>✓</span>}
          </div>
        ))}
      </div>
    </SimpleScreen>
  );
};

const UnitsScreen = ({ onBack }) => {
  const [selected, setSelected] = useState('Metric');
  const options = ['Metric', 'Imperial'];
  
  return (
    <SimpleScreen title="Units" onBack={onBack}>
      <p className="text-secondary mb-3">Choose your measurement unit</p>
      <div className="border rounded-3 overflow-hidden">
        {options.map((unit, idx) => (
          <div 
            key={unit} 
            className="d-flex align-items-center p-3"
            style={{ cursor: 'pointer', backgroundColor: selected === unit ? 'rgba(0,51,204,0.05)' : 'transparent', borderBottom: idx === options.length - 1 ? 'none' : '1px solid rgba(0,0,0,0.1)' }}
            onClick={() => setSelected(unit)}
          >
            <p className="m-0 flex-grow-1 fw-bold" style={{ fontSize: '16px' }}>{unit}</p>
            {selected === unit && <span style={{ color: '#0033CC', fontWeight: 'bold' }}>✓</span>}
          </div>
        ))}
      </div>
    </SimpleScreen>
  );
};

const ChangePasswordScreen = ({ onBack }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  
  const handleSave = () => {
    if (!password || password.length < 8) return alert("Password must be at least 8 characters");
    if (password !== confirm) return alert("Passwords do not match");
    alert("Password changed successfully!");
    onBack();
  };
  
  return (
    <SimpleScreen title="Change Password" onBack={onBack}>
      <div className="mb-3">
        <label className="fw-bold mb-2">New Password</label>
        <input type="password" className="form-control" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="mb-3">
        <label className="fw-bold mb-2">Confirm New Password</label>
        <input type="password" className="form-control" placeholder="********" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <p className="text-secondary mb-4" style={{ fontSize: '12px' }}>Password should be at least 8 characters</p>
      
      <button className="btn w-100 py-3 fw-bold text-white" style={{ backgroundColor: '#0033CC', borderRadius: '8px' }} onClick={handleSave}>
        Save New Password
      </button>
    </SimpleScreen>
  );
};

const PrivacyScreen = ({ onBack }) => {
  const [shareData, setShareData] = useState(true);
  
  return (
    <SimpleScreen title="Privacy" onBack={onBack}>
      <div className="d-flex align-items-center p-3 border rounded-3 mb-3">
        <div className="flex-grow-1">
          <p className="m-0 fw-bold">Share Health Data</p>
          <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Allow us to use anonymous data to improve features</p>
        </div>
        {/* Use Global Toggle */}
        <Toggle isOn={shareData} onClick={() => setShareData(!shareData)} />
      </div>
      <p className="text-secondary">We take your privacy seriously. You can contact us at any time to delete your data.</p>
    </SimpleScreen>
  );
};

// Professional About Screen
const AboutScreen = ({ onBack }) => {
  return (
    <SimpleScreen title="About MyCare" onBack={onBack}>
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <Logo />
         <p className="m-0 text-secondary" style={{ fontSize: '14px' }}>Your Health, Our Priority</p>
      </div>

      <div className="border rounded-3 overflow-hidden mb-4">
        <div className="p-3 border-bottom">
          <p className="m-0 text-secondary" style={{ fontSize: '13px' }}>About</p>
          <p className="m-0" style={{ fontSize: '15px' }}>MyCare is a mobile health platform designed to help individuals and caregivers manage medications, track symptoms, and stay organized.</p>
        </div>
        
        <div className="p-3 border-bottom d-flex justify-content-between">
          <span className="text-secondary" style={{ fontSize: '15px' }}>Version</span>
          <span style={{ fontSize: '15px' }}>1.0.0</span>
        </div>

        <div className="p-3 border-bottom d-flex justify-content-between">
          <span className="text-secondary" style={{ fontSize: '15px' }}>Developer</span>
          <span style={{ fontSize: '15px' }}>BeTechiFied May 2026 Consortium</span>
        </div>

        <div className="p-3 d-flex justify-content-between">
          <span className="text-secondary" style={{ fontSize: '15px' }}>Contact</span>
          <span style={{ fontSize: '15px', color: '#0033CC' }}>info@mycare-consortium.com</span>
        </div>
      </div>

      <p className="text-center text-secondary" style={{ fontSize: '12px' }}>© 2026 MyCare. All rights reserved.</p>
    </SimpleScreen>
  );
};

// NEW: Biometric Screen (Quick toggle)
const BiometricScreen = ({ onBack }) => {
  const [biometric, setBiometric] = useState(true);
  
  return (
    <SimpleScreen title="Biometric & Passcode" onBack={onBack}>
      <div className="d-flex align-items-center py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
        <Fingerprint size={24} className="me-3" />
        <div className="flex-grow-1">
          <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Enable Biometrics</p>
          <p className="m-0 text-secondary" style={{ fontSize: '12px' }}>Use Face ID or Fingerprint to unlock the app</p>
        </div>
        {/* Use Global Toggle */}
        <Toggle isOn={biometric} onClick={() => setBiometric(!biometric)} />
      </div>
      
      <p className="text-secondary mt-3" style={{ fontSize: '13px' }}>For added security, we recommend keeping Biometrics enabled.</p>
      
      <button 
        className="btn w-100 py-3 fw-bold text-white mt-3" 
        style={{ backgroundColor: '#0033CC', borderRadius: '8px', opacity: biometric ? 1 : 0.5 }}
        onClick={() => alert("Setting up Passcode...")}
      >
        Set Up Passcode
      </button>
    </SimpleScreen>
  );
};

// NEW: App Version Screen (Quick info page)
const AppVersionScreen = ({ onBack }) => {
  return (
    <SimpleScreen title="App Version" onBack={onBack}>
      <div className="d-flex flex-column align-items-center text-center mb-4">
        <Logo />
        <p className="text-secondary" style={{ fontSize: '16px' }}>Version 1.0.0 (Build 1)</p>
      </div>

      <div className="border rounded-3 overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between">
          <span className="text-secondary">Latest Version</span>
          <span style={{ color: '#4CBB17', fontWeight: 'bold' }}>Up to date</span>
        </div>
        <div className="p-3 border-bottom d-flex justify-content-between">
          <span className="text-secondary">Release Date</span>
          <span>September 1, 2026</span>
        </div>
        <div className="p-3 d-flex justify-content-between">
          <span className="text-secondary">OS Support</span>
          <span>Web, Android & iOS</span>
        </div>
      </div>
    </SimpleScreen>
  );
};

const Settings = () => {
  const [currentScreen, setCurrentScreen] = useState('menu');
  const { isDark, toggleTheme } = useTheme();

  if (currentScreen === 'notifications') {
    return <Notifications onBack={() => setCurrentScreen('menu')} />;
  }
  if (currentScreen === 'language') return <LanguageScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'units') return <UnitsScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'password') return <ChangePasswordScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'privacy') return <PrivacyScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'about') return <AboutScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'biometric') return <BiometricScreen onBack={() => setCurrentScreen('menu')} />;
  if (currentScreen === 'version') return <AppVersionScreen onBack={() => setCurrentScreen('menu')} />;
  
  // Reminders is now its own screen!
  if (currentScreen === 'reminders') return <Reminders onBack={() => setCurrentScreen('menu')} />;

  const rowStyle = { 
    cursor: 'pointer', 
    borderBottom: '1px solid rgba(0,0,0,0.1)' 
  };

  return (
    <div className="d-flex flex-column h-100">
      <div className="d-flex justify-content-center align-items-center p-3 border-bottom">
        <h1 className="fw-bold m-0" style={{ fontSize: '24px' }}>Settings</h1>
      </div>

      <div className="overflow-auto px-3 py-3">
        
        <p className="text-secondary fw-bold mb-2 mt-3" style={{ fontSize: '20px' }}>Preferences</p>
        
        <div className="border rounded-3 overflow-hidden mb-4">
          
          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('notifications')}>
            <Bell size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Notifications</p>
              <p className="m-0 text-secondary" style={{ fontSize: '13px' }}>Manage your alerts & reminders</p>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('reminders')}>
            <ClockHistory size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Reminders</p>
              <p className="m-0 text-secondary" style={{ fontSize: '13px' }}>Manage medication & check-in reminders</p>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('language')}>
            <Globe2 size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Language</p>
            </div>
            <span className="text-secondary me-2">English</span>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={toggleTheme}>
            {isDark ? <MoonStarsFill size={24} /> : <MoonStars size={24} />}
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Theme</p>
            </div>
            <span className="text-secondary me-2">{isDark ? 'Dark' : 'Light'}</span>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={{ ...rowStyle, borderBottom: 'none' }} onClick={() => setCurrentScreen('units')}>
            <BoxSeam size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Units</p>
            </div>
            <span className="text-secondary me-2">Standard</span>
            <ChevronRight size={20} className="text-secondary" />
          </div>
        </div>

        <p className="text-secondary fw-bold mb-2 mt-3" style={{ fontSize: '20px' }}>Account & Security</p>
        
        <div className="border rounded-3 overflow-hidden mb-4">
          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('password')}>
            <Lock size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Change Password</p>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('biometric')}>
            <Fingerprint size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Biometric & Passcode</p>
            </div>
            <span className="text-secondary me-2">On</span>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={{ ...rowStyle, borderBottom: 'none' }} onClick={() => setCurrentScreen('privacy')}>
            <ShieldCheck size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>Privacy</p>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </div>
        </div>

        <p className="text-secondary fw-bold mb-2 mt-3" style={{ fontSize: '20px' }}>About</p>

        <div className="border rounded-3 overflow-hidden mb-4">
          <div className="d-flex align-items-center p-3" style={rowStyle} onClick={() => setCurrentScreen('about')}>
            <InfoCircle size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>About MyCare</p>
            </div>
            <ChevronRight size={20} className="text-secondary" />
          </div>

          <div className="d-flex align-items-center p-3" style={{ ...rowStyle, borderBottom: 'none' }} onClick={() => setCurrentScreen('version')}>
            <InfoCircle size={24} />
            <div className="flex-grow-1 ms-3">
              <p className="m-0 fw-bold" style={{ fontSize: '16px' }}>App Version</p>
            </div>
            <span className="text-secondary me-2">1.0.0</span>
            <ChevronRight size={20} className="text-secondary" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;