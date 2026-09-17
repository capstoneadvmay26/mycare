// src/pages/CheckIn.jsx
import { useState, useEffect } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";
import { getSymptomStatus, submitCheckIn } from "../services/api";
import Toast from "../components/ui/Toast";

const OPTIONS = [
  {
    value: "better",
    label: "Better",
    desc: "My symptoms are improving",
    color: "#4CBB17",
    emoji: "😊",
  },
  {
    value: "same",
    label: "Same",
    desc: "About the same",
    color: "#666",
    emoji: "😐",
  },
  {
    value: "worse",
    label: "Worse",
    desc: "My symptoms are worse",
    color: "#D92D20",
    emoji: "😟",
  },
];

const CheckIn = () => {
  const { setCurrentTab } = useApp();
  const { isDark } = useTheme();

  const [symptomId] = useState(() =>
    localStorage.getItem("mycare_checkin_symptom_id")
  );
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  // ------------------------------------------------------------
  // Load symptom status
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      if (!symptomId) {
        setLoading(false);
        setError("No symptom selected for check-in.");
        return;
      }

      setLoading(true);

      try {
        const resp = await getSymptomStatus(symptomId);
        if (!cancelled) setStatus(resp.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load check-in status."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symptomId]);

  // ------------------------------------------------------------
  // 3-tap response — one tap = one submission
  // ------------------------------------------------------------
  const handleSelect = async (selectedStatus) => {
    if (!symptomId || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const resp = await submitCheckIn(symptomId, selectedStatus);
      const nudge = resp.data?.professionalCareNudge;

      // Nudge fired → go to DoctorNudge
      if (nudge?.shown) {
        setToast({
          message: "Check-in recorded — take a moment",
          type: "info",
        });
        setTimeout(() => setCurrentTab("DoctorNudge"), 800);
        return;
      }

      // Normal completion
      const day = status?.current_day || 1;
      setToast({
        message:
          day >= 3
            ? "3-day check-in complete. Glad you're improving!"
            : `Day ${day} check-in recorded`,
        type: "success",
      });

      setTimeout(() => setCurrentTab("Symptoms"), 1200);
    } catch (err) {
      console.error("[CheckIn] submit error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit check-in."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------
  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
          Loading check-in...
        </p>
      </div>
    );
  }

  // ------------------------------------------------------------
  // No symptom selected
  // ------------------------------------------------------------
  if (!symptomId) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 p-4 text-center">
        <p className="text-secondary">No symptom selected for check-in.</p>
        <button
          className="btn fw-bold mt-3"
          style={{
            backgroundColor: "#0033CC",
            color: "#FFF",
            borderRadius: "8px",
            padding: "12px 24px",
            border: "none",
          }}
          onClick={() => setCurrentTab("Symptoms")}
        >
          Go to Symptoms
        </button>
      </div>
    );
  }

  const currentDay = status?.current_day || 1;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      className="d-flex flex-column vh-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={() => setCurrentTab("Symptoms")}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "20px", color: isDark ? "#FFF" : "#000" }}
        >
          Check-in • Day {currentDay} of 3
        </h1>
      </div>

      {/* Content */}
      <div className="d-flex flex-column flex-grow-1 p-4">
        {error && (
          <div
            className="alert alert-danger py-2 mb-3"
            style={{ fontSize: "13px" }}
          >
            {error}
          </div>
        )}

        <h2
          className="fw-bold mb-4"
          style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
        >
          How are you feeling compared to yesterday?
        </h2>

        {/* 3-tap options — one tap submits */}
        <div className="d-flex flex-column gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              disabled={submitting}
              className="d-flex align-items-center p-3"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#FFF",
                border: `1px solid ${isDark ? "#444" : "rgba(0,0,0,0.15)"}`,
                borderRadius: "12px",
                textAlign: "left",
                opacity: submitting ? 0.5 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              <span style={{ fontSize: "42px", marginRight: "16px" }}>
                {opt.emoji}
              </span>
              <div>
                <p
                  className="m-0 fw-bold"
                  style={{ fontSize: "16px", color: opt.color }}
                >
                  {opt.label}
                </p>
                <p
                  className="m-0 text-secondary"
                  style={{ fontSize: "13px" }}
                >
                  {opt.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Info banner (matches Figma) */}
        <div
          className="d-flex align-items-center p-3 mt-4 rounded-3"
          style={{ backgroundColor: isDark ? "#2a2a2a" : "#F3F4F6" }}
        >
          <span style={{ fontSize: "20px", marginRight: "12px" }}>ℹ️</span>
          <p
            className="m-0 text-secondary"
            style={{ fontSize: "13px", lineHeight: 1.4 }}
          >
            Your response is private and helps us guide you better.
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default CheckIn;