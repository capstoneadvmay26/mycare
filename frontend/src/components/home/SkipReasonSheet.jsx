// src/components/home/SkipReasonSheet.jsx
import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const SKIP_REASONS = [
  { value: "forgot", label: "Forgot" },
  { value: "side_effects", label: "Side effects" },
  { value: "ran_out", label: "Ran out" },
  { value: "felt_better", label: "Felt better" },
  { value: "other", label: "Other" },
];

const SkipReasonSheet = ({ dose, onClose, onConfirm, saving }) => {
  const { isDark } = useTheme();
  const [reason, setReason] = useState("");

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
            Skip {dose.name}
          </h5>
          <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
            Reason (optional)
          </p>

          {/* Reason chips */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {SKIP_REASONS.map((r) => {
              const selected = reason === r.value;
              return (
                <button
                  key={r.value}
                  className="btn fw-semibold"
                  style={{
                    backgroundColor: selected
                      ? "#0033CC"
                      : isDark
                      ? "#333"
                      : "#F3F4F6",
                    color: selected ? "#FFF" : isDark ? "#FFF" : "#000",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    border: "none",
                    fontSize: "14px",
                  }}
                  onClick={() => setReason(selected ? "" : r.value)}
                  disabled={saving}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="d-flex gap-2">
            <button
              className="btn w-50 py-3 fw-semibold"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
                border: "1px solid #DEDFE2",
                borderRadius: "10px",
              }}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn w-50 py-3 fw-bold"
              style={{
                backgroundColor: saving ? "#999" : "#D92D20",
                color: "#FFF",
                border: "none",
                borderRadius: "10px",
              }}
              onClick={() => onConfirm(dose, reason || null)}
              disabled={saving}
            >
              {saving ? "Skipping..." : "Confirm Skip"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkipReasonSheet;