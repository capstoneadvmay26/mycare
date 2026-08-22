import AppShell from "./components/layout/AppShell.jsx";

import { useState } from "react";

import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Medications from "./pages/Medications.jsx";
import AddMedication from "./pages/AddMedication.jsx";
import Symptoms from "./pages/Symptoms.jsx";
import Reports from "./pages/Reports.jsx";
import Profile from "./pages/Profile.jsx";
import History from "./pages/History.jsx";

function App() {
  // ========================================
  // TOGGLE THEME STATE
  // ========================================
  const [theme, setTheme] = useState("light");

  // ========================================
  // TOGGLE THEME HELPER FUNCTIONS
  // ========================================
  const handleThemeToggle = () => {
    setTheme((previousTheme) => (previousTheme === "light" ? "dark" : "light"));
  };

  // ========================================
  // MEDICATION STATE
  // ========================================

  const [medication, setMedication] = useState({
    name: "",
    dosage: "",
    frequency: "Once Daily",
    startDate: "",
    endDate: "",
    reminderTime: "",
    notes: "",
  });

  const [medicationSaved, setMedicationSaved] = useState(false);

  const [medicationErrors, setMedicationErrors] = useState({});

  // ========================================
  // MEDICATION HELPER FUNCTIONS
  // ========================================

  //HELPER FUNCTION 1 -  Handle changes to medication form fields
  const handleMedicationChange = (event) => {
    const { name, value } = event.target;

    setMedication((previousMedication) => ({
      ...previousMedication,
      [name]: value,
    }));

    setMedicationErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setMedicationSaved(false);
  };

  //HELPER FUNCTION 2 -  Validate Medication Form -used by handleMedicationSubmit helper function
  const validateMedicationForm = () => {
    const errors = {};

    if (!medication.name.trim()) {
      errors.name = "Medication name is required.";
    }

    if (!medication.dosage.trim()) {
      errors.dosage = "Dosage is required.";
    }

    if (!medication.frequency) {
      errors.frequency = "Please select a frequency.";
    }

    if (!medication.startDate) {
      errors.startDate = "Start date is required.";
    }

    if (!medication.reminderTime) {
      errors.reminderTime = "Reminder time is required.";
    }

    if (
      medication.startDate &&
      medication.endDate &&
      medication.endDate < medication.startDate
    ) {
      errors.endDate = "End date cannot be before start date.";
    }

    return errors;
  };

  //HELPER FUNCTION 3 - Handle medication form submission
  const handleMedicationSubmit = (event) => {
    event.preventDefault();

    const errors = validateMedicationForm();

    setMedicationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMedicationSaved(false);
      return;
    }

    console.log("Medication submitted:", medication);

    setMedicationSaved(true);
  };

  //HELPER FUNCTION 4 -  Reset medication form
  const handleMedicationReset = () => {
    setMedication({
      name: "",
      dosage: "",
      frequency: "Once Daily",
      startDate: "",
      endDate: "",
      reminderTime: "",
      notes: "",
    });

    setMedicationErrors({});

    setMedicationSaved(false);
  };

  // ========================================
  //JSX - APPLICATION UI
  // ========================================

  return (
    <AppShell theme={theme} handleThemeToggle={handleThemeToggle}>

      <Routes>
        
        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={
            <Dashboard
              medication={medication}
              medicationSaved={medicationSaved}
            />
          }
        />

        <Route path="/medications" element={<Medications />} />

        <Route
          path="/medications/add"
          element={
            <AddMedication
              medication={medication}
              medicationErrors={medicationErrors}
              handleMedicationChange={handleMedicationChange}
              handleMedicationSubmit={handleMedicationSubmit}
              handleMedicationReset={handleMedicationReset}
              medicationSaved={medicationSaved}
            />
          }
        />

        <Route path="/symptoms" element={<Symptoms />} />

        <Route path="/reports" element={<Reports />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/history" element={<History />} />

      </Routes>

    </AppShell>

  );
}

export default App;
