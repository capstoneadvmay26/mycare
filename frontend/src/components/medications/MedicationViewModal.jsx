// src/components/medications/MedicationViewModal.jsx
import { useState, useEffect, useMemo } from "react";
import { Pencil, Trash, X, Check } from "react-bootstrap-icons";

// Format a "HH:MM" 24h string into "H:MM AM/PM"
const formatTime = (time24) => {
  if (!time24) return "";
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${h}:${String(mm).padStart(2, "0")} ${period}`;
};

// Format an ISO date string as "Sep 17, 2026"
const formatDate = (isoString) => {
  if (!isoString) return "Not set";
  try {
    return new Date(isoString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Not set";
  }
};

// Human-readable frequency label
const FREQUENCY_LABELS = {
  once_daily: "Once daily",
  twice_daily: "Twice daily",
  three_times_daily: "3 times daily",
  weekly: "Weekly",
  as_needed: "As needed",
};

const MedicationViewModal = ({
  medication,
  onClose,
  onArchive,
  onUpdateCosmetic,
  saving = false,
}) => {
  // Local edit state for name/dosage only
  const [editingName, setEditingName] = useState(false);
  const [editingDosage, setEditingDosage] = useState(false);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  // "now" — updated every 60s to keep refill estimate fresh.
  // Using setInterval defers the setState call, avoiding the
  // "setState synchronously within an effect" ESLint warning.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // Prefill state from medication whenever it changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!medication) return;
    setName(medication.name || "");
    setDosage(medication.dosage || "");
    setEditingName(false);
    setEditingDosage(false);
    setShowArchiveConfirm(false);
    setLocalError("");
  }, [medication]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Refill estimate — computed with useMemo, no impure call during render
  const refillEstimate = useMemo(() => {
    if (!medication) return null;
    if (medication.frequency === "as_needed") return null;

    const startDate = medication.startDate
      ? new Date(medication.startDate)
      : new Date();

    const daysSinceStart = Math.max(
      0,
      Math.floor((now - startDate.getTime()) / (24 * 60 * 60 * 1000))
    );

    const daysUntilRefill = Math.max(0, 30 - daysSinceStart);

    return { daysSinceStart, daysUntilRefill };
  }, [medication, now]);

  if (!medication) return null;

  const scheduleTimes = Array.isArray(medication.scheduleTime)
    ? medication.scheduleTime
    : [];

  const hasCosmeticChanges =
    name.trim() !== (medication.name || "").trim() ||
    dosage.trim() !== (medication.dosage || "").trim();

  const handleSaveCosmetic = async () => {
    setLocalError("");

    if (!name.trim()) {
      setLocalError("Name cannot be empty.");
      return;
    }
    if (!dosage.trim()) {
      setLocalError("Dosage cannot be empty.");
      return;
    }

    try {
      await onUpdateCosmetic({
        name: name.trim(),
        dosage: dosage.trim(),
      });
      setEditingName(false);
      setEditingDosage(false);
    } catch (err) {
      console.error("[MedicationViewModal] update error:", err);
      setLocalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save changes."
      );
    }
  };

  const handleArchiveConfirm = async () => {
    try {
      await onArchive(medication);
    } catch (err) {
      console.error("[MedicationViewModal] archive error:", err);
      setLocalError(
        err.response?.data?.message ||
          err.message ||
          "Failed to archive medication."
      );
      setShowArchiveConfirm(false);
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
          {/* Header */}
          <div className="modal-header border-0 pt-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-dark m-0">
              Medication Details
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
            {localError && (
              <div
                className="alert alert-danger py-2 mb-3"
                style={{ fontSize: "13px" }}
              >
                {localError}
              </div>
            )}

            {/* Name (editable) */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary mb-1">
                Medication name
              </label>
              <div className="d-flex align-items-center gap-2">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      className="form-control py-2"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={saving}
                      maxLength={150}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-sm text-primary border-0"
                      onClick={() => {
                        setName(medication.name || "");
                        setEditingName(false);
                      }}
                      disabled={saving}
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="fw-bold flex-grow-1"
                      style={{ fontSize: "16px" }}
                    >
                      {name || medication.name}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm text-secondary border-0"
                      onClick={() => setEditingName(true)}
                      disabled={saving}
                      title="Edit name"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Dosage (editable) */}
            <div className="mb-3">
              <label className="form-label fw-bold small text-secondary mb-1">
                Dosage
              </label>
              <div className="d-flex align-items-center gap-2">
                {editingDosage ? (
                  <>
                    <input
                      type="text"
                      className="form-control py-2"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      disabled={saving}
                      maxLength={50}
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn btn-sm text-primary border-0"
                      onClick={() => {
                        setDosage(medication.dosage || "");
                        setEditingDosage(false);
                      }}
                      disabled={saving}
                      title="Cancel"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <span
                      className="flex-grow-1"
                      style={{ fontSize: "15px" }}
                    >
                      {dosage || medication.dosage}
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm text-secondary border-0"
                      onClick={() => setEditingDosage(true)}
                      disabled={saving}
                      title="Edit dosage"
                    >
                      <Pencil size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Save cosmetic changes */}
            {hasCosmeticChanges && (
              <div className="mb-3">
                <button
                  type="button"
                  className="btn w-100 fw-bold text-white py-2"
                  style={{
                    backgroundColor: saving ? "#999" : "#0033CC",
                    borderRadius: "8px",
                    border: "none",
                  }}
                  onClick={handleSaveCosmetic}
                  disabled={saving}
                >
                  <Check size={16} className="me-2" />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}

            {/* Locked section */}
            <div
              className="rounded-3 p-3 mb-3"
              style={{
                backgroundColor: "rgba(0, 51, 204, 0.04)",
                border: "1px solid rgba(0, 51, 204, 0.15)",
              }}
            >
              <p
                className="fw-bold small text-secondary mb-2"
                style={{ fontSize: "12px" }}
              >
                🔒 Schedule (locked)
              </p>

              <div className="mb-2">
                <span
                  className="fw-semibold d-block"
                  style={{ fontSize: "13px", color: "#666" }}
                >
                  Times
                </span>
                <span style={{ fontSize: "15px" }}>
                  {scheduleTimes.length > 0
                    ? scheduleTimes.map(formatTime).join(", ")
                    : "No times set"}
                </span>
              </div>

              <div className="mb-2">
                <span
                  className="fw-semibold d-block"
                  style={{ fontSize: "13px", color: "#666" }}
                >
                  Frequency
                </span>
                <span style={{ fontSize: "15px" }}>
                  {FREQUENCY_LABELS[medication.frequency] ||
                    medication.frequency}
                </span>
              </div>

              <div className="mb-2">
                <span
                  className="fw-semibold d-block"
                  style={{ fontSize: "13px", color: "#666" }}
                >
                  Start date
                </span>
                <span style={{ fontSize: "15px" }}>
                  {formatDate(medication.startDate)}
                </span>
              </div>

              {medication.endDate && (
                <div>
                  <span
                    className="fw-semibold d-block"
                    style={{ fontSize: "13px", color: "#666" }}
                  >
                    End date
                  </span>
                  <span style={{ fontSize: "15px" }}>
                    {formatDate(medication.endDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Refill estimate */}
            {refillEstimate && (
              <div
                className="rounded-3 p-3 mb-3"
                style={{
                  backgroundColor: "rgba(76, 187, 23, 0.06)",
                  border: "1px solid rgba(76, 187, 23, 0.2)",
                }}
              >
                <p
                  className="fw-bold small mb-2"
                  style={{ fontSize: "12px", color: "#4CBB17" }}
                >
                  💊 Refill estimate
                </p>
                <div className="d-flex align-items-baseline gap-2 mb-1">
                  <span
                    className="fw-bold"
                    style={{ fontSize: "20px", color: "#4CBB17" }}
                  >
                    {refillEstimate.daysUntilRefill}
                  </span>
                  <span
                    className="text-secondary"
                    style={{ fontSize: "13px" }}
                  >
                    days until suggested refill
                  </span>
                </div>
                <p
                  className="m-0 text-secondary"
                  style={{ fontSize: "11px" }}
                >
                  Based on a typical 30-day supply. Confirm with your
                  pharmacist.
                </p>
              </div>
            )}

            {/* Archive action */}
            {!showArchiveConfirm ? (
              <button
                type="button"
                className="btn w-100 fw-bold py-2 mb-1"
                style={{
                  backgroundColor: "rgba(217, 45, 32, 0.08)",
                  color: "#D92D20",
                  borderRadius: "8px",
                  border: "1px solid rgba(217, 45, 32, 0.2)",
                }}
                onClick={() => setShowArchiveConfirm(true)}
                disabled={saving}
              >
                <Trash size={16} className="me-2" />
                Archive this medication
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
                  Archive {medication.name}?
                </p>
                <p
                  className="text-secondary mb-3"
                  style={{ fontSize: "12px" }}
                >
                  This stops future reminders. Your adherence history stays
                  intact. You can find it under the Archived tab.
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
                    onClick={handleArchiveConfirm}
                    disabled={saving}
                  >
                    {saving ? "Archiving..." : "Yes, archive"}
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
                    onClick={() => setShowArchiveConfirm(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <p
              className="text-center text-secondary mb-0 mt-2"
              style={{ fontSize: "11px", fontStyle: "italic" }}
            >
              Schedule cannot be edited after creation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationViewModal;