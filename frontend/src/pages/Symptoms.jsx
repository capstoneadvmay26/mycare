// src/pages/Symptoms.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, ExclamationCircle } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { getSymptoms, getSymptomStatus } from "../services/api";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const Symptoms = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInDueFor, setCheckInDueFor] = useState(null);

  // ------------------------------------------------------------
  // Fetch + filter + compute check-in availability
  // All setState happens inside the async fetchData (via useCallback)
  // ------------------------------------------------------------
  const fetchData = useCallback(async () => {
    if (!profileId) {
      setSymptoms([]);
      setLoading(false);
      setCheckInDueFor(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getSymptoms(profileId);
      const allSymptoms = response.data?.symptoms || [];

      // 🆕 Symptoms tab = active symptoms only
      // (still in 3-day cycle OR logged within last 7 days)
      const now = Date.now();

      const recentSymptoms = allSymptoms.filter((s) => {
        const checkIns = s.checkIns?.length || 0;

        // Keep if check-in cycle is still active
        if (checkIns < 3) return true;

        // Otherwise keep only if logged within last 7 days
        const loggedAt = new Date(s.loggedAt).getTime();
        return now - loggedAt <= SEVEN_DAYS_MS;
      });

      // Enrich each with status (for check-in availability)
      const enriched = await Promise.all(
        recentSymptoms.map(async (s) => {
          try {
            const statusResp = await getSymptomStatus(s._id);
            return { ...s, status: statusResp.data };
          } catch {
            return { ...s, status: null };
          }
        }),
      );

      setSymptoms(enriched);

      // 🆕 Only show check-in banner if the day is actually available
      // Backend rule: first check-in available 24h after logging;
      //               subsequent check-ins available 24h after previous
      const isCheckInAvailable = (symptom) => {
        const checkIns = symptom.checkIns?.length || 0;

        // Cycle complete
        if (checkIns >= 3) return false;

        // Not started (no loggedAt) — shouldn't happen
        if (!symptom.loggedAt) return false;

        // Day 1: need 24h since logging
        if (checkIns === 0) {
          const loggedAt = new Date(symptom.loggedAt).getTime();
          return now - loggedAt >= ONE_DAY_MS;
        }

        // Day 2/3: need 24h since the previous check-in
        const lastCheckIn = symptom.checkIns[checkIns - 1];
        if (!lastCheckIn?.checkedInAt) return false;
        const lastAt = new Date(lastCheckIn.checkedInAt).getTime();
        return now - lastAt >= ONE_DAY_MS;
      };

      const dueForCheckIn = enriched.find(isCheckInAvailable);
      setCheckInDueFor(dueForCheckIn || null);
    } catch (err) {
      console.error("[Symptoms] fetch error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load symptoms",
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  // Effect wraps the async call — no sync setState in the body
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await fetchData();
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  const severityColor = (severity) => {
    const s = (severity || "").toLowerCase();
    if (s === "mild") return "#4CBB17";
    if (s === "moderate") return "#F7C81B";
    if (s === "severe") return "#F97316";
    if (s === "very_severe") return "#D92D20";
    return "#666";
  };

  const severityLabel = (severity) => {
    const s = (severity || "").toLowerCase();
    if (s === "mild") return "Mild";
    if (s === "moderate") return "Moderate";
    if (s === "severe") return "Severe";
    if (s === "very_severe") return "Very severe";
    return severity;
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const symptomName = (s) => {
    if (s.symptoms?.length) return s.symptoms.join(", ");
    return s.otherSymptom || "Unknown symptom";
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1
          className="fw-bold m-0"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Symptoms
        </h1>
        <button
          className="btn btn-sm d-flex align-items-center fw-bold"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.1)",
            color: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("LogSymptom")}
          disabled={!profileId}
        >
          <Plus size={16} className="me-1" /> Log
        </button>
      </div>

      {/* Check-in banner */}
      {checkInDueFor ? (
        <div
          className="d-flex align-items-center p-3 mb-3 rounded-3"
          style={{
            backgroundColor: "rgba(247, 200, 27, 0.12)",
            border: "1px solid rgba(247, 200, 27, 0.4)",
          }}
        >
          <ExclamationCircle
            size={24}
            color="#B45309"
            className="me-3 flex-shrink-0"
          />
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{
                fontSize: "14px",
                color: isDark ? "#FFF" : "#000",
              }}
            >
              Check-in due: {symptomName(checkInDueFor)}
            </p>
            <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
              How are you feeling today?
            </p>
          </div>
          <button
            className="btn fw-bold"
            style={{
              backgroundColor: "#0033CC",
              color: "#FFF",
              borderRadius: "8px",
              padding: "6px 14px",
              fontSize: "13px",
              border: "none",
            }}
            onClick={() => {
              localStorage.setItem(
                "mycare_checkin_symptom_id",
                checkInDueFor._id,
              );
              setCurrentTab("CheckIn");
            }}
          >
            Check in
          </button>
        </div>
      ) : (
        <div
          className="text-center p-3 mb-3 rounded-3"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.04)",
            border: "1px solid rgba(0, 51, 204, 0.15)",
          }}
        >
          <p
            className="m-0 fw-bold"
            style={{ fontSize: "14px", color: isDark ? "#FFF" : "#000" }}
          >
            No check-ins due today
          </p>
          <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
            We'll prompt you when it's time to check in.
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading symptoms...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && symptoms.length === 0 && (
        <div
          className="text-center py-5 rounded-3 mb-4"
          style={{ backgroundColor: "rgba(0, 51, 204, 0.04)" }}
        >
          <p className="fw-bold mb-1" style={{ fontSize: "16px" }}>
            No symptoms logged yet
          </p>
          <p className="text-secondary mb-3" style={{ fontSize: "14px" }}>
            Tap "Log" to record your first symptom.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && symptoms.length > 0 && (
        <div className="d-flex flex-column gap-2 overflow-auto flex-grow-1">
          {symptoms.map((s) => (
            <div
              key={s._id}
              className="d-flex align-items-center justify-content-between p-3"
              style={{
                border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
                borderRadius: "12px",
                cursor: "pointer",
              }}
              onClick={() => {
                localStorage.setItem("mycare_checkin_symptom_id", s._id);
                setCurrentTab("SymptomHistory");
              }}
            >
              <div className="flex-grow-1">
                <p
                  className="m-0 fw-bold"
                  style={{
                    fontSize: "16px",
                    color: isDark ? "#FFF" : "#000",
                  }}
                >
                  {symptomName(s)}
                </p>
                <p className="m-0" style={{ fontSize: "13px", color: "#888" }}>
                  {formatTime(s.loggedAt)}
                  {s.checkIns?.length > 0
                    ? ` · ${s.checkIns.length}/3 check-ins`
                    : ""}
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-pill fw-bold"
                style={{
                  backgroundColor: `${severityColor(s.severity)}20`,
                  color: severityColor(s.severity),
                  fontSize: "12px",
                }}
              >
                {severityLabel(s.severity)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom button */}
      <div className="mt-auto pt-4 pb-2">
        <button
          className="btn w-100 fw-bold py-3"
          style={{
            backgroundColor: "#DEDFE2",
            color: "#000",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("SymptomHistory")}
        >
          View Symptom History
        </button>
      </div>
    </div>
  );
};

export default Symptoms;
