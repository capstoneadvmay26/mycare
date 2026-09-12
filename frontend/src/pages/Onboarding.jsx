// src/pages/Onboarding.jsx
import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/useApp";
import Logo from "../components/ui/Logo";
import { requestOtp, verifyOtp, register, login } from "../services/api";

const Onboarding = () => {
  const {
    setUserName,
    setIsOnboarded,
    setAuthScreen,
    setOnboardingStage, 
  } = useApp();

  // ============================================================
  // STATE
  // ============================================================
  const [step, setStep] = useState("signup");
  const [method, setMethod] = useState("Email"); // default to Email (backend supports both)
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

  // ============================================================
  // EFFECTS
  // ============================================================
  useEffect(() => {
    if (step === "otp" && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // ============================================================
  // TIMER
  // ============================================================
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

  // ============================================================
  // OTP
  // ============================================================
  const handleSendOTP = async () => {
    const identifier = method === "Phone" ? phone : email;

    if (!identifier) {
      setError(`Please enter your ${method.toLowerCase()}`);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await requestOtp(method.toLowerCase(), identifier);
      console.log("[Onboarding] OTP sent:", response.data);

      startTimer();
      setStep("otp");
      setSuccessMessage("✓ OTP sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("[Onboarding] OTP error:", err);

      const message = err.response?.data?.message || "";
      if (err.response?.status === 409) {
        // Account exists → offer sign in
        setError(
          "An account already exists with this identifier. Please sign in instead.",
        );
      } else {
        setError(message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
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
      console.log("[Onboarding] OTP verified:", response.data);

      if (response.data.token) {
        // ✅ This is the REGISTRATION token — used only for /register
        localStorage.setItem("mycare_token", response.data.token);
      }

      // Both new and existing users can reach here
      // But signup flow is designed for NEW users
      if (response.data.is_new_user) {
        setStep("details");
        setError("");
      } else {
        // Already registered — send them to sign in
        localStorage.removeItem("mycare_token");
        setError(
          "This account already exists. Please sign in with your password.",
        );
        setAuthScreen("signin");
      }
    } catch (err) {
      console.error("[Onboarding] Verification error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    handleSendOTP();
  };

  // ============================================================
  // OTP INPUT
  // ============================================================
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

  // ============================================================
  // DETAILS + REGISTER
  // ============================================================
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

    const payload = {
      full_name: name.trim(),
      date_of_birth: dob,
      gender: gender || "Prefer not to say",
      password: password,
    };

    console.log("[Onboarding] Registration payload:", payload);

    try {
      // 1️⃣ REGISTER (uses the registration token in localStorage)
      const response = await register(payload);
      console.log("[Onboarding] Registration successful:", response.data);

      const identifier = method === "Phone" ? phone : email;

      // 2️⃣ AUTO-LOGIN with the same credentials
      try {
        const loginResponse = await login(identifier, password);
        console.log("[Onboarding] Auto-login successful:", loginResponse.data);

        // Overwrite the registration token with the full login token
        if (loginResponse.data.token) {
          localStorage.setItem("mycare_token", loginResponse.data.token);
        }
        if (loginResponse.data.user) {
          localStorage.setItem(
            "mycare_user",
            JSON.stringify(loginResponse.data.user),
          );
        }
        setUserName(loginResponse.data.user?.full_name || name);
      } catch (loginErr) {
        console.warn(
          "[Onboarding] Auto-login failed, user will need to sign in:",
          loginErr,
        );
        // Registration succeeded, but auto-login failed.
        // Send them to sign-in screen.
        localStorage.removeItem("mycare_token");
        setAuthScreen("signin");
        return;
      }

      // Set the post-signup onboarding stage so the app routes to
      // the "Account Created" success screen, then the wizard.
      setOnboardingStage("account-created");
      setIsOnboarded(true);
    } catch (err) {
      console.error("========== REGISTRATION ERROR ==========");
      console.error("Status:", err.response?.status);
      console.error("Payload sent:", JSON.stringify(payload, null, 2));
      console.error(
        "Response data:",
        JSON.stringify(err.response?.data, null, 2),
      );
      console.error("========================================");

      const validationErrors = err.response?.data?.errors;
      if (Array.isArray(validationErrors) && validationErrors.length > 0) {
        const first = validationErrors[0];
        setError(`${first.field}: ${first.message}`);
      } else if (
        typeof validationErrors === "object" &&
        validationErrors !== null
      ) {
        const firstKey = Object.keys(validationErrors)[0];
        const firstMessage = Array.isArray(validationErrors[firstKey])
          ? validationErrors[firstKey][0]
          : validationErrors[firstKey];
        setError(`${firstKey}: ${firstMessage}`);
      } else {
        setError(
          err.response?.data?.message ||
            `Registration failed (${err.response?.status || "network error"})`,
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STYLES
  // ============================================================
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

  // ============================================================
  // RENDER
  // ============================================================
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

      {/* STEP 1: SIGNUP */}
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
            <div
              className="d-flex rounded-3 overflow-hidden mb-4"
              style={{ height: "50px", borderRadius: "8px" }}
            >
              <button
                style={tabStyle(method === "Phone")}
                onClick={() => {
                  setMethod("Phone");
                  setError("");
                }}
              >
                Phone
              </button>
              <button
                style={tabStyle(method === "Email")}
                onClick={() => {
                  setMethod("Email");
                  setError("");
                }}
              >
                Email
              </button>
            </div>

            {method === "Phone" ? (
              <input
                type="tel"
                style={inputStyle}
                placeholder="Enter your phone number (e.g. +2348012345678)"
                className="mb-4"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />
            ) : (
              <input
                type="email"
                style={inputStyle}
                placeholder="Enter your email address"
                className="mb-4"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
              />
            )}

            <button
              style={primaryButtonStyle}
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send OTP"}
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
              />
              <span
                className="px-3 text-center text-dark"
                style={{ fontSize: "14px" }}
              >
                Already have an account?{" "}
                <span
                  className="fw-bold"
                  style={{ color: "#0033CC", cursor: "pointer" }}
                  onClick={() => setAuthScreen("signin")}
                >
                  Log in
                </span>
              </span>
              <div
                className="flex-grow-1 border-top"
                style={{ borderColor: "rgba(0,0,0,0.2)" }}
              />
            </div>
          </div>
        </>
      )}

      {/* STEP 2: OTP */}
      {step === "otp" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => {
              setStep("signup");
              setError("");
            }}
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

      {/* STEP 3: DETAILS */}
      {step === "details" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => {
              setStep("otp");
              setError("");
            }}
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
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
            />

            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Date of Birth
            </label>
            <input
              type="date"
              style={inputStyle}
              className="mb-3"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value);
                setError("");
              }}
            />

            <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
              Gender
            </label>
            <div className="d-flex flex-column gap-2 mb-3">
              {["Male", "Female", "Prefer not to say"].map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setGender(g);
                    setError("");
                  }}
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
                      />
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

      {/* STEP 4: PASSWORD */}
      {step === "password" && (
        <>
          <button
            className="btn p-0 border-0 text-dark align-self-start mb-2"
            onClick={() => {
              setStep("details");
              setError("");
            }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
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
