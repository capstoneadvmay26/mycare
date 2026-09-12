// src/pages/TrialFraming.jsx
import { useEffect, useState, useMemo } from "react";
import { useApp } from "../context/useApp";

// Confetti piece colors (matching brand + festive palette)
const CONFETTI_COLORS = [
  "#0033CC", // brand blue
  "#EC4899", // pink
  "#F5C542", // yellow
  "#3B82F6", // light blue
  "#10B981", // green
  "#F97316", // orange
];

// Generate random confetti pieces once
const generateConfetti = (count = 40) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,            // % across the screen
    delay: Math.random() * 3,             // 0-3s delay
    duration: 3 + Math.random() * 3,      // 3-6s fall duration
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 6,          // 6-12px
    rotation: Math.random() * 360,        // initial rotation
    shape: Math.random() > 0.5 ? "circle" : "square",
  }));
};

const TrialFraming = () => {
  const { setOnboardingStage } = useApp();

  // Generate confetti pieces — memoized so they don't regenerate on re-render
  const confettiPieces = useMemo(() => generateConfetti(40), []);

  // Compute trial end date (30 days from now)
  const [trialEndDate] = useState(() => {
    const cached = localStorage.getItem("mycare_trial_end");
    if (cached) return new Date(cached);

    const end = new Date();
    end.setDate(end.getDate() + 30);
    localStorage.setItem("mycare_trial_end", end.toISOString());
    localStorage.setItem("mycare_trial_start", new Date().toISOString());
    return end;
  });

  const formattedEnd = trialEndDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const handleContinue = () => {
    // Clear the flag — App.jsx falls through to the main app
    setOnboardingStage(null);
  };

  // Auto-advance after 20 seconds (slightly longer so user enjoys confetti)
  useEffect(() => {
    const timer = setTimeout(() => {
      
      setOnboardingStage(null);
    }, 20000);
    return () => clearTimeout(timer);
  }, [setOnboardingStage]);

  return (
    <div
      className="d-flex flex-column justify-content-between vh-100 bg-white px-4 py-5 text-center overflow-hidden mx-auto position-relative"
      style={{ maxWidth: "480px" }}
    >
      {/* 🎊 Confetti rain overlay */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
        style={{ zIndex: 1, overflow: "hidden" }}
      >
        {confettiPieces.map((piece) => (
          <span
            key={piece.id}
            className="confetti-piece"
            style={{
              position: "absolute",
              left: `${piece.left}%`,
              top: "-20px",
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              backgroundColor: piece.color,
              borderRadius: piece.shape === "circle" ? "50%" : "2px",
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              transform: `rotate(${piece.rotation}deg)`,
            }}
          />
        ))}
      </div>

      {/* Main content — z-index above confetti */}
      <div style={{ zIndex: 2, position: "relative" }}>
        {/* Party popper icon */}
        <div className="d-flex flex-column align-items-center mt-5 position-relative">
          <div className="popper-pop" style={{ width: "140px", height: "140px" }}>
            <svg
              viewBox="0 0 120 120"
              width="140"
              height="140"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon
                points="20,100 55,40 75,75"
                fill="#F5C542"
                stroke="#000"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <polygon points="30,95 58,42 70,72" fill="#0033CC" />
              <polygon points="42,88 60,48 66,68" fill="#EC4899" />
              <circle cx="85" cy="25" r="4" fill="#EC4899" />
              <circle cx="100" cy="40" r="3.5" fill="#F5C542" />
              <circle cx="70" cy="15" r="3" fill="#3B82F6" />
              <circle cx="105" cy="60" r="3.5" fill="#0033CC" />
              <circle cx="90" cy="10" r="2.5" fill="#10B981" />
              <path
                d="M75 30 Q85 20 95 30"
                stroke="#EC4899"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M70 45 Q80 35 92 45"
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1
            className="fw-bold mt-4 mb-2 fade-in-up"
            style={{ fontSize: "28px", color: "#000" }}
          >
            Your first month is 100% free
          </h1>
        </div>
      </div>

      {/* Feature checklist */}
      <div
        className="d-flex flex-column align-items-start mx-auto my-4"
        style={{ maxWidth: "320px", zIndex: 2, position: "relative" }}
      >
        {[
          "All features included",
          "Dependent profiles included",
          "Cancel anytime",
        ].map((feature, idx) => (
          <div
            key={idx}
            className="d-flex align-items-center mb-3 fade-in-up"
            style={{
              fontSize: "16px",
              animationDelay: `${0.2 + idx * 0.15}s`,
            }}
          >
            <span
              className="d-flex justify-content-center align-items-center me-3 rounded-circle"
              style={{
                width: "24px",
                height: "24px",
                backgroundColor: "#0033CC",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13L10 18L19 7"
                  stroke="#FFFFFF"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="fw-medium text-dark">{feature}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ zIndex: 2, position: "relative" }}>
        <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
          Trial ends on <span className="fw-semibold">{formattedEnd}</span>
        </p>

        <button
          className="btn w-100"
          onClick={handleContinue}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: "#0033CC",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Get Started
        </button>
      </div>

      {/* Animations */}
      <style>{`
        /* Confetti falling */
        .confetti-piece {
          animation-name: confettiFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          opacity: 0.9;
        }

        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        /* Popper pop-in animation */
        .popper-pop {
          animation: popperPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes popperPop {
          0% {
            transform: scale(0.3) rotate(-20deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        /* Fade-in-up for text and list items */
        .fade-in-up {
          animation: fadeInUp 0.5s ease-out both;
        }

        @keyframes fadeInUp {
          0% {
            transform: translateY(15px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

@media (prefers-reduced-motion: reduce) {
  .confetti-piece,
  .popper-pop,
  .fade-in-up {
    animation: none !important;
  }
}





      `}</style>
    </div>
  );
};

export default TrialFraming;