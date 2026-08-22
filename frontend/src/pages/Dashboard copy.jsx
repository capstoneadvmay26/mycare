function Dashboard({ medication, medicationSaved }) {
  return (
    <div className="container py-5">

      {/* ========================================
          PAGE HEADING
      ======================================== */}

      <div className="mycare-page-heading">
        <div>
          <p className="mycare-eyebrow">
            YOUR HEALTH
          </p>

          <h1>
            Welcome to MYCARE
          </h1>

          <p className="mycare-muted">
            Stay on top of your medications and health routines.
          </p>
        </div>
      </div>


      {/* ========================================
          HEALTH STATISTICS
      ======================================== */}

      <div className="row g-4 mt-2">

        {/* ACTIVE MEDICATIONS */}
        <div className="col-md-4">
          <div className="mycare-card">

            <div className="mycare-stat-icon">
              💊
            </div>

            <h3>
              {medicationSaved ? 1 : 0}
            </h3>

            <p className="mycare-muted">
              Active Medications
            </p>

          </div>
        </div>


        {/* ADHERENCE RATE */}
        <div className="col-md-4">
          <div className="mycare-card">

            <div className="mycare-stat-icon">
              ⏰
            </div>

            <h3>
              0%
            </h3>

            <p className="mycare-muted">
              Adherence Rate
            </p>

          </div>
        </div>


        {/* HEALTH ACTIVITIES */}
        <div className="col-md-4">
          <div className="mycare-card">

            <div className="mycare-stat-icon">
              ❤️
            </div>

            <h3>
              0
            </h3>

            <p className="mycare-muted">
              Health Activities
            </p>

          </div>
        </div>

      </div>


      {/* ========================================
          CURRENT MEDICATION
      ======================================== */}

      {medicationSaved && (
        <div className="row mt-4">

          <div className="col-12">

            <div className="mycare-card p-4">

              <h3>
                💊 Current Medication
              </h3>

              <div className="mt-3">

                <h4>
                  {medication.name}
                </h4>

                <p>
                  <strong>Dosage:</strong>{" "}
                  {medication.dosage}
                </p>

                <p>
                  <strong>Frequency:</strong>{" "}
                  {medication.frequency}
                </p>

                <p>
                  <strong>Reminder:</strong>{" "}
                  {medication.reminderTime}
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Dashboard;