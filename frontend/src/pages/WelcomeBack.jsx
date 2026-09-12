// src/pages/WelcomeBack.jsx
import { useEffect } from "react";
import { useApp } from "../context/useApp";
import Logo from "../components/ui/Logo";

const WelcomeBack = () => {
  const { welcomeName, setIsOnboarded, setAuthScreen } = useApp();

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning"
      : hour < 17
      ? "Good afternoon"
      : "Good evening";

  useEffect(() => {
    // Auto-advance into the app after 2.5 seconds
    const timer = setTimeout(() => {
      setIsOnboarded(true);
      setAuthScreen("signup"); // reset for next logout
    }, 2500);

    return () => clearTimeout(timer);
  }, [setIsOnboarded, setAuthScreen]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white px-3 text-center"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      <Logo height="70px" />
      <h1
        className="fw-bold mt-5 mb-2"
        style={{ fontSize: "28px", color: "#0033CC" }}
      >
        {greeting},
      </h1>
      <h2 className="fw-bold mb-4" style={{ fontSize: "32px" }}>
        {welcomeName}
      </h2>
      <p className="text-secondary" style={{ fontSize: "16px" }}>
        Welcome back 👋
      </p>
    </div>
  );
};

export default WelcomeBack;