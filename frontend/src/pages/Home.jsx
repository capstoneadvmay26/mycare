// src/pages/Home.jsx
import { useState } from "react";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { useTodaySchedule } from "../hooks/useTodaySchedule";
import {
  markMedicationTaken,
  markMedicationSkipped,
} from "../services/api";
import HomeGreeting from "../components/home/HomeGreeting";
import AdherenceDonut from "../components/home/AdherenceDonut";
import ScheduleSection from "../components/home/ScheduleSection";
import DoseActionSheet from "../components/home/DoseActionSheet";
import SkipReasonSheet from "../components/home/SkipReasonSheet";
import SnoozeSheet from "../components/home/SnoozeSheet";
import { snoozeDose, clearSnooze } from "../utils/snoozeStore";
import Toast from "../components/ui/Toast";
import Avatar from "../components/ui/Avatar";
import { ArrowLeftRight } from "react-bootstrap-icons";

const Home = () => {
  const { setCurrentTab, user } = useApp();
  const { activeProfile, profiles, switchProfile } = useProfile();
  const { isDark } = useTheme();

  const [selectedDose, setSelectedDose] = useState(null);
  const [skipMode, setSkipMode] = useState(false);
  const [snoozeMode, setSnoozeMode] = useState(false);
  const [actionSaving, setActionSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const profileId = activeProfile?.id || activeProfile?._id;
  const {
    dueNow,
    upcoming,
    completed,
    taken,
    total,
    adherence,
    loading,
    error,
    refresh,
  } = useTodaySchedule(profileId);

  const isDependent = activeProfile && !activeProfile.isSelf;

  // ------------------------------------------------------------
  // Dose sheet handlers
  // ------------------------------------------------------------
  const handleSelectDose = (dose) => {
    setSelectedDose(dose);
    setSkipMode(false);
    setSnoozeMode(false);
  };

  const closeSheet = () => {
    setSelectedDose(null);
    setSkipMode(false);
    setSnoozeMode(false);
  };

  const handleTaken = async (dose) => {
    if (!dose.logId) {
      setToast({
        message: "No log for this dose. Try reloading.",
        type: "error",
      });
      return;
    }

    setActionSaving(true);
    try {
      await markMedicationTaken(dose.logId, new Date().toISOString());
      clearSnooze(dose.logId);
      setToast({ message: `${dose.name} marked as taken`, type: "success" });
      closeSheet();
      await refresh();
    } catch (err) {
      console.error("[Home] mark taken error:", err);
      setToast({
        message: err.response?.data?.message || "Failed to mark as taken",
        type: "error",
      });
    } finally {
      setActionSaving(false);
    }
  };

  const handleSkip = async (dose, reason) => {
    if (!dose.logId) {
      setToast({
        message: "No log for this dose. Try reloading.",
        type: "error",
      });
      return;
    }

    setActionSaving(true);
    try {
      await markMedicationSkipped(
        dose.logId,
        new Date().toISOString(),
        reason
      );
      clearSnooze(dose.logId);
      setToast({ message: `${dose.name} skipped`, type: "info" });
      closeSheet();
      await refresh();
    } catch (err) {
      console.error("[Home] skip error:", err);
      setToast({
        message: err.response?.data?.message || "Failed to skip",
        type: "error",
      });
    } finally {
      setActionSaving(false);
    }
  };

  const handleSnooze = (dose, minutes) => {
    if (!dose.logId) {
      setToast({
        message: "No log for this dose. Try reloading.",
        type: "error",
      });
      return;
    }

    try {
      snoozeDose(dose.logId, minutes);
      setToast({
        message: `Snoozed for ${minutes} minutes`,
        type: "info",
      });
      closeSheet();
      refresh();
    } catch (err) {
      console.error("[Home] snooze error:", err);
      setToast({
        message: "Failed to snooze. Please try again.",
        type: "error",
      });
    }
  };

  const handleSwitch = () => {
    if (!profiles?.length) return;
    const currentIndex = profiles.findIndex(
      (p) => (p.id || p._id) === profileId
    );
    const nextProfile = profiles[(currentIndex + 1) % profiles.length];
    switchProfile(nextProfile.id || nextProfile._id);
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      <HomeGreeting />

      {/* Dependent Profile Card */}
      {isDependent && (
        <div
          className="d-flex align-items-center p-3 mb-4 rounded-3"
          style={{ backgroundColor: "rgba(0, 51, 204, 0.1)" }}
        >
          <Avatar
            src={activeProfile.avatarUrl}
            name={
              activeProfile.isSelf && activeProfile.name === "Me"
                ? user?.full_name || activeProfile.name
                : activeProfile.name
            }
            size={50}
            color={activeProfile.color || "#0033CC"}
            className="me-3"
          />
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{ fontSize: "18px", color: "#000" }}
            >
              {activeProfile.name}
            </p>
            <p className="m-0" style={{ fontSize: "13px", color: "#666" }}>
              Managing {activeProfile.relationship}'s care
            </p>
          </div>
          <button
            className="btn p-2 rounded-circle"
            style={{ backgroundColor: "#FFF", border: "1px solid #ccc" }}
            onClick={handleSwitch}
          >
            <ArrowLeftRight size={20} color="#000" />
          </button>
        </div>
      )}

      {/* Adherence Card */}
      <div
        className="bg-white rounded-3 p-3 mb-4 shadow-sm"
        style={{ border: "1px solid rgba(0,0,0,0.1)" }}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p
              className="m-0 mb-1"
              style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
            >
              Today's Adherence
            </p>
            <p
              className="m-0 mb-2 fw-bold"
              style={{ fontSize: "20px", color: isDark ? "#FFF" : "#000" }}
            >
              {loading
                ? "Loading..."
                : total === 0
                ? "No doses scheduled"
                : `${taken} of ${total} doses taken`}
            </p>
          </div>
          <AdherenceDonut
            percent={adherence}
            size={80}
            strokeWidth={8}
            color="#0033CC"
          />
        </div>
      </div>

      <h6
        className="fw-bold mb-3"
        style={{ fontSize: "20px", color: isDark ? "#FFF" : "#000" }}
      >
        Schedule
      </h6>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading your schedule...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div
          className="text-center py-5 rounded-3 mb-4"
          style={{ backgroundColor: "rgba(0, 51, 204, 0.04)" }}
        >
          <p className="fw-bold mb-1" style={{ fontSize: "16px" }}>
            No medications scheduled for today
          </p>
          <p className="text-secondary mb-3" style={{ fontSize: "14px" }}>
            Add your first medication to start tracking.
          </p>
          <button
            className="btn fw-bold px-4"
            onClick={() => setCurrentTab("Medications")}
            style={{
              backgroundColor: "#0033CC",
              color: "#FFFFFF",
              borderRadius: "8px",
              padding: "10px 24px",
              border: "none",
            }}
          >
            Add Medication
          </button>
        </div>
      )}

      {/* Schedule sections */}
      {!loading && !error && total > 0 && (
        <>
          <ScheduleSection
            type="dueNow"
            doses={dueNow}
            onSelectDose={handleSelectDose}
          />
          <ScheduleSection
            type="upcoming"
            doses={upcoming}
            onSelectDose={handleSelectDose}
          />
          <ScheduleSection
            type="completed"
            doses={completed}
            onSelectDose={handleSelectDose}
          />
        </>
      )}

      {/* Bottom Buttons */}
      <div className="mt-auto pt-2">
        <button
          className="btn w-100 py-3 fw-bold mb-2"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.1)",
            color: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("Symptoms")}
        >
          Start Daily Check-in
        </button>
        <button
          className="btn w-100 py-3 fw-bold"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.06)",
            color: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("Medications")}
        >
          View full schedule
        </button>
      </div>

      {/* Dose action sheets */}
      {selectedDose && !skipMode && !snoozeMode && (
        <DoseActionSheet
          dose={selectedDose}
          onClose={closeSheet}
          onTaken={handleTaken}
          onSnooze={() => setSnoozeMode(true)}
          onSkip={() => setSkipMode(true)}
        />
      )}

      {selectedDose && skipMode && (
        <SkipReasonSheet
          dose={selectedDose}
          onClose={() => setSkipMode(false)}
          onConfirm={handleSkip}
          saving={actionSaving}
        />
      )}

      {selectedDose && snoozeMode && (
        <SnoozeSheet
          dose={selectedDose}
          onClose={() => setSnoozeMode(false)}
          onConfirm={handleSnooze}
          saving={actionSaving}
        />
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default Home;