import { Link } from "react-router-dom";

function Home() {

  return (
    <div className="container py-5">

      <div className="row align-items-center g-5">

        <div className="col-lg-7">

          <p className="dosewise-eyebrow">
            YOUR HEALTH. YOUR ROUTINE. YOUR CONTROL.
          </p>

          <h1 className="display-4 fw-bold">
            Stay on top of
            your health with
            DoseWise.
          </h1>

          <p className="lead dosewise-muted mt-3">
            Track medications, manage reminders,
            monitor symptoms, and prepare for
            better health conversations.
          </p>

          <div className="d-flex gap-3 mt-4">

            <Link
              to="/dashboard"
              className="btn btn-primary"
            >
              Go to Dashboard
            </Link>

            <Link
              to="/medications/add"
              className="btn btn-outline-primary"
            >
              Add Medication
            </Link>

          </div>

        </div>


        <div className="col-lg-5">

          <div className="dosewise-hero-card">

            <div className="display-1">
              💊
            </div>

            <h3>
              Your health routine,
              simplified.
            </h3>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Home;