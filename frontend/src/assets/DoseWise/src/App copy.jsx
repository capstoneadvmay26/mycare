import { useState } from 'react'
import MedicationForm from "./components/medication/MedicationForm.jsx"



function App() {



  // ================================
  // MEDICATION STATE
  // ================================

  const [medication, setMedication] = useState( {
    name: "",
    dosage: "",
    frequency:  "Once daily",
    startDate:  "",
    endDate:  "",
    reminderTime: "",
    notes:  "",

  });


  
  // ================================
  // MEDICATION HELPER FUNCTIONS
  // ================================


  //HELPER FUNCTION 1 -  Handle changes to medication form fields
  const handleMedicationChange = (event) => {

    const {name, value} = event.target;

    setMedication((previousMedication) => ({
      ...previousMedication, [name]:value,
    }));

  };


  //HELPER FUNCTION 2 - Handle medication form submission
  const handleMedicationSubmit = (event) => {

    event.preventDefault();

    console.log("Medication Submitted:", medication);
  };


  //HELPER FUNCTION 3 -  Reset medication form
  const handleMedicationReset = () => {
    setMedication({
      name: "",
      dosage: "",
      frequency:  "Once daily",
      startDate:  "",
      endDate:  "",
      reminderTime: "",
      notes:  "",
    });

  };




  // ================================
  // JSX
  // ================================

  return (
    <>

      <MedicationForm 

        medication={medication}

        handleMedicationChange={handleMedicationChange}

        handleMedicationSubmit={handleMedicationSubmit}

        handleMedicationReset={handleMedicationReset}
              
      />

    </>
  );
}

export default App;
