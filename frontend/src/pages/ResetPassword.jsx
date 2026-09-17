// src/pages/ResetPassword.jsx
import { useState } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { resetPassword } from "../services/api";
import Logo from "../components/ui/Logo";

/**
 * Read the reset token ONCE from the URL.
 * Using a lazy initializer avoids the React 19 warning about
 * calling setState synchronously inside useEffect.
 */
const readTokenFromUrl = () => {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("token") || "";
};

const ResetPassword = () => {
  const { setAuthScreen } = useApp();

  // Lazy initializers — run once, no effect needed
  const [token] = useState(readTokenFromUrl);
  const [error, setError] = useState(() =>
    readTokenFromUrl()
      ? ""
      : "Missing reset token. Please use the link from your email again."
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    if (!token) {
      setError("Missing reset token.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await resetPassword(token, password);
      setSuccess(true);

      // 🆕 Clean token from URL (so it doesn't linger in browser history)
      try {
        window.history.replaceState(
          {},
          "",
          window.location.pathname
        );
      } catch (err) {
        console.warn("[ResetPassword] URL cleanup failed:", err.message);
      }

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        setAuthScreen("signin");
      }, 3000);
    } catch (err) {
      console.error("[ResetPassword] error:", err);
      setError(
        err.response?.data?.message ||
          "Could not reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // Styles
  // ------------------------------------------------------------
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

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------
  return (
    <div
      className="d-flex flex-column vh-100 bg-white px-3 px-sm-4 py-4 justify-content-between overflow-hidden mx-auto"
      style={{ maxWidth: "480px" }}
    >
      <div>
        <div className="d-flex justify-content-center mt-2 mb-3">
          <Logo height="70px" />
        </div>
        <h2
          className="text-center fw-bold mb-2"
          style={{ fontSize: "24px" }}
        >
          Set New Password
        </h2>
        <p
          className="text-center text-dark mb-0"
          style={{ fontSize: "14px" }}
        >
          Choose a strong password you'll remember.
        </p>
      </div>

      {success ? (
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
            Password updated
          </h5>
          <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
            Your password has been changed. Redirecting to sign in…
          </p>
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
            New password
          </label>
          <div className="position-relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              style={inputStyle}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              disabled={loading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="btn position-absolute top-50 end-0 translate-middle-y border-0 p-2"
              onClick={() => setShowPassword((v) => !v)}
              style={{ color: "#666" }}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
            Confirm password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            style={inputStyle}
            className="mb-4"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
            }}
            disabled={loading}
            autoComplete="new-password"
          />

          <button
            type="submit"
            style={primaryButtonStyle}
            disabled={loading || !token}
          >
            {loading ? "Updating..." : "Update password"}
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

export default ResetPassword;