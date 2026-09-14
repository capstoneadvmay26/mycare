// src/pages/Profiles.jsx
import { useState } from "react";
import {
  ChevronRight,
  PersonBoundingBox,
  PeopleFill,
  ArrowLeftRight,
} from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import MyProfile from "./MyProfile";
import EditProfile from "./EditProfile";
import Dependents from "./Dependents";
import SwitchProfile from "./SwitchProfile";
import Avatar from "../components/ui/Avatar";
import { useApp } from "../context/useApp";



const Profiles = () => {
  const { activeProfile, loading } = useProfile();
  const { isDark } = useTheme();
  const [view, setView] = useState("dashboard");

  const { user } = useApp() || {};

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

  // Handle loading state
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

      {/* Active Profile Mini-Header */}
     {activeProfile && (
  <div
    className="d-flex align-items-center mx-3 mt-4 mb-3 p-3 rounded-3"
    style={{ backgroundColor: "rgba(0, 51, 204, 0.06)" }}
  >
    <Avatar
      src={activeProfile.avatarUrl}
      name={
        isSelf && activeProfile.name === "Me"
          ? user?.full_name || activeProfile.name
          : activeProfile.name
      }
      size={40}
      color={activeProfile.color || "#0033CC"}
      className="me-3"
    />
    <div className="flex-grow-1">
      <p
        className="m-0 fw-bold"
        style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
      >
        {isSelf && activeProfile.name === "Me"
          ? `${user?.full_name || "Me"} (Me)`
          : `${activeProfile.name}${isSelf ? " (Me)" : ""}`}
      </p>
      <p className="m-0" style={{ fontSize: "12px", color: "#666" }}>
        {isSelf
          ? "Current Profile"
          : `Managing ${activeProfile.relationship}'s care`}
      </p>
    </div>
  </div>
)}

      {/* Menu List */}
      <div className="mt-2">
        <MenuRow
          icon={
            <PersonBoundingBox size={24} color={isDark ? "#FFF" : "#000"} />
          }
          title="My Profile"
          subtitle="View and manage your personal information"
          onClick={() => setView("my-profile")}
          isDark={isDark}
        />

        <MenuRow
          icon={<PeopleFill size={24} color={isDark ? "#FFF" : "#000"} />}
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
    }}
    onClick={onClick}
  >
    <div className="me-3">{icon}</div>
    <div className="flex-grow-1">
      <p
        className="m-0 fw-bold"
        style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
      >
        {title}
      </p>
      <p className="m-0" style={{ fontSize: "12px", color: "#666" }}>
        {subtitle}
      </p>
    </div>
    <ChevronRight size={20} color={isDark ? "#FFF" : "#000"} />
  </div>
);

export default Profiles;
