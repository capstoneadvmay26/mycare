// src/pages/Symptoms.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus, ExclamationCircle, ArrowRight } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import {
  getSymptoms,
  getSymptomStatus,
  updateSymptom,
  deleteSymptom,
} from "../services/api";
import SymptomViewModal from "../components/symptoms/SymptomViewModal";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Derive a displayable status from check-ins
const deriveStatus = (symptom) => {
  const checkIns = symptom.checkIns || [];
  if (checkIns.length === 0)
    return { key: "pending", label: "Pending", color: "#666" };
  if (checkIns.length < 3) {
    return {
      key: "in_progress",
      label: `Day ${checkIns.length}/3`,
      color: "#0033CC",
    };
  }
  const hasWorse = checkIns.some((c) => c.status === "worse");
  const hasBetter = checkIns.some((c) => c.status === "better");
  if (hasWorse)
    return { key: "worsening", label: "Worsening", color: "#D92D20" };
  if (hasBetter)
    return { key: "improving", label: "Improving", color: "#4CBB17" };
  return { key: "same", label: "No change", color: "#666" };
};

const Symptoms = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkInDueFor, setCheckInDueFor] = useState(null);
  const [viewingSymptom, setViewingSymptom] = useState(null);
  const [saving, setSaving] = useState(false);

  // ------------------------------------------------------------
  // Fetch + filter + compute check-in availability
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

      const now = Date.now();

      const recentSymptoms = allSymptoms.filter((s) => {
        const checkIns = s.checkIns?.length || 0;
        if (checkIns < 3) return true;
        const loggedAt = new Date(s.loggedAt).getTime();
        return now - loggedAt <= SEVEN_DAYS_MS;
      });

      const enriched = await Promise.all(
        recentSymptoms.map(async (s) => {
          try {
            const statusResp = await getSymptomStatus(s._id);
            return { ...s, status: statusResp.data };
          } catch {
            return { ...s, status: null };
          }
        })
      );

      setSymptoms(enriched);

      const isCheckInAvailable = (symptom) => {
        const checkIns = symptom.checkIns?.length || 0;
        if (checkIns >= 3) return false;
        if (!symptom.loggedAt) return false;
        if (checkIns === 0) {
          const loggedAt = new Date(symptom.loggedAt).getTime();
          return now - loggedAt >= ONE_DAY_MS;
        }
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
        err.response?.data?.message || err.message || "Failed to load symptoms"
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

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
  // Update + delete handlers
  // ------------------------------------------------------------
  const handleUpdate = async (updates) => {
    if (!viewingSymptom) return;
    setSaving(true);
    try {
      const payload = {
        symptoms: viewingSymptom.symptoms || [],
        otherSymptom:
          updates.otherSymptom !== undefined
            ? updates.otherSymptom
            : viewingSymptom.otherSymptom || "",
        severity: updates.severity || viewingSymptom.severity,
      };
      await updateSymptom(viewingSymptom._id, payload);
      await fetchData();
      setViewingSymptom((prev) => ({ ...prev, ...updates }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!viewingSymptom) return;
    setSaving(true);
    try {
      await deleteSymptom(viewingSymptom._id);
      setViewingSymptom(null);
      await fetchData();
    } finally {
      setSaving(false);
    }
  };

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
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Fixed header */}
      <div className="p-3 pb-0">
        <div className="d-flex justify-content-between align-items-center mb-3">
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
                style={{ fontSize: "14px", color: isDark ? "#FFF" : "#000" }}
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
                  checkInDueFor._id
                );
                setCurrentTab("CheckIn");
              }}
            >
              Check in
            </button>
          </div>
        ) : (
          <div
            className="text-center p-2 mb-3 rounded-3"
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
      </div>

      {/* Scrollable list */}
      <div className="flex-grow-1 overflow-auto px-3">
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
            <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
              Loading symptoms...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
            {error}
          </div>
        )}

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

        {!loading && !error && symptoms.length > 0 && (
          <div className="d-flex flex-column gap-2 pb-2">
            {symptoms.map((s) => {
              const status = deriveStatus(s);
              return (
                <div
                  key={s._id}
                  className="p-3"
                  style={{
                    border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
                    borderRadius: "12px",
                    cursor: "pointer",
                  }}
                  onClick={() => setViewingSymptom(s)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
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
                      <p
                        className="m-0"
                        style={{ fontSize: "13px", color: "#888" }}
                      >
                        {formatTime(s.loggedAt)}
                        {s.checkIns?.length > 0
                          ? ` · ${s.checkIns.length}/3 check-ins`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        backgroundColor: `${severityColor(s.severity)}20`,
                        color: severityColor(s.severity),
                        fontSize: "11px",
                      }}
                    >
                      {severityLabel(s.severity)}
                    </span>

                    <span
                      className="px-2 py-1 rounded-pill fw-bold"
                      style={{
                        backgroundColor: `${status.color}20`,
                        color: status.color,
                        fontSize: "11px",
                      }}
                    >
                      {status.label}
                    </span>

                    {s.professionalCareNudge?.shown && (
                      <span
                        className="px-2 py-1 rounded-pill fw-bold"
                        style={{
                          backgroundColor: "rgba(217,45,32,0.15)",
                          color: "#D92D20",
                          fontSize: "11px",
                        }}
                      >
                        ⚕️ See doctor
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div
        className="p-3 border-top"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn w-100 fw-bold py-3 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "#DEDFE2",
            color: "#000",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("SymptomHistory")}
        >
          View Symptom History
          <ArrowRight size={16} className="ms-2" />
        </button>
      </div>

      {viewingSymptom && (
        <SymptomViewModal
          symptom={viewingSymptom}
          onClose={() => setViewingSymptom(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Symptoms;