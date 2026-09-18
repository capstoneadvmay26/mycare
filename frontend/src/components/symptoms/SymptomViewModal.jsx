// src/components/symptoms/SymptomViewModal.jsx
import { useState, useEffect } from "react";
import { Pencil, Trash, X, Check } from "react-bootstrap-icons";

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild", color: "#4CBB17" },
  { value: "moderate", label: "Moderate", color: "#F7C81B" },
  { value: "severe", label: "Severe", color: "#F97316" },
  { value: "very_severe", label: "Very severe", color: "#D92D20" },
];

const STATUS_COLORS = {
  better: "#4CBB17",
  same: "#666",
  worse: "#D92D20",
  improving: "#4CBB17",
  worsening: "#D92D20",
  resolved: "#0033CC",
};

const STATUS_LABELS = {
  better: "Better",
  same: "Same",
  worse: "Worse",
  improving: "Improving",
  worsening: "Worsening",
  resolved: "Resolved",
};

const formatDate = (iso) => {
  if (!iso) return "Not set";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Not set";
  }
};

/**
 * Derive a symptom status from its check-ins:
 *   - 3 check-ins done + any "worse" → Worsening
 *   - 3 check-ins done + any "better" and no "worse" → Improving
 *   - 3 check-ins done + all "same" → Same
 *   - < 3 check-ins → In progress (N/3)
 */
const deriveStatus = (symptom) => {
  const checkIns = symptom.checkIns || [];
  if (checkIns.length === 0) {
    return { key: "pending", label: "Pending", color: "#666" };
  }
  if (checkIns.length < 3) {
    return {
      key: "in_progress",
      label: `In progress (${checkIns.length}/3)`,
      color: "#0033CC",
    };
  }

  const hasWorse = checkIns.some((c) => c.status === "worse");
  const hasBetter = checkIns.some((c) => c.status === "better");

  if (hasWorse) return { key: "worsening", label: "Worsening", color: STATUS_COLORS.worsening };
  if (hasBetter) return { key: "improving", label: "Improving", color: STATUS_COLORS.improving };
  return { key: "same", label: "Same", color: STATUS_COLORS.same };
};

const SymptomViewModal = ({ symptom, onClose, onUpdate, onDelete, saving }) => {
  const [editing, setEditing] = useState(false);
  const [severity, setSeverity] = useState(symptom?.severity || "mild");
  const [otherSymptom, setOtherSymptom] = useState(symptom?.otherSymptom || "");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState("");

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!symptom) return;
    setSeverity(symptom.severity || "mild");
    setOtherSymptom(symptom.otherSymptom || "");
    setEditing(false);
    setShowDeleteConfirm(false);
    setError("");
  }, [symptom]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!symptom) return null;

  const status = deriveStatus(symptom);
  const severityMeta =
    SEVERITY_OPTIONS.find((s) => s.value === symptom.severity) ||
    SEVERITY_OPTIONS[0];
  const symptomName = symptom.symptoms?.length
    ? symptom.symptoms.join(", ")
    : symptom.otherSymptom || "Unknown symptom";

  const handleSave = async () => {
    setError("");
    try {
      await onUpdate({ severity, otherSymptom });
      setEditing(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update symptom."
      );
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete symptom."
      );
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}
      onClick={saving ? null : onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable mx-auto px-3"
        style={{ maxWidth: "440px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <div className="modal-header border-0 pt-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-dark m-0">
              Symptom Details
            </h5>
            <button
              type="button"
              className="btn-close ms-0"
              onClick={onClose}
              aria-label="Close"
              disabled={saving}
            />
          </div>

          <div className="modal-body px-4 py-2">
            {error && (
              <div className="alert alert-danger py-2 mb-3" style={{ fontSize: "13px" }}>
                {error}
              </div>
            )}

            {/* Symptom name */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary mb-1">
                Symptom
              </label>
              <p className="m-0 fw-bold" style={{ fontSize: "16px" }}>
                {symptomName}
              </p>
            </div>

            {/* Severity (editable) */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <label className="form-label fw-bold small text-secondary mb-0">
                  Severity
                </label>
                {!editing && (
                  <button
                    type="button"
                    className="btn btn-sm text-secondary border-0 p-0"
                    onClick={() => setEditing(true)}
                    disabled={saving}
                    title="Edit severity"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>

              {editing ? (
                <>
                  <div className="d-flex flex-column gap-2 mb-2">
                    {SEVERITY_OPTIONS.map((opt) => {
                      const active = severity === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSeverity(opt.value)}
                          className="btn d-flex align-items-center gap-2 text-start"
                          style={{
                            border: active
                              ? "2px solid #0033CC"
                              : "1px solid rgba(0,0,0,0.15)",
                            backgroundColor: active
                              ? "rgba(0,51,204,0.06)"
                              : "#FFF",
                            borderRadius: "10px",
                            padding: "10px 14px",
                          }}
                          disabled={saving}
                        >
                          <span
                            className="rounded-circle"
                            style={{
                              width: "12px",
                              height: "12px",
                              backgroundColor: opt.color,
                              flexShrink: 0,
                            }}
                          />
                          <span
                            className="fw-semibold"
                            style={{ fontSize: "14px" }}
                          >
                            {opt.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn flex-grow-1 fw-bold text-white"
                      style={{
                        backgroundColor: saving ? "#999" : "#0033CC",
                        borderRadius: "8px",
                        border: "none",
                        padding: "10px",
                      }}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      <Check size={14} className="me-1" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="btn fw-bold"
                      style={{
                        backgroundColor: "transparent",
                        border: "1px solid #0033CC",
                        color: "#0033CC",
                        borderRadius: "8px",
                        padding: "10px 16px",
                      }}
                      onClick={() => {
                        setSeverity(symptom.severity || "mild");
                        setEditing(false);
                      }}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <span
                  className="px-3 py-1 rounded-pill fw-bold"
                  style={{
                    backgroundColor: `${severityMeta.color}20`,
                    color: severityMeta.color,
                    fontSize: "13px",
                  }}
                >
                  {severityMeta.label}
                </span>
              )}
            </div>

            {/* Status (derived, read-only) */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary mb-1">
                Status
              </label>
              <div>
                <span
                  className="px-3 py-1 rounded-pill fw-bold"
                  style={{
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                    fontSize: "13px",
                  }}
                >
                  {status.label}
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div
              className="rounded-3 p-3 mb-3"
              style={{
                backgroundColor: "rgba(0, 51, 204, 0.04)",
                border: "1px solid rgba(0, 51, 204, 0.15)",
              }}
            >
              <p className="fw-bold small text-secondary mb-2" style={{ fontSize: "12px" }}>
                📅 Timeline
              </p>
              <p className="mb-1" style={{ fontSize: "13px" }}>
                <span className="text-secondary">Logged: </span>
                {formatDate(symptom.loggedAt)}
              </p>
              {symptom.checkIns?.length > 0 && (
                <div className="mt-2">
                  <span className="text-secondary" style={{ fontSize: "13px" }}>
                    Check-ins:
                  </span>
                  <div className="d-flex flex-column gap-1 mt-1">
                    {symptom.checkIns.map((c, i) => (
                      <div
                        key={i}
                        className="d-flex align-items-center gap-2"
                        style={{ fontSize: "13px" }}
                      >
                        <span
                          className="rounded-circle"
                          style={{
                            width: "8px",
                            height: "8px",
                            backgroundColor:
                              STATUS_COLORS[c.status] || "#666",
                            flexShrink: 0,
                          }}
                        />
                        <span className="fw-semibold">
                          Day {c.day}: {STATUS_LABELS[c.status] || c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Delete action */}
            {!showDeleteConfirm ? (
              <button
                type="button"
                className="btn w-100 fw-bold py-2 mb-1"
                style={{
                  backgroundColor: "rgba(217, 45, 32, 0.08)",
                  color: "#D92D20",
                  borderRadius: "8px",
                  border: "1px solid rgba(217, 45, 32, 0.2)",
                }}
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving}
              >
                <Trash size={16} className="me-2" />
                Delete this symptom
              </button>
            ) : (
              <div
                className="rounded-3 p-3 mb-1"
                style={{
                  backgroundColor: "rgba(217, 45, 32, 0.06)",
                  border: "1px solid rgba(217, 45, 32, 0.2)",
                }}
              >
                <p className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                  Delete {symptomName}?
                </p>
                <p className="text-secondary mb-3" style={{ fontSize: "12px" }}>
                  This permanently removes the symptom and its check-ins.
                  This action cannot be undone.
                </p>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn flex-grow-1 fw-bold text-white py-2"
                    style={{
                      backgroundColor: saving ? "#999" : "#D92D20",
                      borderRadius: "8px",
                      border: "none",
                    }}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    {saving ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button
                    type="button"
                    className="btn flex-grow-1 fw-bold py-2"
                    style={{
                      backgroundColor: "#FFF",
                      color: "#0033CC",
                      borderRadius: "8px",
                      border: "1px solid #0033CC",
                    }}
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomViewModal;