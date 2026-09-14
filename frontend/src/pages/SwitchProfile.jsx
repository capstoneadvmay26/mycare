// src/pages/SwitchProfile.jsx
import { ChevronLeft, CheckCircleFill } from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/ui/Avatar";
import { useApp } from "../context/useApp"

const SwitchProfile = ({ onBack }) => {
  const { profiles, activeProfile, switchProfile } = useProfile();
  const { isDark } = useTheme();
  const { user } = useApp() || {};

  const handleSwitch = (profile) => {
    // Safely extract id (works with both `id` and `_id`)
    const id = profile.id || profile._id;
    if (!id) return;

    // No alert — just switch and go back
    switchProfile(id);
    onBack();
  };

  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      <div className="d-flex align-items-center mb-4">
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
          Switch Profile
        </h1>
      </div>

      <p className="mb-4 text-secondary" style={{ fontSize: "14px" }}>
        Select a profile to view their information.
      </p>

      <div className="d-flex flex-column gap-3">
       {profiles.map((profile) => {
  const profileId = profile.id || profile._id;
  const isActive = activeProfile?.id === profileId;
  const isSelf = profile.isSelf || profile.relationship === "Self";

  // 🆕 Compute display name
  const displayName =
    isSelf && profile.name === "Me"
      ? user?.full_name || "Me"
      : profile.name;

  return (
    <div
      key={profileId}
      className="d-flex align-items-center p-3 rounded-3"
      style={{
        border: isActive
          ? "2px solid #0033CC"
          : `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
        cursor: "pointer",
        backgroundColor: isActive
          ? "rgba(0,51,204,0.05)"
          : isDark
          ? "#1a1a1a"
          : "#FFF",
      }}
      onClick={() => handleSwitch(profile)}
    >
      <Avatar
        src={profile.avatarUrl}
        name={displayName}
        size={40}
        color={profile.color || "#0033CC"}
        className="me-3"
      />
      <div className="flex-grow-1">
        <p
          className="m-0 fw-bold"
          style={{ color: isDark ? "#FFF" : "#000" }}
        >
          {displayName} {isSelf ? "(Me)" : ""}
        </p>
        {!isSelf && (
          <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
            {profile.relationship}
          </p>
        )}
      </div>
      {isActive && <CheckCircleFill size={24} color="#0033CC" />}
    </div>
  );
})}
      </div>
    </div>
  );
};

export default SwitchProfile;