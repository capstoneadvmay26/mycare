// src/components/medication/WizardStepDosage.jsx
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

const WizardStepDosage = ({ value, onChange, onBack, onNext, loading }) => {
  return (
    <div className="d-flex flex-column flex-grow-1">
      <h2 className="fw-bold mb-4" style={{ fontSize: "22px" }}>
        What is the dosage instruction?
      </h2>

      <input
        type="text"
        style={inputStyle}
        className="mb-4"
        placeholder="e.g 500mg, 1 tablet"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        autoFocus
        maxLength={50}
      />

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
          disabled={loading || !value.trim()}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: loading || !value.trim() ? "#999" : "#0033CC",
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

export default WizardStepDosage;