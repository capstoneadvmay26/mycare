import { useState, useEffect, useRef } from 'react';
import Logo from '../components/ui/Logo';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-calendar3" viewBox="0 0 16 16">
    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z"/>
    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  </svg>
);

const Onboarding = ({ onComplete, setUserName }) => {
  const [step, setStep] = useState('signup');
  const [method, setMethod] = useState('Phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(50);
  const [isResendEnabled, setIsResendEnabled] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  
  const datePickerRef = useRef(null);

  useEffect(() => {
    if (step !== 'otp' || timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsResendEnabled(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = () => {
    const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(fakeOtp);
    setOtp(fakeOtp.split(''));
    setTimer(50);
    setIsResendEnabled(false);
    setStep('otp');
  };

  const handleResend = () => {
    const fakeOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(fakeOtp);
    setOtp(fakeOtp.split(''));
    setTimer(50);
    setIsResendEnabled(false);
  };

  const handleContinue = () => {
    setUserName(name);
    setStep('password');
  };

  // NEW: This function handles the "Skip for now" button!
  const handleSkip = () => {
    setStep('password'); // Goes to password without saving name
  };

  const openDatePicker = () => {
    if (datePickerRef.current) {
      datePickerRef.current.showPicker();
    }
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

          <div className="d-flex border rounded-3 mb-3 overflow-hidden" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <button 
              className="btn flex-fill rounded-0" 
              style={{ backgroundColor: method === 'Phone' ? 'rgba(0, 51, 204, 0.06)' : 'transparent', color: method === 'Phone' ? '#0033CC' : '#000', fontWeight: '600' }}
              onClick={() => setMethod('Phone')}
            >Phone</button>
            <button 
              className="btn flex-fill rounded-0" 
              style={{ backgroundColor: method === 'Email' ? 'rgba(0, 51, 204, 0.06)' : 'transparent', color: method === 'Email' ? '#0033CC' : '#000', fontWeight: '600' }}
              onClick={() => setMethod('Email')}
            >Email</button>
          </div>

          {method === 'Phone' ? (
            <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
              <input type="text" className="form-control border-0 p-0" placeholder="+234 903 336 5589" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          ) : (
            <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
              <input type="email" className="form-control border-0 p-0" placeholder="tolu@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          )}

          <button className="btn text-white w-100 py-3 fw-bold mb-4" style={{ backgroundColor: '#0033CC', borderRadius: '8px' }} onClick={handleSendOTP}>Send OTP</button>
          <p className="text-center text-secondary mb-1" style={{ fontSize: '14px' }}>By continuing, you agree to our</p>
          <p className="text-center fw-bold" style={{ fontSize: '14px', color: '#0033CC' }}>Terms & Privacy Policy</p>
        </>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('signup')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
          <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Enter OTP</h2>
          <p className="mb-4 text-secondary" style={{ fontSize: '16px' }}>We sent a 6-digit code to {method === 'Phone' ? phone : email}</p>

          <div className="d-flex gap-3 mb-4">
            {otp.map((digit, idx) => (
              <input key={idx} type="text" maxLength="1" className="form-control text-center fw-bold" value={digit}
                onChange={(e) => { const newOtp = [...otp]; newOtp[idx] = e.target.value; setOtp(newOtp); }}
                style={{ height: '60px', fontSize: '24px', borderRadius: '8px', backgroundColor: '#DEDFE2', border: '1px solid rgba(0,0,0,0.2)' }} />
            ))}
          </div>

          {isResendEnabled ? (
            <p className="text-center fw-bold mt-3" style={{ color: '#0033CC', fontSize: '16px', cursor: 'pointer' }} onClick={handleResend}>Didn't get code? <u>Resend Code</u></p>
          ) : (
            <p className="text-center fw-bold mt-3" style={{ color: '#0033CC', fontSize: '16px' }}>Didn't get code? Resend code in 00:{timer < 10 ? `0${timer}` : timer}</p>
          )}

          <p className="text-center text-muted mt-2" style={{ fontSize: '13px' }}>(Simulation: Your OTP is <strong>{generatedOtp}</strong>)</p>

          <button className="btn text-white w-100 py-3 fw-bold mt-auto" style={{ backgroundColor: '#0033CC', borderRadius: '8px' }} onClick={() => setStep('demographics')}>Verify & Continue</button>
        </>
      )}

      {/* STEP 3: DEMOGRAPHICS */}
      {step === 'demographics' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('otp')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
          <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Tell us about yourself</h2>
          <p className="mb-4 text-secondary" style={{ fontSize: '14px' }}>This information helps us to personalize your experience.</p>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Full Name</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input type="text" className="form-control border-0 p-0" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Date of Birth</label>
          <div className="border rounded-3 d-flex align-items-center px-3 mb-4" style={{ borderColor: 'rgba(0,0,0,0.2)', height: '50px' }}>
            <input 
              type="text" 
              className="form-control border-0 p-0" 
              placeholder="Enter your date of birth" 
              value={dob} 
              readOnly
              style={{ cursor: 'pointer' }}
              onClick={openDatePicker}
            />
            <input 
              ref={datePickerRef}
              type="date" 
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '0', height: '0' }} 
            />
            <button 
              className="btn p-0 border-0" 
              style={{ color: '#33363F' }}
              onClick={openDatePicker}
            >
              <CalendarIcon />
            </button>
          </div>

          <label className="fw-bold mb-2" style={{ fontSize: '16px' }}>Gender</label>
          <div className="d-flex flex-column gap-2 mb-4">
            {['Male', 'Female', 'Prefer not to say'].map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`btn text-start border rounded-3 d-flex align-items-center`} style={{ borderColor: 'rgba(0,0,0,0.2)', backgroundColor: gender === g ? 'rgba(0,51,204,0.06)' : '#FFFFFF', color: '#000' }}>
                <div className="border border-dark rounded-circle me-3 d-flex justify-content-center align-items-center" style={{ width: '22px', height: '22px' }}>
                  {gender === g && <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#0033CC' }}></div>}
                </div>
                {g}
              </button>
            ))}
          </div>

          <button className="btn text-white w-100 py-3 fw-bold mb-2" style={{ backgroundColor: '#0033CC', borderRadius: '8px' }} onClick={handleContinue}>Continue</button>
          <button className="btn w-100 py-3 fw-bold" style={{ color: '#0033CC' }} onClick={handleSkip}>Skip for now</button>
        </>
      )}

      {/* STEP 4: PASSWORD */}
      {step === 'password' && (
        <>
          <button className="btn p-0 border-0 text-dark align-self-start mb-4" onClick={() => setStep('demographics')}><span style={{ fontSize: '24px' }}>&#8249;</span></button>
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

          <button className="btn text-white w-100 py-3 fw-bold mt-auto" style={{ backgroundColor: '#0033CC', borderRadius: '8px' }} onClick={onComplete}>Create Account</button>
        </>
      )}
    </div>
  );
};

export default Onboarding;