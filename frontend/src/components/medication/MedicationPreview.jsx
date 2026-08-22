function MedicationPreview({ medication }) {

  const hasMedication =
    medication.name ||
    medication.dosage ||
    medication.startDate ||
     medication.endDate ||
    medication.reminderTime;

  return (
    <div className="card shadow-sm h-100 medication-card medication-preview">

      <div className="card-body p-4">

        <div className="d-flex align-items-center mb-4">

          <div className="medication-icon me-3">
            💊
          </div>

          <div>

            <h4 className="mb-1">
              Medication Preview
            </h4>

            <p className="dosewise-muted mb-0">
              Review your medication details
            </p>

          </div>

        </div>


        {!hasMedication ? (

          <div className="text-center py-5">

            <div className="display-4 mb-3">
              💊
            </div>

            <p className="dosewise-muted">
              Start filling the form to preview
              your medication.
            </p>

          </div>

        ) : (

          <div>

            <div className="mb-4">

              <small className="text-muted">
                Medication
              </small>

              <h3 className="mb-0">
                {medication.name || "Medication name"}
              </h3>

            </div>


            <div className="row g-3">

              <div className="col-6">

                <div className="preview-item">

                  <small className="text-muted">
                    Dosage
                  </small>

                  <div className="fw-semibold">
                    {medication.dosage || "—"}
                  </div>

                </div>

              </div>


              <div className="col-6">

                <div className="preview-item">

                  <small className="text-muted">
                    Frequency
                  </small>

                  <div className="fw-semibold">
                    {medication.frequency || "—"}
                  </div>

                </div>

              </div>


              <div className="col-6">

                <div className="preview-item">

                  <small className="text-muted">
                    Start Date
                  </small>

                  <div className="fw-semibold">
                    {medication.startDate || "—"}
                  </div>

                </div>

              </div>


              <div className="col-6">

                <div className="preview-item">

                  <small className="text-muted">
                    End Date
                  </small>

                  <div className="fw-semibold">
                    {medication.endDate || "—"}
                  </div>

                </div>

              </div>


              <div className="col-6">

                <div className="preview-item">

                  <small className="text-muted">
                    Reminder
                  </small>

                  <div className="fw-semibold">
                    {medication.reminderTime || "—"}
                  </div>

                </div>

              </div>

            </div>


            {medication.notes && (

              <div className="mt-4">

                <small className="text-muted">
                  Notes
                </small>

                <p className="mb-0 mt-1">
                  {medication.notes}
                </p>

              </div>

            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default MedicationPreview;