// src/components/medications/AddMedicationModal.jsx
import { useState, useEffect } from "react";

// Frequency options — display label + backend value + default times
const FREQUENCY_OPTIONS = [
  { value: "once_daily", label: "Once daily", defaultTimes: ["08:00"] },
  { value: "twice_daily", label: "Twice daily", defaultTimes: ["08:00", "20:00"] },
  {
    value: "three_times_daily",
    label: "3 times daily",
    defaultTimes: ["08:00", "13:00", "20:00"],
  },
  { value: "weekly", label: "Weekly", defaultTimes: ["08:00"] },
  { value: "as_needed", label: "As needed", defaultTimes: [] },
];

// Convert a 24h "HH:MM" string into 12-hour picker state
const to12Hour = (time24) => {
  if (!time24) return { hour: "8", minute: "00", period: "AM" };
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return {
    hour: String(h),
    minute: String(mm).padStart(2, "0"),
    period,
  };
};

// Convert 12-hour picker values to "HH:MM" 24-hour string
const to24Hour = (hour, minute, period) => {
  let h = parseInt(hour, 10);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const AddMedicationModal = ({
  isOpen,
  onClose,
  onSave,
  profile_id,
  editingMedication = null,
}) => {
  const isEditMode = Boolean(editingMedication);

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "once_daily",
    startDate: "",
    endDate: "",
  });

  // 12-hour picker state
  const [hour, setHour] = useState("8");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  // Custom mobile picker
  const [activePicker, setActivePicker] = useState(null);

  // Error + loading
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------
  // Prefill when the modal opens or editingMedication changes
  // (Rule disabled: legitimate prop-driven state sync, not a cascading render)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;

    if (editingMedication) {
      setFormData({
        name: editingMedication.name || "",
        dosage: editingMedication.dosage || "",
        frequency: editingMedication.frequency || "once_daily",
        startDate: editingMedication.startDate
          ? editingMedication.startDate.split("T")[0]
          : "",
        endDate: editingMedication.endDate
          ? editingMedication.endDate.split("T")[0]
          : "",
      });

      const firstTime = Array.isArray(editingMedication.scheduleTime)
        ? editingMedication.scheduleTime[0]
        : null;

      if (firstTime) {
        const { hour: h, minute: m, period: p } = to12Hour(firstTime);
        setHour(h);
        setMinute(m);
        setPeriod(p);
      }
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        name: "",
        dosage: "",
        frequency: "once_daily",
        startDate: today,
        endDate: "",
      });
      setHour("8");
      setMinute("00");
      setPeriod("AM");
    }

    setError("");
    setActivePicker(null);
  }, [isOpen, editingMedication]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ----------------------------------------
  // Handlers
  // ----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name.trim()) {
      setError("Medication name is required.");
      return;
    }
    if (!formData.dosage.trim()) {
      setError("Dosage is required.");
      return;
    }
    if (!formData.startDate) {
      setError("Start date is required.");
      return;
    }

    // Build scheduleTime
    const frequencyOption = FREQUENCY_OPTIONS.find(
      (f) => f.value === formData.frequency
    );
    const scheduleTime =
      frequencyOption && frequencyOption.defaultTimes.length > 0
        ? [to24Hour(hour, minute, period)]
        : [];

    const payload = {
      profile_id,
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency,
      scheduleTime,
      startDate: formData.startDate,
      endDate: formData.endDate || null,
    };

    console.log("[AddMedicationModal] Payload:", payload);

    setSaving(true);
    try {
      await onSave(payload);
    } catch (err) {
      console.error("[AddMedicationModal] Save error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save medication. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ----------------------------------------
  // Picker helpers
  // ----------------------------------------
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const handleSelect = (value) => {
    if (activePicker === "hour") setHour(value);
    if (activePicker === "minute") setMinute(value);
    if (activePicker === "period") setPeriod(value);
    setActivePicker(null);
  };

  const renderPicker = () => {
    if (!activePicker) return null;

    let list = [];
    if (activePicker === "hour") list = hours;
    if (activePicker === "minute") list = minutes;
    if (activePicker === "period") list = periods;

    const current =
      activePicker === "hour"
        ? hour
        : activePicker === "minute"
        ? minute
        : period;

    return (
      <div
        className="mt-2 p-2 border rounded-3 bg-light"
        style={{ maxHeight: "150px", overflowY: "auto", borderRadius: "8px" }}
      >
        {list.map((item) => (
          <div
            key={item}
            onClick={() => handleSelect(item)}
            style={{
              padding: "8px",
              cursor: "pointer",
              textAlign: "center",
              borderRadius: "6px",
              fontWeight: "600",
              backgroundColor: item === current ? "#0033CC" : "transparent",
              color: item === current ? "#FFF" : "#000",
            }}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const showTimePicker = formData.frequency !== "as_needed";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div
        className="modal-dialog modal-dialog-centered mx-auto px-3"
        style={{ maxWidth: "440px" }}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-3 px-4 d-flex align-items-center justify-content-between">
            <h5 className="modal-title fw-bold text-dark m-0">
              {isEditMode ? "Edit Medication" : "Add Medication"}
            </h5>
            <button
              type="button"
              className="btn-close ms-0"
              onClick={onClose}
              aria-label="Close"
              disabled={saving}
            />
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-3">
            {error && (
              <div
                className="alert alert-danger py-2 mb-3"
                style={{ fontSize: "13px" }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">
                  Medication name
                </label>
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="e.g. Amlodipine"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  maxLength={150}
                  required
                  disabled={saving}
                />
              </div>

              {/* Dosage */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">
                  Dosage
                </label>
                <input
                  type="text"
                  className="form-control py-2"
                  placeholder="e.g. 5mg, 1 tablet"
                  name="dosage"
                  value={formData.dosage}
                  onChange={handleChange}
                  maxLength={50}
                  required
                  disabled={saving}
                />
              </div>

              {/* Frequency */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">
                  Frequency
                </label>
                <select
                  className="form-select py-2"
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Picker */}
              {showTimePicker && (
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">
                    Time
                  </label>
                  <div className="row g-2">
                    <div className="col-4">
                      <button
                        type="button"
                        className="btn w-100 py-2 text-center fw-semibold"
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "#FFF",
                          border: "1px solid #DEDFE2",
                          color: "#000",
                        }}
                        onClick={() =>
                          setActivePicker(
                            activePicker === "hour" ? null : "hour"
                          )
                        }
                        disabled={saving}
                      >
                        {hour}
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        type="button"
                        className="btn w-100 py-2 text-center fw-semibold"
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "#FFF",
                          border: "1px solid #DEDFE2",
                          color: "#000",
                        }}
                        onClick={() =>
                          setActivePicker(
                            activePicker === "minute" ? null : "minute"
                          )
                        }
                        disabled={saving}
                      >
                        {minute}
                      </button>
                    </div>
                    <div className="col-4">
                      <button
                        type="button"
                        className="btn w-100 py-2 text-center fw-semibold"
                        style={{
                          borderRadius: "8px",
                          backgroundColor: "#FFF",
                          border: "1px solid #DEDFE2",
                          color: "#000",
                        }}
                        onClick={() =>
                          setActivePicker(
                            activePicker === "period" ? null : "period"
                          )
                        }
                        disabled={saving}
                      >
                        {period}
                      </button>
                    </div>
                  </div>
                  {renderPicker()}
                </div>
              )}

              {/* Start + End dates */}
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">
                    Start date
                  </label>
                  <input
                    type="date"
                    className="form-control py-2"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label fw-bold small text-secondary">
                    End date <span className="fw-normal">(optional)</span>
                  </label>
                  <input
                    type="date"
                    className="form-control py-2"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn w-100 text-white mt-2 py-2 fw-bold"
                style={{
                  backgroundColor: saving ? "#999" : "#0033CC",
                  borderRadius: "8px",
                  border: "none",
                }}
                type="submit"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Add Medication"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicationModal;