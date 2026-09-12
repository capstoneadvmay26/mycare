// src/components/medication/WizardProgress.jsx
const WizardProgress = ({ step, totalSteps = 4, onBack }) => {
  return (
    <div className="d-flex align-items-center mb-4">
      {onBack && (
        <button
          className="btn p-0 border-0 text-dark me-3"
          onClick={onBack}
          style={{ fontSize: "28px", lineHeight: 1 }}
          aria-label="Go back"
        >
          ‹
        </button>
      )}
      <span className="text-secondary fw-semibold" style={{ fontSize: "14px" }}>
        Step {step} of {totalSteps}
      </span>
    </div>
  );
};

export default WizardProgress;