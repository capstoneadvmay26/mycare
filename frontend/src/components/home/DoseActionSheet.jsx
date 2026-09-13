// src/components/home/DoseActionSheet.jsx
import { useTheme } from "../../context/ThemeContext";

const DoseActionSheet = ({ dose, onClose, onTaken, onSnooze, onSkip }) => {
  const { isDark } = useTheme();

  if (!dose) return null;

  const formatTime = (time24) => {
    const [hh, mm] = time24.split(":").map(Number);
    const period = hh >= 12 ? "pm" : "am";
    const h = hh % 12 === 0 ? 12 : hh % 12;
    return `${h}:${String(mm).padStart(2, "0")}${period}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 1050,
        }}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100"
        style={{
          maxWidth: "480px",
          zIndex: 1060,
          animation: "slideUp 0.25s ease-out",
        }}
      >
        <div
          className="rounded-top-4 p-4"
          style={{
            backgroundColor: isDark ? "#1a1a1a" : "#FFF",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
          }}
        >
          {/* Handle bar */}
          <div
            className="mx-auto mb-3 rounded-pill"
            style={{
              width: "40px",
              height: "4px",
              backgroundColor: "#DEDFE2",
            }}
          />

          {/* Dose header */}
          <div className="mb-4">
            <h5
              className="fw-bold m-0"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              {dose.name} {dose.dosage}
            </h5>
            <p
              className="m-0 text-secondary"
              style={{ fontSize: "14px" }}
            >
              Scheduled for {formatTime(dose.time)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="d-flex flex-column gap-2">
            <button
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#0033CC",
                color: "#FFF",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={() => onTaken(dose)}
            >
              <span style={{ fontSize: "18px", marginRight: "8px" }}>✓</span>
              Mark as Taken
            </button>

            <button
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(247, 200, 27, 0.15)",
                color: "#B45309",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={() => onSnooze(dose)}
            >
              <span style={{ fontSize: "18px", marginRight: "8px" }}>⏰</span>
              Snooze
            </button>

            <button
              className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(217, 45, 32, 0.1)",
                color: "#D92D20",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={() => onSkip(dose)}
            >
              <span style={{ fontSize: "18px", marginRight: "8px" }}>✕</span>
              Skip
            </button>

            <button
              className="btn w-100 py-3 fw-semibold"
              style={{
                backgroundColor: "transparent",
                color: "#666",
                borderRadius: "10px",
                border: "none",
              }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); }
          to { transform: translate(-50%, 0); }
        }
      `}</style>
    </>
  );
};

export default DoseActionSheet;