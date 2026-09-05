// src/pages/Onboarding.jsx
import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/useApp";
import Logo from "../components/ui/Logo";
import { requestOtp, verifyOtp, register } from "../services/auth";

const Onboarding = () => {
  const { setUserName, setIsOnboarded } = useApp();

  const [step, setStep] = useState("signup");
  const [method, setMethod] = useState("Phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [timer, setTimer] = useState(50);
  const [canResend, setCanResend] = useState(false);

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 200);
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

  // ✅ SIMPLIFIED: Just go to OTP screen immediately
  const handleSendOTP = () => {
    const identifier = method === "Phone" ? phone : email;

    if (!identifier) {
      setError(`Please enter your ${method.toLowerCase()}`);
      return;
    }

    // ✅ Clear any previous errors and go to OTP
    setError("");
    setSuccessMessage("");
    startTimer();
    setStep("otp");

    console.log("[DEV] Moving to OTP screen for:", identifier);

    // ✅ Try sending OTP in background (don't block UI)
    requestOtp(method.toLowerCase(), identifier)
      .then((response) => {
        console.log("OTP sent (background):", response.data);
        setSuccessMessage("✓ OTP sent successfully under Normal Mode! This is Testing Mode!  Please any any 6 digits for now!");
        setTimeout(() => setSuccessMessage(""), 10000);
      })
      .catch((err) => {
        console.log("[DEV] OTP send failed (expected):", err.message);
        setError("⚠️ DEV MODE: Enter any 6 digits to bypass OTP");
        setTimeout(() => setError(""), 5000);
      });
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join("");

    if (otpString.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const identifier = method === "Phone" ? phone : email;
      const response = await verifyOtp(
        method.toLowerCase(),
        identifier,
        otpString,
      );
      console.log("OTP verified:", response.data);

      if (response.data.token) {
        localStorage.setItem("mycare_token", response.data.token);

        if (response.data.user) {
          localStorage.setItem(
            "mycare_user",
            JSON.stringify(response.data.user),
          );
        }

        if (response.data.is_new_user) {
          setStep("details");
          setError("");
        } else {
          setUserName(response.data.user?.full_name || "User");
          setIsOnboarded(true);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    startTimer();
    setError("⚠️ DEV MODE: Enter any 6 digits to bypass OTP");
    setTimeout(() => setError(""), 5000);

    const identifier = method === "Phone" ? phone : email;
    requestOtp(method.toLowerCase(), identifier)
      .then((response) => console.log("OTP resent:", response.data))
      .catch((err) => console.log("OTP resend failed:", err.message));
  };

  const handleSubmitDetails = () => {
    if (!name) {
      setError("Please enter your full name");
      return;
    }
    if (!dob) {
      setError("Please enter your date of birth");
      return;
    }
    setStep("password");
    setError("");
  };

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await register({
        full_name: name,
        date_of_birth: dob,
        gender: gender || "Prefer not to say",
        password: password,
      });
      console.log("Registration successful:", response.data);

      if (response.data.token) {
        localStorage.setItem("mycare_token", response.data.token);
      }

      if (response.data.user) {
        localStorage.setItem("mycare_user", JSON.stringify(response.data.user));
        setUserName(response.data.user.full_name);
      }

      setIsOnboarded(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    if (cleanValue.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("");
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

  // Styles

  const inputStyle = {
    width: "100%",
    height: "52px",
    borderRadius: "8px",
    border: "1px solid rgba(0, 0, 0, 0.5)",
    background: "#FFFFFF",
    outline: "none",
    boxShadow: "none",
    fontSize: "16px",
    padding: "0 14px",
    color: "#000",
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    height: "100%",
    border: "none",
    borderBottom: isActive ? "3px solid #0033CC" : "none",
    background: "transparent",
    color: isActive ? "#0033CC" : "#000",
    fontWeight: "600",
    outline: "none",
    boxShadow: "none",
    padding: "0 8px",
  });

  const primaryButtonStyle = {
    width: "100%",
    height: "52px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    backgroundColor: loading ? "#999" : "#0033CC",
    color: "#FFFFFF",
    border: "none",
    outline: "none",
    boxShadow: "none",
    opacity: loading ? 0.7 : 1,
  };

  const otpInputStyle = (hasValue) => ({
    height: "60px",
    width: "100%",
    maxWidth: "60px",
    fontSize: "24px",
    fontWeight: "700",
    borderRadius: "8px",
    backgroundColor: hasValue ? "#FFFFFF" : "#DEDFE2",
    border: hasValue ? "2px solid #0033CC" : "1px solid rgba(0,0,0,0.2)",
    outline: "none",
    boxShadow: "none",
    textAlign: "center",
    color: "#000",
    transition: "all 0.2s ease",
  });

  // ✅ DEBUG: Log current step
  console.log("[Onboarding] Current step:", step);

  return (
    <div
      className="d-flex flex-column vh-100 bg-white px-3 px-sm-4 py-4 justify-content-between overflow-hidden mx-auto"
      style={{ maxWidth: "480px" }}
    >
      {error && (
        <div
          className="alert alert-danger py-2 mb-2"
          style={{ fontSize: "14px" }}
        >
          {error}
        </div>
      )}
      {successMessage && (
        <div
          className="alert alert-success py-2 mb-2"
          style={{ fontSize: "14px" }}
        >
          {successMessage}
        </div>
      )}

      {step === "signup" && (
        <>
          <div>
            <div className="d-flex justify-content-center mt-2 mb-3">
              <Logo height="70px" />
            </div>
            <h2
              className="text-center fw-bold mb-2"
              style={{ fontSize: "24px" }}
            >
              Your Health, Our Priority
            </h2>
            <p
              className="text-center text-dark mb-0"
              style={{ fontSize: "14px" }}
            >
              Sign up to manage your medications and symptoms.
            </p>
          </div>

          <div className="my-auto py-3">
            {/* AFTER */}
            <div
              className="d-flex rounded-3 overflow-hidden mb-4"
              style={{ height: "50px", borderRadius: "8px" }}
            >
              <button
                style={tabStyle(method === "Phone")}
                onClick={() => setMethod("Phone")}
              >
                Phone
              </button>
              <button
                style={tabStyle(method === "Email")}
                onClick={() => setMethod("Email")}
              >
                Email
              </button>
            </div>

            {method === "Phone" ? (
              <input
                type="tel"
                style={inputStyle}
                placeholder="Enter your phone number"
                className="mb-4"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            ) : (
              <input
                type="email"
                style={inputStyle}
                placeholder="Enter your email address"
                className="mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            )}

            <button
              style={primaryButtonStyle}
              onClick={handleSendOTP}
              disabled={loading}
            >
              Send OTP
            </button>
          </div>

          <div>
            <div className="text-center mb-3">
              <p className="m-0 text-dark" style={{ fontSize: "13px" }}>
                By continuing, you agree to our
              </p>
              <p
                className="fw-bold m-0"
                style={{
                  fontSize: "13px",
                  color: "#0033CC",
                  cursor: "pointer",
                }}
              >
                Terms & Privacy Policy
              </p>
            </div>
            <div className="d-flex align-items-center mb-2">
              <div
                className="flex-grow-1 border-top"
                style={{ borderColor: "rgba(0,0,0,0.2)" }}
              ></div>
              <span
                className="px-3 text-center text-dark"
                style={{ fontSize: "14px" }}
              >
                Already have an account?{" "}
                <span
                  className="fw-bold"
                  style={{ color: "#0033CC", cursor: "pointer" }}
                >
                  Log in
                </span>
              </span>
              <div
                className="flex-grow-1 border-top"
                style={{ borderColor: "rgba(0,0,0,0.2)" }}
              ></div>
            </div>
          </div>
        </>
      )}

      {step === "otp" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => setStep("signup")}
            style={{ fontSize: "28px", lineHeight: 1 }}
          >
            ‹
          </button>

          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: "24px" }}>
              Enter OTP
            </h2>
            <p className="mb-4 text-secondary" style={{ fontSize: "15px" }}>
              We sent a 6-digit code to {method === "Phone" ? phone : email}
            </p>
          </div>

          <div className="my-auto py-2 w-100">
            <div
              className="d-flex justify-content-center gap-2 gap-sm-3 mb-4"
              style={{
                width: "100%",
                maxWidth: "400px",
                margin: "0 auto",
                flexWrap: "nowrap",
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
                    flex: "1 1 0",
                    width: "auto",
                    maxWidth: "60px",
                    minWidth: "0",
                  }}
                  className="otp-input"
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  disabled={loading}
                />
              ))}
            </div>

            {canResend ? (
              <p
                className="text-center fw-bold mt-2"
                style={{
                  color: "#0033CC",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={handleResend}
              >
                Didn't get code? <u>Resend Code</u>
              </p>
            ) : (
              <p
                className="text-center fw-bold mt-2 text-dark"
                style={{ fontSize: "15px" }}
              >
                Didn't get code? Resend code in 00:
                {timer < 10 ? `0${timer}` : timer}
              </p>
            )}
          </div>

          <button
            style={primaryButtonStyle}
            onClick={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        </>
      )}

      {step === "details" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => setStep("otp")}
            style={{ fontSize: "28px", lineHeight: 1 }}
          >
            ‹
          </button>

          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: "24px" }}>
              Tell us about yourself
            </h2>
            <p className="mb-3 text-secondary" style={{ fontSize: "14px" }}>
              This information helps us to personalize your experience and
              provide better care.
            </p>
          </div>

          <div className="my-auto py-2 w-100">
            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Full Name
            </label>
            <input
              type="text"
              style={inputStyle}
              className="mb-3"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Date of Birth
            </label>
            <input
              type="date"
              style={inputStyle}
              className="mb-3"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Gender
            </label>
            <div className="d-flex flex-column gap-2 mb-3">
              {["Male", "Female", "Prefer not to say"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className="btn text-start rounded-3 d-flex align-items-center"
                  style={{
                    border: "1px solid #000",
                    backgroundColor:
                      gender === g ? "rgba(0, 51, 204, 0.06)" : "#FFFFFF",
                    color: "#000",
                    outline: "none",
                    boxShadow: "none",
                    padding: "10px 16px",
                  }}
                >
                  <div
                    className="border border-dark rounded-circle me-3 d-flex justify-content-center align-items-center"
                    style={{ width: "20px", height: "20px", flexShrink: 0 }}
                  >
                    {gender === g && (
                      <div
                        className="rounded-circle"
                        style={{
                          width: "10px",
                          height: "10px",
                          backgroundColor: "#0033CC",
                        }}
                      ></div>
                    )}
                  </div>
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            style={primaryButtonStyle}
            onClick={handleSubmitDetails}
            disabled={loading}
          >
            Continue
          </button>
        </>
      )}

      {step === "password" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => setStep("details")}
            style={{ fontSize: "28px", lineHeight: 1 }}
          >
            ‹
          </button>

          <div>
            <h2 className="fw-bold mb-2" style={{ fontSize: "24px" }}>
              Set Password
            </h2>
            <p className="mb-3 text-secondary" style={{ fontSize: "14px" }}>
              Create a password to secure your account
            </p>
          </div>

          <div className="my-auto py-2 w-100">
            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Password
            </label>
            <input
              type="password"
              style={inputStyle}
              className="mb-3"
              placeholder="**********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Confirm Password
            </label>
            <input
              type="password"
              style={inputStyle}
              className="mb-3"
              placeholder="**********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <p className="mb-0" style={{ fontSize: "13px", color: "#0033CC" }}>
              Password should be at least 8 characters
            </p>
          </div>

          <button
            style={primaryButtonStyle}
            onClick={handleCreateAccount}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </>
      )}
    </div>
  );
};

export default Onboarding;
