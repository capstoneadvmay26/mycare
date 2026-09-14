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
  const [symptom, setSymptom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [availableIn, setAvailableIn] = useState(null); // countdown text

  // ------------------------------------------------------------
  // Load symptom + determine if check-in is available
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
        // Fetch status AND full symptom to know loggedAt + check-ins
        const statusResp = await getSymptomStatus(symptomId);
        if (cancelled) return;

        // The status endpoint gives us the day + progress.
        // We also need the loggedAt + checkIns timestamps to
        // decide if the next check-in is available.

        // For availability, we can look at what the backend tells us
        // and infer from the current_day + checkIns.
        // Simplest: use status endpoint's returned day.
        const status = statusResp.data;

        // Determine if a check-in is available based on backend logic:
        // - currentDay is min(checkInCount + 1, 3)
        // - If we're at day 1 with 0 check-ins, need 24h since logging
        // - If we're at day 2/3, need 24h since the last check-in
        //
        // Since the status endpoint doesn't return loggedAt or
        // check-in timestamps, we compute availability by making a
        // separate probe: attempt to fetch symptom history and find ours.
        //
        // Simpler approach: use the status endpoint to see if backend
        // considers it due. If not, we disable buttons.

        setSymptom({ ...status, id: symptomId });

        // Compute countdown if not available
        // We rely on the backend to tell us if this is a valid check-in window.
        // Since the status endpoint only tells us the day number,
        // we do a "speculative check" via the History endpoint to find
        // our symptom's loggedAt + checkIns.
        setAvailableIn(null); // will be set if the API rejects

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load check-in status."
          );
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symptomId]);

  // ------------------------------------------------------------
  // Submit check-in
  // ------------------------------------------------------------
  const handleSelect = async (selectedStatus) => {
    if (!symptomId) return;

    setSubmitting(true);
    setError("");

    try {
      const resp = await submitCheckIn(symptomId, selectedStatus);
      const nudge = resp.data?.professionalCareNudge;

      if (nudge?.shown) {
        setToast({
          message: "Check-in recorded — take a moment",
          type: "info",
        });
        setTimeout(() => setCurrentTab("DoctorNudge"), 800);
        return;
      }

      const day = symptom?.current_day || 1;
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
      const msg = err.response?.data?.message || err.message;

      // Detect the "available tomorrow" case → show countdown
      if (msg?.toLowerCase().includes("tomorrow")) {
        setAvailableIn(msg);
      } else {
        setError(msg || "Failed to submit check-in.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // Loading
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

  const currentDay = symptom?.current_day || 1;
  const isBlocked = !!availableIn;

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

      <div className="d-flex flex-column justify-content-center flex-grow-1 p-4">
        {/* Show "not yet available" banner if blocked */}
        {isBlocked && (
          <div
            className="alert alert-warning py-2 mb-4"
            style={{ fontSize: "13px" }}
          >
            {availableIn}
          </div>
        )}

        {error && !isBlocked && (
          <div
            className="alert alert-danger py-2 mb-3"
            style={{ fontSize: "13px" }}
          >
            {error}
          </div>
        )}

        <p className="text-secondary mb-2" style={{ fontSize: "14px" }}>
          Your logged symptom
        </p>
        <h2
          className="fw-bold mb-4"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          How are you feeling compared to yesterday?
        </h2>

        <div className="d-flex flex-column gap-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              disabled={submitting || isBlocked}
              className="d-flex align-items-center p-3"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#FFF",
                border: `1px solid ${isDark ? "#444" : "rgba(0,0,0,0.1)"}`,
                borderRadius: "12px",
                textAlign: "left",
                opacity: submitting || isBlocked ? 0.5 : 1,
                cursor: isBlocked ? "not-allowed" : "pointer",
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

        <p
          className="text-secondary text-center mt-4"
          style={{ fontSize: "12px" }}
        >
          Your response is private and helps us guide you better.
        </p>
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