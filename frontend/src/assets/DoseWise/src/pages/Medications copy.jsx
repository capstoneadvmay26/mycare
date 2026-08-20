import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Medications() {
  // Stores medications received from the backend
  const [medications, setMedications] = useState([]);

  // Tracks whether data is still loading
  const [loading, setLoading] = useState(true);

  // Stores any error message
  const [error, setError] = useState("");

  // Get medications from the backend
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        // Make GET request to backend
        const response = await axios.get(
          "http://localhost:5000/api/medications"
        );

        // Store backend data in React state
        setMedications(response.data);

      } catch (error) {
        console.error("Error fetching medications:", error);

        setError("Unable to load medications. Please try again.");

      } finally {
        // Stop loading whether request succeeds or fails
        setLoading(false);
      }
    };

    fetchMedications();
  }, []);

  return (
    <div className="container py-5">

      {/* Page Heading */}
      <div className="dosewise-page-heading">

        <div>
          <p className="dosewise-eyebrow">
            MEDICATION MANAGEMENT
          </p>

          <h1>My Medications</h1>

          <p className="dosewise-muted">
            Manage your medications and medication schedules.
          </p>
        </div>

        <Link
          to="/medications/add"
          className="btn btn-primary"
        >
          + Add Medication
        </Link>

      </div>


      {/* Loading State */}
      {loading && (
        <div className="dosewise-card mt-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3"></div>

            <p className="dosewise-muted mb-0">
              Loading your medications...
            </p>
          </div>
        </div>
      )}


      {/* Error State */}
      {!loading && error && (
        <div className="alert alert-danger mt-4">
          {error}
        </div>
      )}


      {/* Empty State */}
      {!loading && !error && medications.length === 0 && (
        <div className="dosewise-card mt-4">
          <div className="text-center py-5">

            <div className="fs-1">
              💊
            </div>

            <h3 className="mt-3">
              No medications yet
            </h3>

            <p className="dosewise-muted">
              Add your first medication to start tracking
              your routine.
            </p>

            <Link
              to="/medications/add"
              className="btn btn-outline-primary mt-3"
            >
              Add Your First Medication
            </Link>

          </div>
        </div>
      )}


      {/* Medication List */}
      {!loading && !error && medications.length > 0 && (
        <div className="row g-4 mt-3">

          {medications.map((medication) => (

            <div
              className="col-12 col-md-6"
              key={medication.id}
            >

              <div className="dosewise-card h-100 p-4">

                {/* Medication Icon */}
                <div className="fs-1 mb-3">
                  💊
                </div>


                {/* Medication Name */}
                <h2 className="h4 mb-3">
                  {medication.name}
                </h2>


                {/* Dosage */}
                <p className="mb-2">
                  <strong>Dosage:</strong>{" "}
                  {medication.dosage}
                </p>


                {/* Frequency */}
                <p className="mb-0">
                  <strong>Frequency:</strong>{" "}
                  {medication.frequency}
                </p>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default Medications;