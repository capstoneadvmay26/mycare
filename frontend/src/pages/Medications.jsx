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
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // ============================================================
  // FETCH
  // ============================================================
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

  // Fetch on mount — the async wrapper avoids the React 19 lint rule
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

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleSave = async (payload) => {
    if (editingMed) {
      const id = editingMed._id || editingMed.id;
      // Remove profile_id — backend already has it for update
      // Remove profile_id — backend already has it for update
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

  const handleHistoryClick = () => {
    // TODO: wire to a Medication History screen using GET /medications/history
    alert("Medication History — coming next!");
  };

  // ============================================================
  // FILTERS
  // ============================================================
  const activeMeds = medications.filter((m) => m.status !== "archived");
  const archivedMeds = medications.filter((m) => m.status === "archived");
  const filteredMeds = activeTab === "active" ? activeMeds : archivedMeds;

  // ============================================================
  // RENDER
  // ============================================================
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
          >
            <Plus size={16} className="me-1" /> Add
          </button>
        </div>
      </div>

      {/* Tabs */}
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
              activeTab === "archived" ? "#0033CC" : isDark ? "#FFF" : "#000",
            fontSize: "15px",
          }}
          onClick={() => setActiveTab("archived")}
        >
          Archived ({archivedMeds.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
          <p className="text-secondary mt-2" style={{ fontSize: "14px" }}>
            Loading medications...
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
      {!loading && !error && filteredMeds.length === 0 && (
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
      {!loading && !error && filteredMeds.length > 0 && (
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

      {/* Bottom History Button */}
      <div className="mt-auto pt-4 pb-2">
        <button
          className="btn w-100 fw-bold py-3"
          style={{
            backgroundColor: "#DEDFE2",
            color: "#000",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={handleHistoryClick}
        >
          View Medication History
        </button>
      </div>

      {/* Modal */}
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
    </div>
  );
};

export default Medications;