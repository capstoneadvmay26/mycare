// src/pages/MedicationWizard.jsx
import { useState, useEffect } from "react";
import { useApp } from "../context/useApp";
import { addMedication, getProfiles, createProfile } from "../services/api";
import WizardProgress from "../components/medications/WizardProgress";
import WizardStepName from "../components/medications/WizardStepName";
import WizardStepDosage from "../components/medications/WizardStepDosage";
import WizardStepFrequency from "../components/medications/WizardStepFrequency";
import WizardStepSchedule from "../components/medications/WizardStepSchedule";

const MedicationWizard = () => {
  const { setOnboardingStage, userName } = useApp();

  // === Profile bootstrap state ===
  const [profileId, setProfileId] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  // === Wizard state ===
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [times, setTimes] = useState([]);

  // Default start date = today
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState("");

  // ============================================================
  // PROFILE BOOTSTRAP — runs once on mount
  // ============================================================
 useEffect(() => {
  const bootstrap = async () => {
    setProfileLoading(true);
    setProfileError("");

    try {
      // 1. Check localStorage cache first
      const cached = localStorage.getItem("mycare_currentProfileId");
      if (cached) {
        setProfileId(cached);
        setProfileLoading(false);
        return;
      }

      // 2. Try fetching existing profiles
      const listResponse = await getProfiles();
      const profiles =
        listResponse.data?.profiles ||
        listResponse.data?.data ||
        [];

      if (profiles.length > 0) {
        const first = profiles[0];
        const id = first.id || first._id;
        localStorage.setItem("mycare_currentProfileId", id);
        setProfileId(id);
        setProfileLoading(false);
        return;
      }

      // 3. No profiles — create the "Me" profile
      const fullName = (userName || "").trim();
      const profileName = fullName.length >= 2 ? fullName : "Me";

      try {
        const createResponse = await createProfile({
          name: profileName,
          relationship: "Self",
        });

        const newProfile =
          createResponse.data?.data ||
          createResponse.data?.profile ||
          createResponse.data;

        const id = newProfile?.id || newProfile?._id;
        if (!id) {
          throw new Error("Profile created but no ID was returned.");
        }

        localStorage.setItem("mycare_currentProfileId", id);
        setProfileId(id);
        setProfileLoading(false);
      } catch (createErr) {
        // 🔥 HANDLE THE "already exists" CASE
        // This happens in React StrictMode (double-invoke) or if a profile
        // was created in a previous session that didn't get cached.
        const message =
          createErr.response?.data?.message?.toLowerCase() || "";

        if (message.includes("already exists")) {
          // Re-fetch — the profile exists, we just don't have its ID
          const retryResponse = await getProfiles();
          const retryProfiles =
            retryResponse.data?.profiles ||
            retryResponse.data?.data ||
            [];

          if (retryProfiles.length > 0) {
            const first = retryProfiles[0];
            const id = first.id || first._id;
            localStorage.setItem("mycare_currentProfileId", id);
            setProfileId(id);
            setProfileLoading(false);
            return;
          }
        }

        // Not an "already exists" error — rethrow
        throw createErr;
      }
    } catch (err) {
      console.error("[Wizard] Profile bootstrap error:", err);
      setProfileError(
        err.response?.data?.message ||
          err.message ||
          "Could not prepare your profile. Please reload."
      );
      setProfileLoading(false);
    }
  };

  bootstrap();
  
}, [userName]);


// ✅ ADD this function
// In MedicationWizard.jsx
const getDefaultTimes = (freq) => {
  switch (freq) {
    case "once_daily": return ["08:00"];
    case "twice_daily": return ["08:00", "20:00"];
    case "three_times_daily": return ["08:00", "13:00", "20:00"];
    case "weekly": return ["08:00"];
    case "as_needed": return [];
    default: return ["08:00"];
  }
};

const handleFrequencyChange = (newFrequency) => {
  setFrequency(newFrequency);
  setTimes(getDefaultTimes(newFrequency));
};


  const goBack = () => {
    setError("");
    setStep((s) => Math.max(1, s - 1));
  };

  const next = () => {
    setError("");
    setStep((s) => Math.min(4, s + 1));
  };

  const skipWizard = () => {
    setOnboardingStage("trial");
  };

  const handleSubmit = async () => {
    if (!profileId) {
      setError("Profile not ready. Please reload.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      profile_id: profileId,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency,
      scheduleTime: times,
      startDate: startDate,
      endDate: endDate || null,
    };

    console.log("[Wizard] Submitting medication:", payload);

    try {
      const response = await addMedication(payload);
      console.log("[Wizard] Medication created:", response.data);
      setOnboardingStage("trial");
    } catch (err) {
      console.error("[Wizard] Error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save medication. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  // Loading profile
  if (profileLoading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white px-3"
        style={{ maxWidth: "480px", margin: "0 auto" }}
      >
        <div className="spinner-border text-primary mb-3" role="status" />
        <p className="text-secondary" style={{ fontSize: "15px" }}>
          Preparing your profile...
        </p>
      </div>
    );
  }

  // Profile bootstrap failed
  if (profileError) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100 bg-white px-3 text-center"
        style={{ maxWidth: "480px", margin: "0 auto" }}
      >
        <div className="alert alert-danger" style={{ fontSize: "14px" }}>
          {profileError}
        </div>
        <button
          className="btn w-100"
          onClick={() => window.location.reload()}
          style={{
            height: "52px",
            fontSize: "16px",
            fontWeight: "600",
            borderRadius: "8px",
            backgroundColor: "#0033CC",
            color: "#FFFFFF",
            border: "none",
          }}
        >
          Reload
        </button>
      </div>
    );
  }

  // Normal wizard
  return (
    <div
      className="d-flex flex-column vh-100 bg-white px-3 px-sm-4 py-4 overflow-hidden mx-auto"
      style={{ maxWidth: "480px" }}
    >
      {(error || profileError) && (
        <div
          className="alert alert-danger py-2 mb-3"
          style={{ fontSize: "14px" }}
        >
          {error || profileError}
        </div>
      )}

      <WizardProgress step={step} onBack={step > 1 ? goBack : null} />

      {step === 1 && (
        <WizardStepName
          value={name}
          onChange={setName}
          onNext={next}
          onSkip={skipWizard}
          loading={loading}
        />
      )}

      {step === 2 && (
        <WizardStepDosage
          value={dosage}
          onChange={setDosage}
          onBack={goBack}
          onNext={next}
          loading={loading}
        />
      )}

     {step === 3 && (
  <WizardStepFrequency
    value={frequency}
    onChange={handleFrequencyChange}   // 👈 changed from setFrequency
    onBack={goBack}
    onNext={next}
    loading={loading}
  />
)}

      {step === 4 && (
        <WizardStepSchedule
          frequency={frequency}
          times={times}
          onTimesChange={setTimes}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          onBack={goBack}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default MedicationWizard;