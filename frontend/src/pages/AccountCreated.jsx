// src/pages/AccountCreated.jsx
import { useEffect } from "react";
import { useApp } from "../context/useApp";
import Logo from "../components/ui/Logo";

const AccountCreated = () => {
  const { setOnboardingStage } = useApp();

  // Auto-advance to the next step after 5.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setOnboardingStage("medication-wizard");
    }, 5500);

    return () => clearTimeout(timer);
  }, [setOnboardingStage]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white px-3 text-center position-relative overflow-hidden"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Sparkles around the icon */}
      <span
        className="position-absolute sparkle"
        style={{ top: "22%", left: "28%", color: "#FBBF24", fontSize: "22px" }}
      >
        ✦
      </span>
      <span
        className="position-absolute sparkle sparkle-delay-1"
        style={{ top: "18%", right: "30%", color: "#EC4899", fontSize: "18px" }}
      >
        ✦
      </span>
      <span
        className="position-absolute sparkle sparkle-delay-2"
        style={{ top: "38%", left: "18%", color: "#3B82F6", fontSize: "20px" }}
      >
        ✦
      </span>
      <span
        className="position-absolute sparkle sparkle-delay-1"
        style={{ top: "44%", right: "18%", color: "#FBBF24", fontSize: "16px" }}
      >
        ✦
      </span>

      {/* Big circle with checkmark */}
      <div
        className="d-flex justify-content-center align-items-center rounded-circle mb-4 account-created-circle"
        style={{
          width: "160px",
          height: "160px",
          backgroundColor: "#E8EFFF",
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 13L10 18L19 7"
            stroke="#0033CC"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Heading */}
      <h1
        className="fw-bold mb-2"
        style={{ fontSize: "26px", color: "#000" }}
      >
        Account Created
      </h1>

      {/* Subtext */}
      <p className="text-secondary mb-5" style={{ fontSize: "15px" }}>
        Your account has been created successfully
      </p>

      {/* Logo at the bottom for branding continuity */}
      <div className="mt-auto mb-4">
        <Logo height="40px" />
      </div>

      {/* Animation styles */}
      <style>{`
        .account-created-circle {
          animation: popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes popIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .sparkle {
          animation: twinkle 1.4s ease-in-out infinite;
        }

        .sparkle-delay-1 {
          animation-delay: 0.3s;
        }

        .sparkle-delay-2 {
          animation-delay: 0.7s;
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
      `}</style>
    </div>
  );
};

export default AccountCreated;