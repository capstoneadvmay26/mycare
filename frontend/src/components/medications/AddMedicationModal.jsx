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

  // Array of time slots — one per dose for the current frequency
  // Each slot: { hour, minute, period, activePicker }
  const [timeSlots, setTimeSlots] = useState([
    { hour: "8", minute: "00", period: "AM", activePicker: null },
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ----------------------------------------
  // Prefill when modal opens or editingMedication changes
  // ----------------------------------------
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

      // Build time slots from scheduleTime array
      const times = Array.isArray(editingMedication.scheduleTime)
        ? editingMedication.scheduleTime
        : [];
      const slots = times.map((t) => {
        const parsed = to12Hour(t);
        return { ...parsed, activePicker: null };
      });
      setTimeSlots(
        slots.length > 0
          ? slots
          : [{ hour: "8", minute: "00", period: "AM", activePicker: null }]
      );
    } else {
      const today = new Date().toISOString().split("T")[0];
      setFormData({
        name: "",
        dosage: "",
        frequency: "once_daily",
        startDate: today,
        endDate: "",
      });
      setTimeSlots([
        { hour: "8", minute: "00", period: "AM", activePicker: null },
      ]);
    }

    setError("");
  }, [isOpen, editingMedication]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // ----------------------------------------
  // When frequency changes, rebuild the time slots
  // ----------------------------------------
  const handleFrequencyChange = (newFrequency) => {
    setFormData((prev) => ({ ...prev, frequency: newFrequency }));

    const option = FREQUENCY_OPTIONS.find((f) => f.value === newFrequency);
    const defaults = option?.defaultTimes || [];

    const slots = defaults.map((t) => {
      const parsed = to12Hour(t);
      return { ...parsed, activePicker: null };
    });

    setTimeSlots(slots);
  };

  // ----------------------------------------
  // Handlers
  // ----------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const updateSlot = (index, field, value) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    );
  };

  const togglePicker = (index, pickerType) => {
    setTimeSlots((prev) =>
      prev.map((slot, i) => ({
        ...slot,
        activePicker:
          i === index
            ? slot.activePicker === pickerType
              ? null
              : pickerType
            : null, // close other pickers
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

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
    if (!profile_id) {
      setError("Profile not loaded. Please try again.");
      return;
    }

    // Build scheduleTime array from all slots
    const scheduleTime = timeSlots.map((s) =>
      to24Hour(s.hour, s.minute, s.period)
    );

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
  // Picker options
  // ----------------------------------------
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  const renderPicker = (slotIndex, slot) => {
    if (!slot.activePicker) return null;

    let list = [];
    if (slot.activePicker === "hour") list = hours;
    if (slot.activePicker === "minute") list = minutes;
    if (slot.activePicker === "period") list = periods;

    const current =
      slot.activePicker === "hour"
        ? slot.hour
        : slot.activePicker === "minute"
        ? slot.minute
        : slot.period;

    return (
      <div
        className="mt-2 p-2 border rounded-3 bg-light"
        style={{ maxHeight: "150px", overflowY: "auto", borderRadius: "8px" }}
      >
        {list.map((item) => (
          <div
            key={item}
            onClick={() => {
              updateSlot(slotIndex, slot.activePicker, item);
              updateSlot(slotIndex, "activePicker", null);
            }}
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
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable mx-auto px-3"
        style={{ maxWidth: "440px" }}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
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
                  onChange={(e) => handleFrequencyChange(e.target.value)}
                  disabled={saving}
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Multiple Time Pickers */}
              {showTimePicker && (
                <div className="mb-3">
                  <label className="form-label fw-bold small text-secondary">
                    {timeSlots.length === 1 ? "Time" : "Times"}
                  </label>

                  {timeSlots.map((slot, index) => (
                    <div key={index} className="mb-2">
                      <div className="d-flex align-items-center mb-1">
                        <span
                          className="text-secondary me-2"
                          style={{ fontSize: "12px", minWidth: "50px" }}
                        >
                          Dose {index + 1}
                        </span>
                      </div>
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
                            onClick={() => togglePicker(index, "hour")}
                            disabled={saving}
                          >
                            {slot.hour}
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
                            onClick={() => togglePicker(index, "minute")}
                            disabled={saving}
                          >
                            {slot.minute}
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
                            onClick={() => togglePicker(index, "period")}
                            disabled={saving}
                          >
                            {slot.period}
                          </button>
                        </div>
                      </div>
                      {renderPicker(index, slot)}
                    </div>
                  ))}
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