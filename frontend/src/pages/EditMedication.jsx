function EditMedication() {
  return (
    <section className="container py-5">
      <div className="mycare-page-heading">
        <div>
          <p className="mycare-eyebrow">
            MEDICATION MANAGEMENT
          </p>

          <h1>Edit Medication</h1>

          <p className="mycare-muted">
            Update your medication details and reminder schedule.
          </p>
        </div>
      </div>

      <div className="mycare-card p-4 mt-4">
        <p className="mycare-muted mb-0">
          Medication editing will be connected to the backend
          medication API during feature implementation.
        </p>
      </div>
    </section>
  );
}

export default EditMedication;