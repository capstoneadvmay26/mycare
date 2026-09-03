// src/pages/Onboarding.jsx
import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/useApp';
import Logo from '../components/ui/Logo';

const Onboarding = () => {
  const { setUserName, setIsOnboarded } = useApp();

  const [step, setStep] = useState('signup');
  const [method, setMethod] = useState('Phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  
  const [timer, setTimer] = useState(50);
  const [canResend, setCanResend] = useState(false);

  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  // Auto-focus first OTP input when OTP screen appears
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const startTimer = () => {
    setTimer(50);
    setCanResend(false);
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = () => {
    if (method === 'Phone' && !phone) return alert("Please enter your phone number");
    if (method === 'Email' && !email) return alert("Please enter your email address");
    startTimer();
    setStep('otp');
  };

  const handleResend = () => {
    startTimer();
  };

  const handleVerifyOTP = () => {
    if (otp.join('').length < 6) return alert("Please enter the 6-digit code");
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

  // Handle OTP input change with auto-advance
  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (cleanValue.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace to go to previous input
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp((prevOtp) => {
        const newOtp = [...prevOtp];
        digits.forEach((digit, idx) => {
          if (idx < 6) newOtp[idx] = digit;
        });
        return newOtp;
      });

      const lastIndex = Math.min(digits.length, 5);
      setTimeout(() => {
        inputRefs.current[lastIndex]?.focus();
      }, 0);
    }
  };

  // Input Styles
  const inputStyle = {
    width: '100%',
    height: '52px',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.5)',
    background: '#FFFFFF',
    outline: 'none',
    boxShadow: 'none',
    fontSize: '16px',
    padding: '0 14px',
    color: '#000',
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    height: '100%',
    border: 'none',
    borderBottom: isActive ? '3px solid #0033CC' : '1px solid #E0E0E0',
    background: 'transparent',
    color: isActive ? '#0033CC' : '#000',
    fontWeight: '600',
    outline: 'none',
    boxShadow: 'none',
    padding: '0 8px',
  });

  const primaryButtonStyle = {
    width: '100%',
    height: '52px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: '#0033CC',
    color: '#FFFFFF',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
  };

  const otpInputStyle = (hasValue) => ({
    height: '60px',
    width: '100%',
    maxWidth: '60px',
    fontSize: '24px',
    fontWeight: '700',
    borderRadius: '8px',
    backgroundColor: hasValue ? '#FFFFFF' : '#DEDFE2',
    border: hasValue ? '2px solid #0033CC' : '1px solid rgba(0,0,0,0.2)',
    outline: 'none',
    boxShadow: 'none',
    textAlign: 'center',
    color: '#000',
    transition: 'all 0.2s ease',
  });

  return (
    <div className="d-flex flex-column vh-100 bg-white px-3 px-sm-4 py-4 justify-content-between overflow-hidden mx-auto" style={{ maxWidth: '480px' }}>
      
      {/* STEP 1: SIGNUP */}
      {step === 'signup' && (
        <>
          {/* Header Section */}
          <div>
            <div className="d-flex justify-content-center mt-2 mb-3">
              <Logo height="70px" />
            </div>
            <h2 className="text-center fw-bold mb-2" style={{ fontSize: '24px' }}>Your Health, Our Priority</h2>
            <p className="text-center text-dark mb-0" style={{ fontSize: '14px' }}>Sign up to manage your medications and symptoms.</p>
          </div>

          {/* Form Controls Middle Section */}
          <div className="my-auto py-3">
            {/* Phone / Email Tabs */}
            <div className="d-flex border rounded-3 overflow-hidden mb-4" style={{ height: '50px', border: '1px solid rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <button 
                style={tabStyle(method === 'Phone')}
                onClick={() => setMethod('Phone')}
              >Phone</button>
              <button 
                style={tabStyle(method === 'Email')}
                onClick={() => setMethod('Email')}
              >Email</button>
            </div>

            {/* Input Box */}
            {method === 'Phone' ? (
              <input 
                type="tel" 
                style={inputStyle}
                placeholder="Enter your phone number" 
                className="mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            ) : (
              <input 
                type="email" 
                style={inputStyle}
                placeholder="Enter your email address" 
                className="mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            )}

            <button 
              style={primaryButtonStyle}
              onClick={handleSendOTP}
            >
              Send OTP
            </button>
          </div>

          {/* Footer Section */}
          <div>
            <div className="text-center mb-3">
              <p className="m-0 text-dark" style={{ fontSize: '13px' }}>By continuing, you agree to our</p>
              <p className="fw-bold m-0" style={{ fontSize: '13px', color: '#0033CC', cursor: 'pointer' }}>Terms & Privacy Policy</p>
            </div>

            <div className="d-flex align-items-center mb-2">
              <div className="flex-grow-1 border-top" style={{ borderColor: 'rgba(0,0,0,0.2)' }}></div>
              <span className="px-3 text-center text-dark" style={{ fontSize: '14px' }}>
                Already have an account? <span className="fw-bold" style={{ color: '#0033CC', cursor: 'pointer' }}>Log in</span>
              </span>
              <div className="flex-grow-1 border-top" style={{ borderColor: 'rgba(0,0,0,0.2)' }}></div>
            </div>
          </div>
        </>
      )}

      {/* STEP 2: OTP */}
      {step === 'otp' && (
        <>
          <button 
            className="btn p-0 border-0 text-dark align-self-start mb-2" 
            onClick={() => setStep('signup')}
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            ‹
          </button>
          
          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Enter OTP</h2>
            <p className="mb-4 text-secondary" style={{ fontSize: '15px' }}>
              We sent a 6-digit code to {method === 'Phone' ? phone : email}
            </p>
          </div>

          <div className="my-auto py-2 w-100">
            <div 
              className="d-flex justify-content-center gap-2 gap-sm-3 mb-4" 
              style={{ 
                width: '100%', 
                maxWidth: '400px', 
                margin: '0 auto',  
                flexWrap: 'nowrap'
              }}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  maxLength="1"
                  inputMode="numeric"
                  pattern="[0-9]"
                  style={{
                    ...otpInputStyle(!!digit),
                    flex: '1 1 0',       
                    width: 'auto',       
                    maxWidth: '60px',    
                    minWidth: '0'        
                  }}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                />
              ))}
            </div>

            {canResend ? (
              <p className="text-center fw-bold mt-2" style={{ color: '#0033CC', fontSize: '16px', cursor: 'pointer' }} onClick={handleResend}>
                Didn't get code? <u>Resend Code</u>
              </p>
            ) : (
              <p className="text-center fw-bold mt-2 text-dark" style={{ fontSize: '15px' }}>
                Didn't get code? Resend code in 00:{timer < 10 ? `0${timer}` : timer}
              </p>
            )}
          </div>

          <button 
            style={primaryButtonStyle}
            onClick={handleVerifyOTP}
          >
            Verify & Continue
          </button>
        </>
      )}

      {/* STEP 3: DETAILS */}
      {step === 'details' && (
        <>
          <button 
            className="btn p-0 border-0 text-dark align-self-start mb-2" 
            onClick={() => setStep('otp')}
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            ‹
          </button>
          
          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Tell us about yourself</h2>
            <p className="mb-3 text-secondary" style={{ fontSize: '14px' }}>This information helps us to personalize your experience and provide better care.</p>
          </div>

          <div className="my-auto py-2 w-100">
            <label className="fw-bold mb-2" style={{ fontSize: '15px' }}>Full Name</label>
            <input 
              type="text" 
              style={inputStyle} 
              className="mb-3"
              placeholder="Enter your full name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />

            <label className="fw-bold mb-2" style={{ fontSize: '15px' }}>Date of Birth</label>
            <input 
              type="date" 
              style={inputStyle} 
              className="mb-3"
              value={dob} 
              onChange={(e) => setDob(e.target.value)} 
            />

            <label className="fw-bold mb-2" style={{ fontSize: '15px' }}>Gender</label>
            <div className="d-flex flex-column gap-2 mb-3">
              {['Male', 'Female', 'Prefer not to say'].map((g) => (
                <button 
                  key={g} 
                  onClick={() => setGender(g)} 
                  className="btn text-start rounded-3 d-flex align-items-center" 
                  style={{ 
                    border: '1px solid #000', 
                    backgroundColor: gender === g ? 'rgba(0, 51, 204, 0.06)' : '#FFFFFF', 
                    color: '#000', 
                    outline: 'none', 
                    boxShadow: 'none',
                    padding: '10px 16px',
                  }}
                >
                  <div className="border border-dark rounded-circle me-3 d-flex justify-content-center align-items-center" style={{ width: '20px', height: '20px', flexShrink: 0 }}>
                    {gender === g && <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#0033CC' }}></div>}
                  </div>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button style={primaryButtonStyle} onClick={handleSubmitDetails}>Continue</button>
        </>
      )}

      {/* STEP 4: CREATE PASSWORD */}
      {step === 'password' && (
        <>
          <button 
            className="btn p-0 border-0 text-dark align-self-start mb-2" 
            onClick={() => setStep('details')}
            style={{ fontSize: '28px', lineHeight: 1 }}
          >
            ‹
          </button>
          
          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: '24px' }}>Set Password</h2>
            <p className="mb-3 text-secondary" style={{ fontSize: '14px' }}>Create a password to secure your account</p>
          </div>

          <div className="my-auto py-2 w-100">
            <label className="fw-bold mb-2" style={{ fontSize: '15px' }}>Password</label>
            <input 
              type="password" 
              style={inputStyle} 
              className="mb-3"
              placeholder="**********" 
            />

            <label className="fw-bold mb-2" style={{ fontSize: '15px' }}>Confirm Password</label>
            <input 
              type="password" 
              style={inputStyle} 
              className="mb-3"
              placeholder="**********" 
            />

            <p className="mb-0" style={{ fontSize: '13px', color: '#0033CC' }}>Password should be at least 8 characters</p>
          </div>

          <button style={primaryButtonStyle} onClick={handleCreateAccount}>Create Account</button>
        </>
      )}
    </div>
  );
};

export default Onboarding;