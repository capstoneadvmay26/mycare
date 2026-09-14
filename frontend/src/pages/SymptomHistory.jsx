// src/pages/SymptomHistory.jsx
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { getSymptomHistory } from "../services/api";

const SymptomHistory = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | mild | moderate | severe | very_severe

  // Fetch — all setState inside async load
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;

      if (!profileId) {
        setLoading(false);
        setError("No profile selected.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const resp = await getSymptomHistory(profileId);
        const items = resp.data?.symptoms || [];
        if (!cancelled) setSymptoms(items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load history"
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
  }, [profileId]);

  // 🆕 Filter + group by date
  const groupedSymptoms = useMemo(() => {
    const filtered =
      filter === "all"
        ? symptoms
        : symptoms.filter(
            (s) =>
              (s.severity || "").toLowerCase() === filter.toLowerCase()
          );

    // Group by date (YYYY-MM-DD)
    const groups = {};
    filtered.forEach((s) => {
      const d = new Date(s.loggedAt);
      const key = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    return groups;
  }, [symptoms, filter]);

  // Helpers
  const severityColor = (s) => {
    const l = (s || "").toLowerCase();
    if (l === "mild") return "#4CBB17";
    if (l === "moderate") return "#F7C81B";
    if (l === "severe") return "#F97316";
    if (l === "very_severe") return "#D92D20";
    return "#666";
  };

  const severityLabel = (s) => {
    const l = (s || "").toLowerCase();
    if (l === "mild") return "Mild";
    if (l === "moderate") return "Moderate";
    if (l === "severe") return "Severe";
    if (l === "very_severe") return "Very severe";
    return s;
  };

  const symptomName = (s) =>
    s.symptoms?.length ? s.symptoms.join(", ") : s.otherSymptom || "Unknown";

  const formatTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const hasAnyResults = Object.keys(groupedSymptoms).length > 0;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn p-0 border-0"
          onClick={() => setCurrentTab("Symptoms")}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Symptom History
        </h1>
      </div>

      {/* Severity filter */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
        {["all", "mild", "moderate", "severe", "very_severe"].map((f) => {
          const isActive = filter === f;
          return (
            <button
              key={f}
              className="btn fw-semibold flex-shrink-0"
              style={{
                backgroundColor: isActive
                  ? "#0033CC"
                  : isDark
                  ? "#333"
                  : "#F3F4F6",
                color: isActive ? "#FFF" : isDark ? "#FFF" : "#000",
                borderRadius: "20px",
                padding: "6px 16px",
                border: "none",
                fontSize: "13px",
              }}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : severityLabel(f)}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !hasAnyResults && (
        <div className="text-center mt-5 text-muted px-4">
          <p className="fw-bold mb-1" style={{ fontSize: "16px" }}>
            No symptom history{filter !== "all" ? ` for ${severityLabel(filter)}` : ""}
          </p>
          <p style={{ fontSize: "14px" }}>
            Symptoms you log will appear here.
          </p>
        </div>
      )}

      {/* Grouped list */}
      {!loading && !error && hasAnyResults && (
        <div className="d-flex flex-column gap-4 overflow-auto flex-grow-1">
          {Object.entries(groupedSymptoms).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <p
                className="text-secondary fw-bold mb-2"
                style={{ fontSize: "13px" }}
              >
                {dateLabel}
              </p>
              <div className="d-flex flex-column gap-2">
                {items.map((s) => (
                  <div
                    key={s._id}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3"
                    style={{
                      border: `1px solid ${
                        isDark ? "#333" : "rgba(0,0,0,0.1)"
                      }`,
                    }}
                  >
                    <div className="flex-grow-1">
                      <p
                        className="m-0 fw-bold"
                        style={{
                          fontSize: "15px",
                          color: isDark ? "#FFF" : "#000",
                        }}
                      >
                        {symptomName(s)}
                      </p>
                      <p
                        className="m-0 text-secondary"
                        style={{ fontSize: "12px" }}
                      >
                        {formatTime(s.loggedAt)}
                        {s.checkIns?.length > 0
                          ? ` · ${s.checkIns.length}/3 check-ins`
                          : ""}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 rounded-pill"
                      style={{
                        backgroundColor: `${severityColor(s.severity)}20`,
                        color: severityColor(s.severity),
                        fontSize: "11px",
                        fontWeight: "600",
                      }}
                    >
                      {severityLabel(s.severity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SymptomHistory;