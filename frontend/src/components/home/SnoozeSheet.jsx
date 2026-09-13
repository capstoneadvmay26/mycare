// src/components/home/SnoozeSheet.jsx
import { useTheme } from "../../context/ThemeContext";

const SNOOZE_OPTIONS = [
  { value: 10, label: "10 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
];

const SnoozeSheet = ({ dose, onClose, onConfirm, saving }) => {
  const { isDark } = useTheme();

  if (!dose) return null;

  return (
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1070 }}
        onClick={saving ? null : onClose}
      />

      <div
        className="position-fixed bottom-0 start-50 translate-middle-x w-100"
        style={{ maxWidth: "480px", zIndex: 1080 }}
      >
        <div
          className="rounded-top-4 p-4"
          style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
        >
          <div
            className="mx-auto mb-3 rounded-pill"
            style={{ width: "40px", height: "4px", backgroundColor: "#DEDFE2" }}
          />

          <h5
            className="fw-bold mb-1"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Snooze {dose.name}
          </h5>
          <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
            Remind me again in...
          </p>

          <div className="d-flex flex-column gap-2 mb-3">
            {SNOOZE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="btn w-100 py-3 fw-semibold text-start"
                style={{
                  backgroundColor: isDark ? "#333" : "#F3F4F6",
                  color: isDark ? "#FFF" : "#000",
                  borderRadius: "10px",
                  border: "none",
                  padding: "14px 20px",
                }}
                onClick={() => onConfirm(dose, opt.value)}
                disabled={saving}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            className="btn w-100 py-3 fw-semibold"
            style={{
              backgroundColor: "transparent",
              color: "#666",
              border: "1px solid #DEDFE2",
              borderRadius: "10px",
            }}
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default SnoozeSheet;