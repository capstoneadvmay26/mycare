// src/pages/Profiles.jsx
import { useState } from "react";

// AFTER
import { ChevronRight, People, ArrowLeftRight } from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { useApp } from "../context/useApp";
import MyProfile from "./MyProfile";
import EditProfile from "./EditProfile";
import Dependents from "./Dependents";
import SwitchProfile from "./SwitchProfile";
import Avatar from "../components/ui/Avatar";

const Profiles = () => {
  const { activeProfile, loading } = useProfile();
  const { isDark } = useTheme();
  const { user } = useApp() || {};
  const [view, setView] = useState("dashboard");

  if (view === "my-profile") {
    return (
      <MyProfile
        onBack={() => setView("dashboard")}
        onEdit={() => setView("edit-profile")}
      />
    );
  }
  if (view === "edit-profile") {
    return <EditProfile onBack={() => setView("my-profile")} />;
  }
  if (view === "dependents") {
    return <Dependents onBack={() => setView("dashboard")} />;
  }
  if (view === "switch") {
    return <SwitchProfile onBack={() => setView("dashboard")} />;
  }

  if (loading && !activeProfile) {
    return (
      <div className="d-flex flex-column h-100 justify-content-center align-items-center bg-white">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-secondary mt-3" style={{ fontSize: "14px" }}>
          Loading profiles...
        </p>
      </div>
    );
  }

  const isSelf =
    activeProfile?.isSelf || activeProfile?.relationship === "Self";

  // Display name for the self profile
  const selfDisplayName =
    isSelf && activeProfile?.name === "Me"
      ? user?.full_name || activeProfile.name
      : activeProfile?.name || "User";

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div
        className="d-flex justify-content-center align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <h1
          className="fw-bold m-0"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Profiles
        </h1>
      </div>

      {/* Menu List */}
      <div className="mt-2">
        {/* My Profile — with user's avatar */}
        <MenuRow
          icon={
            <Avatar
              src={activeProfile?.avatarUrl}
              name={selfDisplayName}
              size={40}
              color={activeProfile?.color || "#0033CC"}
            />
          }
          title="My Profile"
          subtitle="View and manage your personal information"
          onClick={() => setView("my-profile")}
          isDark={isDark}
        />
        // AFTER
        <MenuRow
          icon={<People size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Dependents"
          subtitle="Manage your dependents and their profiles"
          onClick={() => setView("dependents")}
          isDark={isDark}
        />
        <MenuRow
          icon={<ArrowLeftRight size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Switch Profile"
          subtitle="Switch between your profile and dependents"
          onClick={() => setView("switch")}
          isDark={isDark}
        />
      </div>
    </div>
  );
};

const MenuRow = ({ icon, title, subtitle, onClick, isDark }) => (
  <div
    className="d-flex align-items-center p-3 border-bottom"
    style={{
      cursor: "pointer",
      borderColor: isDark ? "#333" : "#DEDFE2",
      minHeight: "80px",
    }}
    onClick={onClick}
  >
    <div className="me-3 flex-shrink-0">{icon}</div>
    <div className="flex-grow-1">
      <p
        className="m-0 fw-bold"
        style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
      >
        {title}
      </p>
      <p
        className="m-0 mt-1"
        style={{ fontSize: "13px", color: "#666", lineHeight: 1.4 }}
      >
        {subtitle}
      </p>
    </div>
    <ChevronRight size={20} color={isDark ? "#FFF" : "#000"} />
  </div>
);

export default Profiles;
