// src/pages/SignIn.jsx
import { useState } from "react";
import { useApp } from "../context/useApp";
import Logo from "../components/ui/Logo";
import { login } from "../services/api";


const SignIn = () => {
  const {
    setUserName,
    setAuthScreen,
    setWelcomeName,
  } = useApp();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e?.preventDefault?.();

    if (!identifier || !password) {
      setError("Please enter both email/phone and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await login(identifier, password);
      console.log("[SignIn] Success:", response.data);

      // Save token + user
      if (response.data.token) {
        localStorage.setItem("mycare_token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem(
          "mycare_user",
          JSON.stringify(response.data.user)
        );
      }

      const name = response.data.user?.full_name || "there";
      setUserName(name);

      // 👉 Show the WelcomeBack transition screen
      setWelcomeName(name);
      setAuthScreen("welcome");
    } catch (err) {
      console.error("[SignIn] Error:", err);
      setError(
        err.response?.data?.message ||
          "Sign in failed. Please check your credentials."
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
          Welcome Back
        </h2>
        <p className="text-center text-dark mb-0" style={{ fontSize: "14px" }}>
          Sign in to continue managing your health.
        </p>
      </div>

      {error && (
        <div
          className="alert alert-danger py-2 mb-2"
          style={{ fontSize: "14px" }}
        >
          {error}
        </div>
      )}

      <form className="my-auto py-3" onSubmit={handleSignIn}>
        <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
          Email or phone
        </label>
        <input
          type="text"
          style={inputStyle}
          className="mb-3"
          placeholder="Enter your email or phone"
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setError("");
          }}
          disabled={loading}
          autoComplete="username"
        />

        <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
          Password
        </label>
        <input
          type="password"
          style={inputStyle}
          className="mb-4"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          disabled={loading}
          autoComplete="current-password"
        />

        <button
          type="submit"
          style={primaryButtonStyle}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div>
        <div className="d-flex align-items-center mb-2">
          <div
            className="flex-grow-1 border-top"
            style={{ borderColor: "rgba(0,0,0,0.2)" }}
          />
          <span
            className="px-3 text-center text-dark"
            style={{ fontSize: "14px" }}
          >
            Don't have an account?{" "}
            <span
              className="fw-bold"
              style={{ color: "#0033CC", cursor: "pointer" }}
              onClick={() => setAuthScreen("signup")}
            >
              Sign up
            </span>
          </span>
          <div
            className="flex-grow-1 border-top"
            style={{ borderColor: "rgba(0,0,0,0.2)" }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;