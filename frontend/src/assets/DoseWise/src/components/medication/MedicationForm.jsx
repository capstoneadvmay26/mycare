function MedicationForm({
  medication,
  medicationErrors,
  handleMedicationChange,
  handleMedicationSubmit,
  handleMedicationReset,
  medicationSaved,
}) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card shadow-sm h-100 medication-card">
            <div className="card-body  p-4">
              <h2 className="mb-4">Add New Medication</h2>

              <form onSubmit={handleMedicationSubmit}>
                {/* Medication Name */}

                <div className="mb-3">
                  <label htmlFor="medicationName" className="form-label">
                    Medication Name
                  </label>

                  <input
                    id="medicationName"
                    type="text"
                    name="name"
                    className={`form-control ${
                      medicationErrors.name ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. Paracetamol"
                    value={medication.name}
                    onChange={handleMedicationChange}
                  />

                  {medicationErrors.name && (
                    <div className="invalid-feedback">
                      {medicationErrors.name}
                    </div>
                  )}
                </div>

                {/* Dosage */}

                <div className="mb-3">
                  <label htmlFor="medicationDosage" className="form-label">
                    Dosage
                  </label>

                  <input
                    id="medicationDosage"
                    type="text"
                    name="dosage"
                    className={`form-control ${
                      medicationErrors.dosage ? "is-invalid" : ""
                    }`}
                    placeholder="e.g. 500mg"
                    value={medication.dosage}
                    onChange={handleMedicationChange}
                  />

                  {medicationErrors.dosage && (
                    <div className="invalid-feedback">
                      {medicationErrors.dosage}
                    </div>
                  )}
                </div>

                {/* Frequency */}

                <div className="mb-3">
                  <label htmlFor="medicationFrequency" className="form-label">
                    Frequency
                  </label>

                  <select
                    id="medicationFrequency"
                    name="frequency"
                    className="form-select"
                    value={medication.frequency}
                    onChange={handleMedicationChange}
                  >
                    <option value="Once Daily">Once Daily</option>

                    <option value="Twice Daily">Twice Daily</option>

                    <option value="Three Times Daily">Three Times Daily</option>

                    <option value="As Needed">As Needed</option>
                  </select>
                </div>

                {/* Dates */}

                <div className="col-md-6 mb-3">
                  <label htmlFor="medicationStartDate" className="form-label">
                    Start Date
                  </label>

                  <input
                    id="medicationStartDate"
                    type="date"
                    name="startDate"
                    className={`form-control ${
                      medicationErrors.startDate ? "is-invalid" : ""
                    }`}
                    value={medication.startDate}
                    onChange={handleMedicationChange}
                  />

                  {medicationErrors.startDate && (
                    <div className="invalid-feedback">
                      {medicationErrors.startDate}
                    </div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="medicationEndDate" className="form-label">
                    End Date
                  </label>

                  <input
                    id="medicationEndDate"
                    type="date"
                    name="endDate"
                    className={`form-control ${
                      medicationErrors.endDate ? "is-invalid" : ""
                    }`}
                    value={medication.endDate}
                    onChange={handleMedicationChange}
                  />

                  {medicationErrors.endDate && (
                    <div className="invalid-feedback">
                      {medicationErrors.endDate}
                    </div>
                  )}
                </div>

                {/* Reminder Time */}

                <div className="mb-3">
                  <label
                    htmlFor="medicationReminderTime"
                    className="form-label"
                  >
                    Reminder Time
                  </label>

                  <input
                    id="medicationReminderTime"
                    type="time"
                    name="reminderTime"
                    className="form-control"
                    value={medication.reminderTime}
                    onChange={handleMedicationChange}
                  />
                </div>

                {/* Notes */}

                <div className="mb-3">
                  <label htmlFor="medicationNotes" className="form-label">
                    Notes
                  </label>

                  <textarea
                    id="medicationNotes"
                    name="notes"
                    className="form-control"
                    rows="3"
                    placeholder="Additional instructions..."
                    value={medication.notes}
                    onChange={handleMedicationChange}
                  />
                </div>

                {medicationSaved && (
                  <div className="alert alert-success">
                    Medication saved successfully!
                  </div>
                )}

                {/* Buttons */}

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">
                    Save Medication
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleMedicationReset}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicationForm;
