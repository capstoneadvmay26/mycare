// src/components/medication/WizardStepFrequency.jsx
const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once Daily" },
  { value: "twice_daily", label: "Twice Daily" },
  { value: "three_times_daily", label: "3 Times Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "as_needed", label: "As Needed" },
];

const WizardStepFrequency = ({ value, onChange, onBack, onNext, loading }) => {
  return (
    <div className="d-flex flex-column flex-grow-1">
      <h2 className="fw-bold mb-4" style={{ fontSize: "22px" }}>
        How often do you take it?
      </h2>

      <div className="d-flex flex-column gap-2 mb-4">
        {FREQUENCY_OPTIONS.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              disabled={loading}
              className="btn text-start rounded-3 d-flex align-items-center"
              style={{
                border: isSelected ? "2px solid #0033CC" : "1px solid #000",
                backgroundColor: isSelected ? "rgba(0, 51, 204, 0.06)" : "#FFFFFF",
                color: "#000",
                padding: "14px 16px",
                outline: "none",
                boxShadow: "none",
              }}
            >
              <div
                className="border border-dark rounded-circle me-3 d-flex justify-content-center align-items-center"
                style={{ width: "20px", height: "20px", flexShrink: 0 }}
              >
                {isSelected && (
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
              <span style={{ fontSize: "15px", fontWeight: isSelected ? "600" : "500" }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto d-flex gap-2">
        <button
          className="btn w-50"
          onClick={onBack}
          disabled={loading}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: "transparent",
            color: "#000",
            border: "1px solid rgba(0,0,0,0.4)",
          }}
        >
          Back
        </button>
        <button
          className="btn w-50"
          onClick={onNext}
          disabled={loading || !value}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: loading || !value ? "#999" : "#0033CC",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default WizardStepFrequency;