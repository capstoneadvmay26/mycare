// src/components/medication/WizardStepSchedule.jsx

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

const WizardStepSchedule = ({
  frequency,
  times,
  onTimesChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onBack,
  onSubmit,
  loading,
}) => {
  const showTimes = frequency !== "as_needed";

  const handleTimeChange = (index, value) => {
    const updated = [...times];
    updated[index] = value;
    onTimesChange(updated);
  };

  return (
    <div className="d-flex flex-column flex-grow-1">
      <h2 className="fw-bold mb-4" style={{ fontSize: "22px" }}>
        When do you want to start?
      </h2>

      <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
        Start Date
      </label>
      <input
        type="date"
        style={inputStyle}
        className="mb-3"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        disabled={loading}
      />

      <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
        End Date <span className="text-secondary fw-normal">(optional)</span>
      </label>
      <input
        type="date"
        style={inputStyle}
        className="mb-3"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        disabled={loading}
        min={startDate}
      />

      {showTimes && (
        <>
          <label className="fw-bold mb-2" style={{ fontSize: "15px" }}>
            {times.length === 1 ? "Time" : "Times"}
          </label>
          {times.map((t, idx) => (
            <input
              key={idx}
              type="time"
              style={inputStyle}
              className="mb-2"
              value={t}
              onChange={(e) => handleTimeChange(idx, e.target.value)}
              disabled={loading}
            />
          ))}
        </>
      )}

      <div className="mt-auto d-flex gap-2 pt-3">
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
          onClick={onSubmit}
          disabled={loading || !startDate}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: loading || !startDate ? "#999" : "#0033CC",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          {loading ? "Saving..." : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default WizardStepSchedule;