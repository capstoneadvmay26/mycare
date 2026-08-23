import { Routes, Route } from "react-router-dom";

import AppShell from "./components/layout/AppShell.jsx";

import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Medications from "./pages/Medications.jsx";
import AddMedication from "./pages/AddMedication.jsx";
import EditMedication from "./pages/EditMedication.jsx";
import Symptoms from "./pages/Symptoms.jsx";
import LogSymptom from "./pages/LogSymptom.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";

function App() {
  return (
    <AppShell>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/medications"
          element={<Medications />}
        />

        <Route
          path="/medications/add"
          element={<AddMedication />}
        />

        <Route
          path="/medications/:id/edit"
          element={<EditMedication />}
        />

        <Route
          path="/symptoms"
          element={<Symptoms />}
        />

        <Route
          path="/symptoms/log"
          element={<LogSymptom />}
        />

        <Route
          path="/history"
          element={<History />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>
    </AppShell>
  );
}

export default App;