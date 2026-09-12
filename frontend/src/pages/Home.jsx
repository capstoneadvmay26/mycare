// src/pages/Home.jsx
import { useState } from "react";
import { useApp } from "../context/useApp";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { useTodaySchedule } from "../hooks/useTodaySchedule";
import CheckIn from "./CheckIn";
import DoctorNudge from "./DoctorNudge";
import HomeGreeting from "../components/home/HomeGreeting";
import AdherenceDonut from "../components/home/AdherenceDonut";
import ScheduleSection from "../components/home/ScheduleSection";
import { ArrowLeftRight } from "react-bootstrap-icons";

const Home = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile, profiles, switchProfile } = useProfile();
  const { isDark } = useTheme();

  const [checkInState, setCheckInState] = useState("idle");

  // Real data
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
  } = useTodaySchedule(profileId);

  const isDependent = activeProfile && !activeProfile.isSelf;

  // Handle tap on a medication (future: open mark-taken modal)
  const handleSelectDose = (dose) => {
    console.log("[Home] Selected dose:", dose);
    // TODO: open modal with Taken / Snooze / Skip options
  };

  // Cycle to next profile
  const handleSwitch = () => {
    if (!profiles?.length) return;
    const currentIndex = profiles.findIndex(
      (p) => (p.id || p._id) === profileId
    );
    const nextProfile = profiles[(currentIndex + 1) % profiles.length];
    switchProfile(nextProfile.id || nextProfile._id);
  };

  // === Check-in / nudge sub-flows ===
  if (checkInState === "active") {
    return (
      <CheckIn
        symptom="Headache"
        onBack={() => setCheckInState("idle")}
        onComplete={(result) => {
          if (result === "nudge") setCheckInState("nudge");
          else setCheckInState("idle");
        }}
      />
    );
  }

  if (checkInState === "nudge") {
    return (
      <DoctorNudge
        onBack={() => setCheckInState("idle")}
        onClose={() => setCheckInState("idle")}
      />
    );
  }

  return (
    <div className="d-flex flex-column h-100 p-3">
      <HomeGreeting />

      {/* Dependent Profile Card — only if viewing a dependent */}
      {isDependent && (
        <div
          className="d-flex align-items-center p-3 mb-4 rounded-3"
          style={{ backgroundColor: "rgba(0, 51, 204, 0.1)" }}
        >
          <div
            className="d-flex justify-content-center align-items-center rounded-circle text-white fw-bold me-3"
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: activeProfile.color || "#0033CC",
              fontSize: "20px",
            }}
          >
            {activeProfile.initial || activeProfile.name?.[0]?.toUpperCase()}
          </div>
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

      {/* Loading state */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading your schedule...
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Empty state — actionable */}
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
          onClick={() => setCheckInState("active")}
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
    </div>
  );
};

export default Home;