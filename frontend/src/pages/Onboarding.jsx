// src/pages/Onboarding.jsx
import { useState } from 'react';
import { useApp } from '../context/useApp';
import Logo from '../components/ui/Logo';

const Onboarding = () => {
  const { setUserName, setIsOnboarded } = useApp();

  const [step, setStep] = useState('signup');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const handleSendOTP = () => {
    if (!phone) return alert("Please enter your phone number");
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    if (otp.join('').length < 6) {
      alert("Please enter the 6-digit code");
      return;
    }
    setStep('details');
  };

  const handleSubmitDetails = () => {
    setUserName(name);
    setStep('password');
  };

  const handleCreateAccount = () => {
    if (!name) setUserName('User');
    setIsOnboarded(true);
  };

  return (
    <div className="d-flex flex-column vh-100 bg-white px-4 py-4 overflow-auto">
      
      {/* STEP 1: SIGNUP */}
      {step === 'signup' && (
        <>
          <div className="d-flex justify-content-center mb-5 mt-4">
            <Logo height="80px" />
          </div>
          <h2 className="text-center fw-bold mb-2" style={{ fontSize: '24px' }}>Your Health, Our Priority</h2>
          <p className="text-center mb-5" style={{ fontSize: '14px', color: 'rgba(0,0,0,0.7)' }}>Sign up to manage your medications and symptoms.</p>

          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input 
              type="text" 
              className="form-control border-0 p-0" 
              placeholder="+234 903 336 5589" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <button 
            className="btn text-white w-100 py-3 fw-bold mb-4" 
            style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
            onClick={handleSendOTP}
          >
            Send OTP
          </button>

          <p className="text-center text-secondary mb-1" style={{ fontSize: '14px' }}>By continuing, you agree to our</p>
          <p className="text-center fw-bold" style={{ fontSize: '14px', color: '#0033CC' }}>Terms & Privacy Policy</p>
        </>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('signup')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
          <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Enter OTP</h2>
          <p className="mb-4 text-secondary" style={{ fontSize: '16px' }}>We sent a 6-digit code to {phone}</p>

          <div className="d-flex gap-3 mb-4">
            {otp.map((digit, idx) => (
              <input 
                key={idx} 
                type="text" 
                maxLength="1" 
                className="form-control text-center fw-bold" 
                value={digit}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value;
                  setOtp(newOtp);
                }}
                style={{ height: '60px', fontSize: '24px', borderRadius: '8px', backgroundColor: '#DEDFE2', border: '1px solid rgba(0,0,0,0.2)' }}
              />
            ))}
          </div>

          <p className="mb-4" style={{ fontSize: '14px', color: '#0033CC' }}>Didn't get the code? Resend code</p>

          <button 
            className="btn text-white w-100 py-3 fw-bold mt-auto" 
            style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
            onClick={handleVerifyOTP}
          >
            Verify & Continue
          </button>
        </>
      )}

      {/* STEP 3: TELL US ABOUT YOURSELF */}
      {step === 'details' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('otp')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
          <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Tell us about yourself</h2>
          <p className="mb-4 text-secondary" style={{ fontSize: '14px' }}>This information helps us to personalize your experience and provide better care.</p>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Full Name</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input type="text" className="form-control border-0 p-0" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Date of Birth with Figma Icon */}
          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Date of Birth</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px', position: 'relative' }}>
            <input 
              type="date" 
              className="form-control border-0 p-0"
              style={{ 
                backgroundColor: 'transparent', 
                WebkitAppearance: 'none', 
                MozAppearance: 'textfield',
                appearance: 'none' 
              }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            <span style={{ position: 'absolute', right: '16px', pointerEvents: 'none', fontSize: '20px', color: '#000' }}>
              &#128197;
            </span>
          </div>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Gender</label>
          <div className="d-flex flex-column gap-2 mb-4">
            {['Male', 'Female', 'Prefer not to say'].map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`btn text-start border rounded-3 d-flex align-items-center`} style={{ borderColor: 'rgba(0,0,0,0.2)', backgroundColor: gender === g ? 'rgba(0, 51, 204, 0.06)' : '#FFFFFF', color: '#000' }}>
                <div className="border border-dark rounded-circle me-3 d-flex justify-content-center align-items-center" style={{ width: '22px', height: '22px' }}>
                  {gender === g && <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#0033CC' }}></div>}
                </div>
                {g}
              </button>
            ))}
          </div>

          <button 
            className="btn text-white w-100 py-3 fw-bold mb-2" 
            style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
            onClick={handleSubmitDetails}
          >
            Continue
          </button>
        </>
      )}

      {/* STEP 4: CREATE PASSWORD */}
      {step === 'password' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('details')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
          <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Set Password</h2>
          <p className="mb-4 text-secondary" style={{ fontSize: '14px' }}>Create a password to secure your account</p>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Password</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input type="password" className="form-control border-0 p-0" placeholder="**********" />
          </div>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Confirm Password</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input type="password" className="form-control border-0 p-0" placeholder="**********" />
          </div>

          <p className="mb-4" style={{ fontSize: '14px', color: '#0033CC' }}>Password should be at least 8 characters</p>

          <button 
            className="btn text-white w-100 py-3 fw-bold mt-auto" 
            style={{ backgroundColor: '#0033CC', borderRadius: '8px' }}
            onClick={handleCreateAccount}
          >
            Create Account
          </button>
        </>
      )}
    </div>
  );
};

export default Onboarding;