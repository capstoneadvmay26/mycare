// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { forgotPassword } from "../services/api";
import Logo from "../components/ui/Logo";

const ForgotPassword = () => {
  const { setAuthScreen } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!identifier.trim()) {
      setError("Please enter your email or phone.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await forgotPassword(identifier.trim());
      setSent(true);
    } catch (err) {
      console.error("[ForgotPassword] error:", err);
      setError(
        err.response?.data?.message ||
          "Could not send reset instructions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div
      className="d-flex flex-column vh-100 bg-white px-3 px-sm-4 py-4 justify-content-between overflow-hidden mx-auto"
      style={{ maxWidth: "480px" }}
    >
      <div>
        <div className="d-flex justify-content-center mt-2 mb-3">
          <Logo height="70px" />
        </div>
        <h2 className="text-center fw-bold mb-2" style={{ fontSize: "24px" }}>
          Forgot Password
        </h2>
        <p
          className="text-center text-dark mb-0"
          style={{ fontSize: "14px" }}
        >
          Enter your email or phone and we'll send you a link to reset your
          password.
        </p>
      </div>

      {sent ? (
        <div className="my-auto py-3 text-center">
          <div
            className="rounded-circle d-flex justify-content-center align-items-center mx-auto mb-3"
            style={{
              width: "72px",
              height: "72px",
              backgroundColor: "rgba(76, 187, 23, 0.12)",
            }}
          >
            <span style={{ fontSize: "32px" }}>✅</span>
          </div>
          <h5 className="fw-bold mb-2" style={{ fontSize: "18px" }}>
            Check your inbox
          </h5>
          <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
            If an account exists for <strong>{identifier}</strong>, we've sent
            instructions to reset your password. The link expires in 15 minutes.
          </p>
          <button
            type="button"
            style={primaryButtonStyle}
            onClick={() => setAuthScreen("signin")}
          >
            Back to Sign In
          </button>
        </div>
      ) : (
        <form className="my-auto py-3" onSubmit={handleSubmit}>
          {error && (
            <div
              className="alert alert-danger py-2 mb-3"
              style={{ fontSize: "14px" }}
            >
              {error}
            </div>
          )}

          <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
            Email or phone
          </label>
          <input
            type="text"
            style={inputStyle}
            className="mb-4"
            placeholder="Enter your email or phone"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="username"
          />

          <button
            type="submit"
            style={primaryButtonStyle}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}

      <div className="d-flex justify-content-center">
        <button
          type="button"
          className="btn p-0 border-0 fw-bold d-flex align-items-center"
          style={{ color: "#0033CC", fontSize: "14px" }}
          onClick={() => setAuthScreen("signin")}
        >
          <ChevronLeft size={18} className="me-1" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;