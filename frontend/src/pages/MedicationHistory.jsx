// src/pages/MedicationHistory.jsx
import { useState, useEffect } from "react";
import { ArrowLeft } from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/useApp";
import { getMedicationHistory } from "../services/api";

const MedicationHistory = () => {
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const { setCurrentTab } = useApp();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [period, setPeriod] = useState("week");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH MEDICATION HISTORY
  // ============================================================
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!profileId) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError("");
      }

      try {
        const response = await getMedicationHistory(profileId, period);
        console.log("[MedicationHistory] raw response:", response.data);

        // Extract the array — backend returns { history: [...] }
        const items = Array.isArray(response.data?.history)
          ? response.data.history
          : Array.isArray(response.data?.data)
            ? response.data.data
            : Array.isArray(response.data)
              ? response.data
              : [];

        console.log("[MedicationHistory] parsed items:", items.length);

        if (!cancelled) setLogs(items);
      } catch (err) {
        console.error("[MedicationHistory] Error:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load history",
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
  }, [profileId, period]);

  // ============================================================
  // HELPERS — extract from nested medication object
  // ============================================================
  const getMedicationName = (log) => {
    if (typeof log.medication === "string") return log.medication;
    if (log.medication && typeof log.medication === "object") {
      return log.medication.name || "Medication";
    }
    return log.medication_name || log.name || "Medication";
  };

  const getDosage = (log) => {
    if (log.dosage) return log.dosage;
    if (log.medication && typeof log.medication === "object") {
      return log.medication.dosage || null;
    }
    return null;
  };

  const getEventDate = (log) => {
    return log.date || log.takenAt || log.skippedAt || log.scheduledFor;
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <button
          className="btn p-0 border-0 me-3"
          onClick={() => setCurrentTab("Medications")}
          style={{ color: isDark ? "#FFF" : "#000" }}
          aria-label="Back"
        >
          <ArrowLeft size={24} />
        </button>
        <h1
          className="fw-bold m-0"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Medication History
        </h1>
      </div>

      {/* Period toggle */}
      <div className="d-flex gap-2 mb-4">
        {["week", "month"].map((p) => (
          <button
            key={p}
            className="btn flex-grow-1 fw-bold"
            style={{
              backgroundColor:
                period === p ? "#0033CC" : "rgba(0, 51, 204, 0.08)",
              color: period === p ? "#FFF" : "#0033CC",
              border: "none",
              borderRadius: "8px",
              padding: "12px",
            }}
            onClick={() => setPeriod(p)}
          >
            {p === "week" ? "This Week" : "This Month"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading history...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && logs.length === 0 && (
        <div className="text-center mt-5 text-muted px-4">
          <p className="fw-bold mb-1" style={{ fontSize: "16px" }}>
            No history yet
          </p>
          <p style={{ fontSize: "14px" }}>
            Once you mark doses as taken or skipped, they'll appear here.
          </p>
        </div>
      )}

      {/* Log list */}
      {!loading && !error && logs.length > 0 && (
        <div className="d-flex flex-column gap-2 overflow-auto flex-grow-1">
          {logs.map((log, idx) => {
            if (!log || typeof log !== "object") return null;

            const status = log.status || "pending";
            const isTaken = status === "taken";
            const isSkipped = status === "skipped";

            // Color scheme per status
            const color = isTaken
              ? "#10B981"
              : isSkipped
                ? "#D92D20"
                : "#F7C81B";

            const bg = isTaken
              ? "rgba(16, 185, 129, 0.08)"
              : isSkipped
                ? "rgba(217, 45, 32, 0.08)"
                : "rgba(247, 200, 27, 0.08)";

            const icon = isTaken ? "✓" : isSkipped ? "✕" : "⏱";

            const label = isTaken
              ? "Taken"
              : isSkipped
                ? "Skipped"
                : "Scheduled";

            const medicationName = getMedicationName(log);
            const dosage = getDosage(log);
            const eventDate = getEventDate(log);

            return (
              <div
                key={log._id || log.id || idx}
                className="d-flex align-items-center p-3 rounded-3"
                style={{ backgroundColor: bg }}
              >
                <div
                  className="d-flex justify-content-center align-items-center rounded-circle me-3"
                  style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: color,
                    color: "#FFF",
                    fontSize: "18px",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>
                <div className="flex-grow-1">
                  <p
                    className="m-0 fw-bold"
                    style={{
                      fontSize: "15px",
                      color: isDark ? "#FFF" : "#000",
                    }}
                  >
                    {medicationName}
                    {dosage ? ` · ${dosage}` : ""}
                  </p>
                  <p
                    className="m-0 text-secondary"
                    style={{ fontSize: "13px" }}
                  >
                    {label} · {formatDate(eventDate)} {formatTime(eventDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicationHistory;
