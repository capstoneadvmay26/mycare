// src/pages/Dependents.jsx
import { useState } from "react";
import { ChevronLeft, Plus } from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import Toast from "../components/ui/Toast";
import Avatar from "../components/ui/Avatar";
import { useApp } from "../context/useApp"


const Dependents = ({ onBack }) => {
  const { profiles, activeProfile, addDependent, loading } = useProfile();
  const { isDark } = useTheme();
  const { user } = useApp() || {};

  const dependents = profiles.filter((p) => p.isDependent === true);

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    relationship: "Parent",
    condition: "",
  });
  const [formError, setFormError] = useState("");

  const handleAdd = async () => {
    setFormError("");

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      await addDependent({
        name: formData.name.trim(),
        relationship: formData.relationship,
        condition: formData.condition.trim() || null,
      });
      setShowModal(false);
      setFormData({ name: "", relationship: "Parent", condition: "" });
      setToast({
        message: `${formData.name} added successfully`,
        type: "success",
      });
    } catch (err) {
      console.error("[Dependents] Add error:", err);
      setFormError(
        err.response?.data?.message ||
          err.message ||
          "Failed to add dependent. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const isSelf =
    activeProfile?.isSelf || activeProfile?.relationship === "Self";

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={onBack}
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Dependents
        </h1>
      </div>

      <div className="p-3 flex-grow-1 overflow-auto">
        <p className="mb-4 text-secondary" style={{ fontSize: "14px" }}>
          Manage your profile and those of your dependents.
        </p>

        {/* Current Profile */}
        <p className="fw-bold mb-2" style={{ color: isDark ? "#FFF" : "#000" }}>
          Current Profile
        </p>
       {activeProfile && (
  <div
    className="d-flex align-items-center border rounded-3 p-3 mb-4"
    style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
  >
    <Avatar
      src={activeProfile.avatarUrl}
      name={
        isSelf && activeProfile.name === "Me"
          ? user?.full_name || activeProfile.name
          : activeProfile.name
      }
      size={32}
      color={activeProfile.color || "#0033CC"}
      className="me-3"
    />
    <span
      className="flex-grow-1 fw-bold"
      style={{ color: isDark ? "#FFF" : "#000" }}
    >
      {isSelf && activeProfile.name === "Me"
        ? `${user?.full_name || "Me"} (Me)`
        : `${activeProfile.name}${isSelf ? " (Me)" : ""}`}
    </span>
    <div
      className="border rounded px-3 py-1 text-secondary"
      style={{ fontSize: "12px" }}
    >
      You
    </div>
  </div>
)}

        {/* Dependents List */}
        <p className="fw-bold mb-2" style={{ color: isDark ? "#FFF" : "#000" }}>
          Dependents {dependents.length > 0 ? `(${dependents.length})` : ""}
        </p>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status" />
          </div>
        )}

        {!loading && dependents.length === 0 && (
          <p className="text-secondary" style={{ fontSize: "14px" }}>
            No dependents yet. Tap "Add Dependent" to get started.
          </p>
        )}

        {dependents.map((dep) => (
          <div
            key={dep.id}
            className="d-flex align-items-center p-3 mb-3"
            style={{
              border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
              borderRadius: "8px",
            }}
          >
            <Avatar
              src={dep.avatarUrl}
              name={dep.name}
              size={32}
              color={dep.color}
              className="me-3"
            />
            <div className="flex-grow-1">
              <p
                className="m-0 fw-bold"
                style={{ color: isDark ? "#FFF" : "#000" }}
              >
                {dep.name}
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                {dep.relationship}
                {dep.condition ? ` · ${dep.condition}` : ""}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Button */}
      <div
        className="p-3 border-top"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn w-100 py-3 fw-bold text-white d-flex justify-content-center align-items-center gap-2"
          style={{
            backgroundColor: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={() => setShowModal(true)}
          disabled={loading}
        >
          <Plus size={20} /> Add Dependent
        </button>
      </div>

      {/* Add Dependent Modal */}
      {showModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center p-3"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
          onClick={saving ? null : () => setShowModal(false)}
        >
          <div
            className="p-4 rounded-3 w-100"
            style={{
              maxWidth: "400px",
              backgroundColor: isDark ? "#1a1a1a" : "#FFF",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h5
              className="fw-bold mb-3"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              Add Dependent
            </h5>

            {formError && (
              <div
                className="alert alert-danger py-2 mb-3"
                style={{ fontSize: "13px" }}
              >
                {formError}
              </div>
            )}

            <label
              className="fw-bold mb-1"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              Name *
            </label>
            <input
              className="form-control mb-3"
              placeholder="e.g. Mum"
              value={formData.name}
              onChange={(e) =>
                setFormData((f) => ({ ...f, name: e.target.value }))
              }
              disabled={saving}
              maxLength={100}
            />

            <label
              className="fw-bold mb-1"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              Relationship *
            </label>
            <select
              className="form-control mb-3"
              value={formData.relationship}
              onChange={(e) =>
                setFormData((f) => ({ ...f, relationship: e.target.value }))
              }
              disabled={saving}
            >
              <option value="Parent">Parent</option>
              <option value="Sibling">Sibling</option>
              <option value="Child">Child</option>
              <option value="Spouse">Spouse</option>
              <option value="Other">Other</option>
            </select>

            <label
              className="fw-bold mb-1"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              Condition (optional)
            </label>
            <input
              className="form-control mb-4"
              placeholder="e.g. Diabetes"
              value={formData.condition}
              onChange={(e) =>
                setFormData((f) => ({ ...f, condition: e.target.value }))
              }
              disabled={saving}
              maxLength={100}
            />

            <button
              className="btn w-100 text-white fw-bold mb-2"
              style={{
                backgroundColor: saving ? "#999" : "#0033CC",
                borderRadius: "8px",
                padding: "12px",
                border: "none",
              }}
              onClick={handleAdd}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Dependent"}
            </button>
            <button
              className="btn w-100 fw-bold"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #0033CC",
                color: "#0033CC",
                borderRadius: "8px",
                padding: "12px",
              }}
              onClick={() => setShowModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default Dependents;
