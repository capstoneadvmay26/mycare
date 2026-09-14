// src/pages/LogSymptom.jsx
import { useState, useEffect } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { logSymptom, getSymptomOptions } from "../services/api";
import Toast from "../components/ui/Toast";

const DEFAULT_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Fever",
  "Nausea",
  "Dizziness",
  "Body pains",
  "Cough",
  "Chest discomfort",
  "Stomachache",
  "Others",
];

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild", desc: "I can manage it", emoji: "🙂" },
  { value: "moderate", label: "Moderate", desc: "It's uncomfortable", emoji: "😐" },
  { value: "severe", label: "Severe", desc: "It's hard to function", emoji: "😣" },
  { value: "very_severe", label: "Very severe", desc: "I can't do normal activities", emoji: "😖" },
];

const LogSymptom = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [step, setStep] = useState(1);
  const [symptomOptions, setSymptomOptions] = useState(DEFAULT_SYMPTOMS);
  const [selected, setSelected] = useState(null);
  const [otherText, setOtherText] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Load options — self-invoking async wrapper avoids lint warning
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      try {
        const resp = await getSymptomOptions();
        const opts = resp.data?.symptoms;
        if (!cancelled && Array.isArray(opts) && opts.length > 0) {
          setSymptomOptions(opts);
        }
      } catch (err) {
        console.warn("[LogSymptom] Using default options:", err.message);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isOther = selected === "Others";
  const canProceedStep1 = selected && (!isOther || otherText.trim().length >= 1);
  const canProceedStep2 = !!severity;

  const handleSubmit = async () => {
    if (!profileId) {
      setError("No profile selected.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        profile_id: profileId,
        symptoms: isOther ? [] : [selected],
        otherSymptom: isOther ? otherText.trim() : undefined,
        severity,
      };

      await logSymptom(payload);

      setToast({
        message: "Symptom logged — we'll check in over the next 3 days",
        type: "success",
      });

      setTimeout(() => setCurrentTab("Symptoms"), 1200);
    } catch (err) {
      console.error("[LogSymptom] submit error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to log symptom."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    height: "52px",
    borderRadius: "8px",
    border: `1px solid ${isDark ? "#444" : "rgba(0, 0, 0, 0.5)"}`,
    background: isDark ? "#2a2a2a" : "#FFFFFF",
    color: isDark ? "#FFF" : "#000",
    outline: "none",
    fontSize: "16px",
    padding: "0 14px",
  };

  const primaryButtonStyle = {
    width: "100%",
    height: "52px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
    backgroundColor: loading ? "#999" : "#0033CC",
    color: "#FFF",
    border: "none",
  };

  const secondaryButtonStyle = {
    width: "100%",
    height: "52px",
    fontSize: "16px",
    fontWeight: "600",
    borderRadius: "8px",
    cursor: "pointer",
    backgroundColor: "transparent",
    color: isDark ? "#FFF" : "#000",
    border: `1px solid ${isDark ? "#444" : "rgba(0,0,0,0.3)"}`,
  };

  return (
    <div
      className="d-flex flex-column vh-100 overflow-hidden mx-auto p-3"
      style={{ maxWidth: "480px", backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn p-0 border-0 me-3"
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else setCurrentTab("Symptoms");
          }}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <span className="text-secondary fw-semibold" style={{ fontSize: "14px" }}>
          Step {step} of 3
        </span>
      </div>

      {error && (
        <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>
          {error}
        </div>
      )}

      {step === 1 && (
        <>
          <h2
            className="fw-bold mb-4"
            style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
          >
            What symptom are you experiencing?
          </h2>

          <div
            className="d-flex flex-wrap gap-2 mb-4"
            style={{ overflowY: "auto", maxHeight: "55vh" }}
          >
            {symptomOptions.map((s) => {
              const isSelected = selected === s;
              return (
                <button
                  key={s}
                  className="btn fw-semibold"
                  style={{
                    backgroundColor: isSelected
                      ? "#0033CC"
                      : isDark
                      ? "#333"
                      : "#F3F4F6",
                    color: isSelected ? "#FFF" : isDark ? "#FFF" : "#000",
                    borderRadius: "20px",
                    padding: "10px 18px",
                    border: "none",
                    fontSize: "14px",
                  }}
                  onClick={() => setSelected(s)}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {isOther && (
            <input
              type="text"
              style={inputStyle}
              placeholder="Describe your symptom"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              maxLength={100}
              className="mb-4"
            />
          )}

          <div className="mt-auto">
            <button
              style={primaryButtonStyle}
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              Continue
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2
            className="fw-bold mb-2"
            style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
          >
            How severe is it?
          </h2>
          <p className="text-secondary mb-4" style={{ fontSize: "14px" }}>
            Rate how bad your symptom is right now.
          </p>

          <div className="d-flex flex-column gap-2 mb-4">
            {SEVERITY_OPTIONS.map((opt) => {
              const isSelected = severity === opt.value;
              return (
                <button
                  key={opt.value}
                  className="btn text-start d-flex align-items-center"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(0, 51, 204, 0.08)"
                      : isDark
                      ? "#2a2a2a"
                      : "#FFF",
                    border: isSelected
                      ? "2px solid #0033CC"
                      : `1px solid ${isDark ? "#444" : "rgba(0,0,0,0.15)"}`,
                    borderRadius: "12px",
                    padding: "14px 16px",
                  }}
                  onClick={() => setSeverity(opt.value)}
                >
                  <span style={{ fontSize: "32px", marginRight: "14px" }}>
                    {opt.emoji}
                  </span>
                  <div>
                    <p
                      className="m-0 fw-bold"
                      style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
                    >
                      {opt.label}
                    </p>
                    <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto d-flex gap-2">
            <button style={secondaryButtonStyle} onClick={() => setStep(1)}>
              Back
            </button>
            <button
              style={primaryButtonStyle}
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2
            className="fw-bold mb-4"
            style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
          >
            Review your entry
          </h2>

          <div
            className="p-3 rounded-3 mb-4"
            style={{ backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB" }}
          >
            <ReviewRow
              label="Symptom"
              value={isOther ? otherText : selected}
              isDark={isDark}
            />
            <ReviewRow
              label="Severity"
              value={
                SEVERITY_OPTIONS.find((o) => o.value === severity)?.label ||
                severity
              }
              isDark={isDark}
            />
            <ReviewRow
              label="Date & Time"
              value={new Date().toLocaleString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              isDark={isDark}
              noBorder
            />
          </div>

          <div className="mt-auto d-flex gap-2">
            <button
              style={secondaryButtonStyle}
              onClick={() => setStep(2)}
              disabled={loading}
            >
              Back
            </button>
            <button
              style={primaryButtonStyle}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Symptom"}
            </button>
          </div>
        </>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

const ReviewRow = ({ label, value, isDark, noBorder }) => (
  <div
    className="d-flex justify-content-between py-2"
    style={{
      borderBottom: noBorder
        ? "none"
        : `1px solid ${isDark ? "#333" : "#DEDFE2"}`,
    }}
  >
    <span className="fw-semibold text-secondary" style={{ fontSize: "13px" }}>
      {label}
    </span>
    <span
      className="fw-bold"
      style={{
        fontSize: "14px",
        color: isDark ? "#FFF" : "#000",
        textAlign: "right",
        maxWidth: "60%",
      }}
    >
      {value}
    </span>
  </div>
);

export default LogSymptom;