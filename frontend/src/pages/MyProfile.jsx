// src/pages/MyProfile.jsx
import {
  ChevronLeft,
  Person,
  Envelope,
  Telephone,
  CalendarEvent,
  GenderMale,
} from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";
import Avatar from "../components/ui/Avatar";
import { Clock } from "react-bootstrap-icons";

const formatDate = (isoDate) => {
  if (!isoDate) return "Not provided";
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Not provided";
  }
};

const MyProfile = ({ onBack, onEdit }) => {
  const { activeProfile } = useProfile();
  const { user } = useApp() || {};
  const { isDark } = useTheme();

  const isSelf =
    activeProfile?.isSelf || activeProfile?.relationship === "Self";

  // 🆕 For self profile, prefer user's name over the profile's placeholder name
  const rawName = activeProfile?.name || "";
  const selfName = user?.full_name || rawName;
  const displayName =
    isSelf && rawName === "Me" ? selfName : rawName || selfName;

  const email = user?.email || "Not provided";
  const phone = user?.phone || "Not provided";
  const dob =
    activeProfile?.dateOfBirth || (isSelf ? user?.date_of_birth : null);
  const gender =
    activeProfile?.gender || (isSelf ? user?.gender : null) || "Not provided";

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
          My Profile
        </h1>
      </div>

      {/* Avatar */}
      <div className="d-flex justify-content-center mt-4 mb-4">
        <Avatar
          src={activeProfile?.avatarUrl}
          name={displayName}
          size={110}
          color={activeProfile?.color || "#0033CC"}
          border="2px solid #DEDFE2"
        />
      </div>

      {/* Data List */}
      <div
        className="mx-3 border rounded-3 overflow-hidden"
        style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.15)" }}
      >
        <InfoRow
          icon={<Person size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Full Name"
          value={`${displayName}${isSelf ? " (Me)" : ""}`}
          isDark={isDark}
        />
        <InfoRow
          icon={<Envelope size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Email Address"
          value={email}
          isDark={isDark}
        />
        <InfoRow
          icon={<Telephone size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Phone Number"
          value={phone}
          isDark={isDark}
        />
        <InfoRow
          icon={<CalendarEvent size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Date of Birth"
          value={formatDate(dob)}
          isDark={isDark}
        />
        <InfoRow
          icon={<GenderMale size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Gender"
          value={gender}
          isDark={isDark}
          noBorder
        />

        <InfoRow
          icon={<Clock size={20} color={isDark ? "#FFF" : "#000"} />}
          label="Timezone"
          value={activeProfile?.timezone || "UTC"}
          isDark={isDark}
          noBorder
        />
      </div>

      <div className="p-3 mt-auto">
        <button
          className="btn w-100 py-3 fw-bold"
          style={{
            backgroundColor: "rgba(0, 51, 204, 0.1)",
            color: "#0033CC",
            borderRadius: "8px",
            border: "none",
          }}
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, isDark, noBorder }) => (
  <div
    className="d-flex align-items-center p-3"
    style={{
      borderBottom: noBorder
        ? "none"
        : `1px solid ${isDark ? "#333" : "#DEDFE2"}`,
    }}
  >
    <div className="me-3">{icon}</div>
    <span
      className="flex-grow-1 fw-bold"
      style={{ fontSize: "14px", color: isDark ? "#FFF" : "#000" }}
    >
      {label}
    </span>
    <span
      className="text-secondary text-end"
      style={{
        fontSize: "14px",
        maxWidth: "55%",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value}
    </span>
  </div>
);

export default MyProfile;
