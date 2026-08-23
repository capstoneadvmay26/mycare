import MedicationForm from "../components/medication/MedicationForm.jsx";
import MedicationPreview from "../components/medication/MedicationPreview.jsx";

function AddMedication({
  medication,
  medicationErrors,
  handleMedicationChange,
  handleMedicationSubmit,
  handleMedicationReset,
  medicationSaved,
}) {

  return (
    <div className="container py-5">

      {/* heading */}

      <div className="row g-4 mt-2">

        <div className="col-lg-7">

          <MedicationForm
            medication={medication}
            medicationErrors={medicationErrors}
            handleMedicationChange={handleMedicationChange}
            handleMedicationSubmit={handleMedicationSubmit}
            handleMedicationReset={handleMedicationReset}
            medicationSaved={medicationSaved}
          />

        </div>

        <div className="col-lg-5">

          <MedicationPreview
            medication={medication}
          />

        </div>

      </div>

    </div>
  );
}

export default AddMedication;