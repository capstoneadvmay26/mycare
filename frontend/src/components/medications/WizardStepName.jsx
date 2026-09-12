// src/components/medication/WizardStepName.jsx
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

const WizardStepName = ({ value, onChange, onNext, onSkip, loading }) => {
  return (
    <div className="d-flex flex-column flex-grow-1">
      <h2 className="fw-bold mb-4" style={{ fontSize: "22px" }}>
        What is the name of your medication?
      </h2>

      <input
        type="text"
        style={inputStyle}
        className="mb-3"
        placeholder="e.g Amlodipine"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading}
        autoFocus
      />

      <button
        className="btn w-100"
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
        {loading ? "Please wait..." : "Add Medication"}
      </button>

      {onSkip && (
        <button
          className="btn border-0 text-secondary mt-3"
          onClick={onSkip}
          disabled={loading}
          style={{ fontSize: "15px", fontWeight: "500" }}
        >
          I will do this later
        </button>
      )}
    </div>
  );
};

export default WizardStepName;