// src/pages/Medications.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus } from "react-bootstrap-icons";
import MedicationCard from "../components/ui/MedicationCard";
import AddMedicationModal from "../components/medications/AddMedicationModal";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
} from "../services/api";

const Medications = () => {
  const { activeProfile, loading: profileLoading } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // ----------------------------------------
  // FETCH
  // ----------------------------------------
  const fetchMeds = useCallback(async () => {
    if (!profileId) {
      setMedications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getMedications(profileId);
      const meds = response.data?.data || response.data || [];
      setMedications(meds);
    } catch (err) {
      console.error("[Medications] fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load medications"
      );
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await fetchMeds();
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchMeds]);

  // ----------------------------------------
  // HANDLERS
  // ----------------------------------------
  const handleSave = async (payload) => {
    if (!payload.profile_id) {
      throw new Error("Profile not loaded. Please wait and try again.");
    }

    if (editingMed) {
      const id = editingMed._id || editingMed.id;
      // eslint-disable-next-line no-unused-vars
      const { profile_id, ...updateData } = payload;
      await updateMedication(id, updateData);
    } else {
      await addMedication(payload);
    }
    setShowModal(false);
    setEditingMed(null);
    await fetchMeds();
  };

  const handleCardClick = (med) => {
    setEditingMed(med);
    setShowModal(true);
  };

  const handleArchive = async (med) => {
    const id = med._id || med.id;
    try {
      await deleteMedication(id);
      await fetchMeds();
    } catch (err) {
      console.error("[Medications] archive error:", err);
      setError(err.response?.data?.message || "Failed to archive medication");
    }
  };

  // ----------------------------------------
  // FILTERS
  // ----------------------------------------
  const activeMeds = medications.filter((m) => m.status !== "archived");
  const archivedMeds = medications.filter((m) => m.status === "archived");
  const filteredMeds = activeTab === "active" ? activeMeds : archivedMeds;

  // ----------------------------------------
  // RENDER
  // ----------------------------------------
  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <h1
            className="fw-bold m-0 me-3"
            style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
          >
            Medications
          </h1>
          <button
            className="btn btn-sm d-flex align-items-center fw-bold"
            style={{
              backgroundColor: "rgba(0, 51, 204, 0.1)",
              color: "#0033CC",
              borderRadius: "8px",
              border: "none",
            }}
            onClick={() => {
              setEditingMed(null);
              setShowModal(true);
            }}
            disabled={!profileId}
          >
            <Plus size={16} className="me-1" /> Add
          </button>
        </div>
      </div>

      {/* Profile loading banner */}
      {profileLoading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading your profile...
          </p>
        </div>
      )}

      {/* Tabs */}
      {!profileLoading && (
        <div
          className="d-flex mb-4 border-bottom"
          style={{ borderColor: "#DEDFE2" }}
        >
          <button
            className="flex-grow-1 pb-2 fw-bold"
            style={{
              border: "none",
              borderBottom:
                activeTab === "active"
                  ? "3px solid #0033CC"
                  : "2px solid transparent",
              background: "transparent",
              color:
                activeTab === "active" ? "#0033CC" : isDark ? "#FFF" : "#000",
              fontSize: "15px",
            }}
            onClick={() => setActiveTab("active")}
          >
            Active ({activeMeds.length})
          </button>
          <button
            className="flex-grow-1 pb-2 fw-bold"
            style={{
              border: "none",
              borderBottom:
                activeTab === "archived"
                  ? "3px solid #0033CC"
                  : "2px solid transparent",
              background: "transparent",
              color:
                activeTab === "archived"
                  ? "#0033CC"
                  : isDark
                  ? "#FFF"
                  : "#000",
              fontSize: "15px",
            }}
            onClick={() => setActiveTab("archived")}
          >
            Archived ({archivedMeds.length})
          </button>
        </div>
      )}

      {/* Loading */}
      {!profileLoading && loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading medications...
          </p>
        </div>
      )}

      {/* Error */}
      {!profileLoading && error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Empty state */}
      {!profileLoading && !loading && !error && filteredMeds.length === 0 && (
        <div className="text-center mt-5 text-muted px-4">
          <p
            className="fw-bold mb-1"
            style={{ fontSize: "16px", color: isDark ? "#FFF" : "#333" }}
          >
            No {activeTab} medications
          </p>
          <p style={{ fontSize: "14px" }}>
            {activeTab === "active"
              ? "Tap 'Add' above to add your first medication."
              : "Archived medications will appear here."}
          </p>
        </div>
      )}

      {/* List */}
      {!profileLoading && !loading && !error && filteredMeds.length > 0 && (
        <div className="d-flex flex-column gap-2 overflow-auto flex-grow-1">
          {filteredMeds.map((med) => (
            <MedicationCard
              key={med._id || med.id}
              medication={med}
              onClick={() =>
                activeTab === "active"
                  ? handleCardClick(med)
                  : handleArchive(med)
              }
            />
          ))}
        </div>
      )}

      {/* Bottom History Button — navigates to real page */}
      <div className="mt-auto pt-4 pb-2">
        <button
          className="btn w-100 fw-bold py-3"
          style={{
            backgroundColor: "#DEDFE2",
            color: "#000",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setHistoryOpen(true)}
          disabled={!profileId}
        >
          View Medication History
        </button>
      </div>

      {/* Add/Edit modal — only render when profileId is ready */}
      {profileId && (
        <AddMedicationModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingMed(null);
          }}
          onSave={handleSave}
          profile_id={profileId}
          editingMedication={editingMed}
        />
      )}

      {/* History modal */}
      {historyOpen && profileId && (
        <MedicationHistoryModal
          profileId={profileId}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  );
};

// ============================================================
// Inline Medication History Modal
// ============================================================
const MedicationHistoryModal = ({ profileId, onClose }) => {
  const [period, setPeriod] = useState("week");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { getMedicationHistory } = await import("../services/api");
        const response = await getMedicationHistory(profileId, period);
        const items =
          response.data?.history ||
          response.data?.data ||
          response.data ||
          [];
        if (!cancelled) setLogs(items);
      } catch (err) {
        console.error("[History] fetch error:", err);
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load history"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [profileId, period]);

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable mx-auto px-3"
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{ borderRadius: "16px", overflow: "hidden" }}
        >
          <div className="modal-header border-0 pb-0 pt-3 px-4 d-flex justify-content-between">
            <h5 className="modal-title fw-bold m-0">Medication History</h5>
            <button
              type="button"
              className="btn-close ms-0"
              onClick={onClose}
            />
          </div>

          <div className="modal-body px-4 py-3">
            {/* Period toggle */}
            <div className="d-flex gap-2 mb-3">
              {["week", "month"].map((p) => (
                <button
                  key={p}
                  className="btn flex-grow-1 fw-semibold"
                  style={{
                    backgroundColor:
                      period === p ? "#0033CC" : "rgba(0, 51, 204, 0.08)",
                    color: period === p ? "#FFF" : "#0033CC",
                    border: "none",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                  onClick={() => setPeriod(p)}
                >
                  {p === "week" ? "Week" : "Month"}
                </button>
              ))}
            </div>

            {loading && (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            )}

            {error && (
              <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>
                {error}
              </div>
            )}

            {!loading && !error && logs.length === 0 && (
              <div className="text-center text-muted py-4">
                <p className="mb-0">No history for this period.</p>
              </div>
            )}

            {!loading && !error && logs.length > 0 && (
              <div className="d-flex flex-column gap-2">
                {logs.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="p-2 rounded-3"
                    style={{ backgroundColor: "rgba(0, 51, 204, 0.04)" }}
                  >
                    <p className="m-0 fw-bold" style={{ fontSize: "14px" }}>
                      {log.medication || log.title || "Medication"}
                    </p>
                    <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                      {log.status || ""}{" "}
                      {log.date
                        ? `· ${new Date(log.date).toLocaleString()}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medications;