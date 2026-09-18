// src/pages/Medications.jsx
import { useState, useEffect, useCallback } from "react";
import { Plus } from "react-bootstrap-icons";
import MedicationCard from "../components/ui/MedicationCard";
import AddMedicationModal from "../components/medications/AddMedicationModal";
import MedicationViewModal from "../components/medications/MedicationViewModal";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import {
  getMedications,
  addMedication,
  updateMedication,
  deleteMedication,
} from "../services/api";
import { useApp } from "../context/useApp";

const Medications = () => {
  const { setCurrentTab } = useApp();
  const { activeProfile, loading: profileLoading } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingMed, setViewingMed] = useState(null);
  const [saving, setSaving] = useState(false);

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
  const handleAdd = async (payload) => {
    if (!payload.profile_id) {
      throw new Error("Profile not loaded. Please wait and try again.");
    }
    await addMedication(payload);
    setShowAddModal(false);
    await fetchMeds();
  };

  const handleCardClick = (med) => {
    setViewingMed(med);
  };

  // 🆕 Cosmetic-only update (name + dosage)
  const handleUpdateCosmetic = async (updates) => {
    if (!viewingMed) return;
    setSaving(true);
    try {
      const id = viewingMed._id || viewingMed.id;
      await updateMedication(id, updates);
      await fetchMeds();
      // Update the viewing med locally so the modal reflects the change
      setViewingMed((prev) => ({ ...prev, ...updates }));
    } finally {
      setSaving(false);
    }
  };

  // 🆕 Archive (soft delete)
  const handleArchive = async (med) => {
    setSaving(true);
    try {
      const id = med._id || med.id;
      await deleteMedication(id);
      setViewingMed(null);
      await fetchMeds();
    } finally {
      setSaving(false);
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
            onClick={() => setShowAddModal(true)}
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
              onClick={handleCardClick}
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
          onClick={() => setCurrentTab("MedicationHistory")}
          disabled={!profileId}
        >
          View Medication History
        </button>
      </div>

      {/* Add modal */}
      {profileId && (
        <AddMedicationModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          profile_id={profileId}
        />
      )}

      {/* 🆕 View modal */}
      {viewingMed && (
        <MedicationViewModal
          medication={viewingMed}
          onClose={() => setViewingMed(null)}
          onArchive={handleArchive}
          onUpdateCosmetic={handleUpdateCosmetic}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Medications;