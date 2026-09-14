// src/pages/DoctorNudge.jsx
import { useState, useEffect } from "react";
import { PeopleFill } from "react-bootstrap-icons";
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";
import { getSymptomStatus, recordDoctorFollowUp } from "../services/api";
import Toast from "../components/ui/Toast";

const DoctorNudge = () => {
  const { setCurrentTab } = useApp();
  const { isDark } = useTheme();

  const [symptomId] = useState(() =>
    localStorage.getItem("mycare_checkin_symptom_id")
  );
  const [followUpStep, setFollowUpStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!symptomId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const resp = await getSymptomStatus(symptomId);
        if (!cancelled && resp.data?.doctor_follow_up_due) {
          setFollowUpStep(true);
        }
      } catch (err) {
        console.warn("[DoctorNudge] status fetch failed:", err.message);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [symptomId]);

  const handleFollowUp = async (response) => {
    if (!symptomId) return;

    setSubmitting(true);
    try {
      await recordDoctorFollowUp(symptomId, response);
      setToast({
        message:
          response === "yes"
            ? "Glad you saw a doctor!"
            : response === "remind_later"
            ? "We'll remind you in 8 hours"
            : "Take care",
        type: "success",
      });
      setTimeout(() => setCurrentTab("Home"), 1200);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to save response",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (followUpStep) {
    return (
      <div
        className="d-flex flex-column h-100 align-items-center justify-content-center p-4 text-center"
        style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
      >
        <div
          className="mb-4"
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "rgba(0,51,204,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PeopleFill size={60} color="#0033CC" />
        </div>

        <h2
          className="fw-bold mb-3"
          style={{ fontSize: "22px", color: isDark ? "#FFF" : "#000" }}
        >
          Have you seen a doctor about this yet?
        </h2>

        <div className="d-flex flex-column gap-2 w-100 mt-4">
          <button
            className="btn py-3 fw-bold text-white"
            style={{
              backgroundColor: submitting ? "#999" : "#4CBB17",
              borderRadius: "8px",
              border: "none",
            }}
            onClick={() => handleFollowUp("yes")}
            disabled={submitting}
          >
            Yes
          </button>
          <button
            className="btn py-3 fw-bold text-white"
            style={{
              backgroundColor: submitting ? "#999" : "#D92D20",
              borderRadius: "8px",
              border: "none",
            }}
            onClick={() => handleFollowUp("no")}
            disabled={submitting}
          >
            No
          </button>
          <button
            className="btn py-3 fw-bold"
            style={{
              backgroundColor: "transparent",
              border: "1px solid #0033CC",
              color: "#0033CC",
              borderRadius: "8px",
            }}
            onClick={() => handleFollowUp("remind_later")}
            disabled={submitting}
          >
            Not yet — remind me later
          </button>
        </div>

        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "success" })}
        />
      </div>
    );
  }

  return (
    <div
      className="d-flex flex-column h-100 align-items-center justify-content-center p-4 text-center"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      <div
        className="mb-4"
        style={{
          width: "120px",
          height: "120px",
          backgroundColor: "rgba(0,51,204,0.1)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PeopleFill size={60} color="#0033CC" />
      </div>

      <h1
        className="fw-bold mb-3"
        style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
      >
        Consider seeing a doctor
      </h1>
      <p
        className="mb-2"
        style={{ fontSize: "15px", color: isDark ? "#FFF" : "#000" }}
      >
        Your symptoms haven't improved over the past 3 days.
      </p>
      <p className="mb-5 text-secondary" style={{ fontSize: "14px" }}>
        If this continues or gets worse, please consult a healthcare
        professional.
      </p>

      <div className="w-100">
        <button
          className="btn w-100 py-3 fw-bold text-white mb-3"
          style={{
            backgroundColor: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setCurrentTab("Home")}
        >
          Back to Home
        </button>
        <button
          className="btn w-100 py-3 fw-bold"
          style={{
            backgroundColor: "transparent",
            border: "1px solid #0033CC",
            color: "#0033CC",
            borderRadius: "8px",
          }}
          onClick={() => setCurrentTab("Symptoms")}
        >
          View Symptoms
        </button>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default DoctorNudge;