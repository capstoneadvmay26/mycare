// src/pages/EditProfile.jsx
import { useState, useRef } from "react";
import {
  ChevronLeft,
  Person,
  CalendarEvent,
  GenderMale,
  Camera,
  Clock,
  ChatHeart, // ← NEW
} from "react-bootstrap-icons";

import { useProfile } from "../context/ProfileContext";
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";
import { uploadImage, isCloudinaryConfigured } from "../services/cloudinary";
import Avatar from "../components/ui/Avatar";
import Toast from "../components/ui/Toast";

// Common timezone options (a small curated list for UX)
const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "Africa/Lagos", label: "Africa/Lagos (GMT+1)" },
  { value: "Africa/Accra", label: "Africa/Accra (GMT)" },
  { value: "Africa/Cairo", label: "Africa/Cairo (GMT+2)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi (GMT+3)" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (GMT+2)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (GMT+1/2)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GMT+4)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (GMT+5:30)" },
  { value: "Asia/Singapore", label: "Asia/Singapore (GMT+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
];

const EditProfile = ({ onBack }) => {
  const { activeProfile, updateActiveProfile } = useProfile();

  const { user: userFromContext } = useApp() || {};
const user = (() => {
  if (userFromContext) return userFromContext;
  try {
    const raw = localStorage.getItem("mycare_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();
  


  const { isDark } = useTheme();

  const isSelf =
    activeProfile?.isSelf || activeProfile?.relationship === "Self";

  const initialName = isSelf
    ? user?.full_name || activeProfile?.name || ""
    : activeProfile?.name || "";

  const [name, setName] = useState(initialName);
  const [dob, setDob] = useState(() => {
    const raw =
      activeProfile?.dateOfBirth || (isSelf ? user?.date_of_birth : null);
    if (!raw) return "";
    try {
      return new Date(raw).toISOString().split("T")[0];
    } catch {
      return "";
    }
  });
  const [gender, setGender] = useState(
    activeProfile?.gender || (isSelf ? user?.gender : "") || "",
  );

  const [condition, setCondition] = useState(activeProfile?.condition || "");

  // 🆕 Timezone state — defaults to the profile's current timezone
  const [timezone, setTimezone] = useState(
    activeProfile?.timezone ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "UTC",
  );

  const [avatarUrl, setAvatarUrl] = useState(activeProfile?.avatarUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const cloudinaryReady = isCloudinaryConfigured();

  // Detect user's current timezone as a suggestion
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ------------------------------------------------------------
  // Photo change
  // ------------------------------------------------------------
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!cloudinaryReady) {
      setError(
        "Photo upload is not configured yet. Add Cloudinary keys to .env.",
      );
      return;
    }

    setUploading(true);
    try {
      const result = await uploadImage(file);
      setAvatarUrl(result.secure_url);
      setToast({
        message: "Photo uploaded — tap Save to confirm",
        type: "success",
      });
    } catch (err) {
      console.error("[EditProfile] upload error:", err);
      setError(err.message || "Failed to upload photo. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerPhotoPicker = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // ------------------------------------------------------------
  // Save
  // ------------------------------------------------------------
  const handleSave = async () => {
    setError("");

    // 3. Add to the `updates` object in handleSave
    const updates = { name: name.trim() };
    if (dob) updates.dateOfBirth = dob;
    if (gender) updates.gender = gender;
    if (timezone) updates.timezone = timezone;
    if (condition.trim()) updates.condition = condition.trim(); // ← NEW
    if (avatarUrl && avatarUrl !== activeProfile?.avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }

    if (!name.trim() || name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      const updates = { name: name.trim() };
      if (dob) updates.dateOfBirth = dob;
      if (gender) updates.gender = gender;
      if (timezone) updates.timezone = timezone; // 🆕
      if (avatarUrl && avatarUrl !== activeProfile?.avatarUrl) {
        updates.avatarUrl = avatarUrl;
      }

      await updateActiveProfile(updates);
      setToast({ message: "Profile updated successfully", type: "success" });
      setTimeout(() => onBack(), 800);
    } catch (err) {
      console.error("[EditProfile] save error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-center align-items-center p-3 border-bottom position-relative"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0 position-absolute"
          style={{ left: "15px", color: isDark ? "#FFF" : "#000" }}
          onClick={onBack}
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Edit Profile
        </h1>
      </div>

      <div className="flex-grow-1 overflow-auto px-3 py-3">
        {error && (
          <div
            className="alert alert-danger py-2 mb-3"
            style={{ fontSize: "13px" }}
          >
            {error}
          </div>
        )}

        {/* Avatar */}
        <div className="d-flex flex-column justify-content-center align-items-center mb-4">
          <div className="position-relative">
            <Avatar
              src={avatarUrl}
              name={name}
              size={110}
              color={activeProfile?.color || "#0033CC"}
              border="2px solid #DEDFE2"
            />

            {cloudinaryReady && (
              <button
                type="button"
                onClick={triggerPhotoPicker}
                disabled={uploading}
                className="position-absolute bg-white rounded-circle d-flex justify-content-center align-items-center border-0"
                style={{
                  width: "36px",
                  height: "36px",
                  bottom: 0,
                  right: 0,
                  border: "2px solid #FFF",
                  cursor: uploading ? "not-allowed" : "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  opacity: uploading ? 0.5 : 1,
                  padding: 0,
                }}
                aria-label="Change photo"
              >
                {uploading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    style={{ color: "#0033CC" }}
                    role="status"
                  />
                ) : (
                  <Camera size={18} color="#0033CC" />
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handlePhotoChange}
            />
          </div>

          {cloudinaryReady ? (
            <button
              type="button"
              className="btn p-0 border-0 mt-2"
              onClick={triggerPhotoPicker}
              disabled={uploading}
              style={{
                color: "#0033CC",
                fontWeight: "600",
                fontSize: "14px",
                textDecoration: "underline",
              }}
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
          ) : (
            <p
              className="text-secondary mt-2 mb-0"
              style={{ fontSize: "12px" }}
            >
              Photo upload coming soon
            </p>
          )}
        </div>

        {/* Name */}
        <div className="mb-3">
          <label
            className="fw-bold mb-2"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Name
          </label>
          <div
            className="d-flex align-items-center border rounded-3 p-2"
            style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
          >
            <Person
              size={18}
              className="me-2"
              color={isDark ? "#FFF" : "#000"}
            />
            <input
              className="form-control border-0 shadow-none p-0"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              maxLength={100}
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="mb-3">
          <label
            className="fw-bold mb-2"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Date of Birth
          </label>
          <div
            className="d-flex align-items-center border rounded-3 p-2"
            style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
          >
            <CalendarEvent
              size={18}
              className="me-2"
              color={isDark ? "#FFF" : "#000"}
            />
            <input
              className="form-control border-0 shadow-none p-0"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
              }}
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              disabled={saving}
            />
          </div>
        </div>

        {/* Gender */}
        <div className="mb-3">
          <label
            className="fw-bold mb-2"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Gender
          </label>
          <div
            className="d-flex align-items-center border rounded-3 p-2 position-relative"
            style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
          >
            <GenderMale
              size={18}
              className="me-2"
              color={isDark ? "#FFF" : "#000"}
            />
            <select
              className="form-control border-0 shadow-none p-0 pe-4"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
              }}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={saving}
            >
              <option value="">Not specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: "absolute",
                right: "14px",
                pointerEvents: "none",
                opacity: 0.6,
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke={isDark ? "#FFF" : "#000"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* 🆕 Medical Condition */}
        <div className="mb-3">
          <label
            className="fw-bold mb-2"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Medical Condition (optional)
          </label>
          <div
            className="d-flex align-items-center border rounded-3 p-2"
            style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
          >
            <ChatHeart
              size={18}
              className="me-2"
              color={isDark ? "#FFF" : "#000"}
            />
            <input
              className="form-control border-0 shadow-none p-0"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
              }}
              placeholder="e.g. Hypertension, Diabetes"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              disabled={saving}
              maxLength={100}
            />
          </div>
        </div>

        {/* 🆕 Timezone */}
        <div className="mb-3">
          <label
            className="fw-bold mb-2"
            style={{ color: isDark ? "#FFF" : "#000" }}
          >
            Timezone
          </label>
          <div
            className="d-flex align-items-center border rounded-3 p-2 position-relative"
            style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.2)" }}
          >
            <Clock
              size={18}
              className="me-2"
              color={isDark ? "#FFF" : "#000"}
            />
            <select
              className="form-control border-0 shadow-none p-0 pe-4"
              style={{
                backgroundColor: "transparent",
                color: isDark ? "#FFF" : "#000",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                cursor: "pointer",
              }}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={saving}
            >
              {/* Include detected timezone if not in the list */}
              {detectedTimezone &&
                !TIMEZONE_OPTIONS.some((t) => t.value === detectedTimezone) && (
                  <option value={detectedTimezone}>
                    {detectedTimezone} (detected)
                  </option>
                )}
              {/* Include current timezone if not in the list */}
              {timezone &&
                !TIMEZONE_OPTIONS.some((t) => t.value === timezone) &&
                timezone !== detectedTimezone && (
                  <option value={timezone}>{timezone}</option>
                )}
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                position: "absolute",
                right: "14px",
                pointerEvents: "none",
                opacity: 0.6,
              }}
            >
              <path
                d="M6 9l6 6 6-6"
                stroke={isDark ? "#FFF" : "#000"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p
            className="text-secondary mt-1 mb-0"
            style={{ fontSize: "11px", fontStyle: "italic" }}
          >
            Determines when your medication reminders fire. Detected:{" "}
            {detectedTimezone}
          </p>
        </div>

        <p
          className="text-secondary mt-3"
          style={{ fontSize: "12px", fontStyle: "italic" }}
        >
          Note: Email and phone number cannot be changed here. Contact support
          to update them.
        </p>
      </div>

      {/* Bottom buttons */}
      <div
        className="p-3 border-top"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn w-100 py-3 fw-bold text-white mb-2"
          style={{
            backgroundColor: saving ? "#999" : "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={handleSave}
          disabled={saving || uploading}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="btn w-100 py-3 fw-bold"
          style={{
            backgroundColor: "transparent",
            color: "#0033CC",
            border: "1px solid #0033CC",
            borderRadius: "8px",
          }}
          onClick={onBack}
          disabled={saving || uploading}
        >
          Cancel
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

export default EditProfile;
