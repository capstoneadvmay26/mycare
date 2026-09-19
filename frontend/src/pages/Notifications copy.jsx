// src/pages/Notifications.jsx
import { useApp } from "../context/useApp";
import { useTheme } from "../context/ThemeContext";
import { useNotifications } from "../hooks/useNotifications";
import {
  Bell,
  Clock,
  ExclamationTriangle,
  ExclamationCircle,
  HeartPulse,
} from "react-bootstrap-icons";

const Notifications = () => {
  const { setCurrentTab } = useApp();
  const { isDark } = useTheme();
  const { notifications, loading } = useNotifications();

  const getIcon = (notif) => {
    switch (notif.type) {
      case "missed":
        return <ExclamationTriangle size={24} color="#D92D20" />;
      case "due-now":
        return <Clock size={24} color="#F7C81B" />;
      case "upcoming":
        return <Clock size={24} color="#666" />;
      case "check-in-due":
        return <HeartPulse size={24} color="#0033CC" />;
      default:
        return <ExclamationCircle size={24} color="#666" />;
    }
  };

  const getAccent = (notif) => {
    switch (notif.type) {
      case "missed":
        return "#D92D20";
      case "due-now":
        return "#B45309";
      case "check-in-due":
        return "#0033CC";
      default:
        return "#666";
    }
  };

  const handleNotifClick = (notif) => {
    if (notif.type === "check-in-due" && notif.symptomId) {
      localStorage.setItem("mycare_checkin_symptom_id", notif.symptomId);
      setCurrentTab("CheckIn");
      return;
    }
    if (notif.actionTarget?.tab) {
      setCurrentTab(notif.actionTarget.tab);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <Bell
          size={28}
          color={isDark ? "#FFF" : "#000"}
          className="me-3"
        />
        <h1
          className="fw-bold m-0"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Notifications
        </h1>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-5">
          <div
            className="d-flex justify-content-center align-items-center rounded-circle mx-auto mb-4"
            style={{
              width: "80px",
              height: "80px",
              backgroundColor: "rgba(0, 51, 204, 0.08)",
            }}
          >
            <Bell size={40} color="#0033CC" />
          </div>
          <p
            className="fw-bold mb-1"
            style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
          >
            You're all caught up!
          </p>
          <p className="text-secondary" style={{ fontSize: "14px" }}>
            We'll notify you when a dose is due or a check-in is needed.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="d-flex flex-column gap-2 overflow-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="d-flex align-items-start p-3 rounded-3"
              style={{
                backgroundColor: isDark ? "#2a2a2a" : "#F9FAFB",
                border: `1px solid ${
                  isDark ? "#444" : "rgba(0,0,0,0.08)"
                }`,
                cursor: "pointer",
              }}
              onClick={() => handleNotifClick(notif)}
            >
              <div className="me-3 flex-shrink-0 mt-1">
                {getIcon(notif)}
              </div>
              <div className="flex-grow-1">
                <p
                  className="m-0 fw-bold"
                  style={{
                    fontSize: "15px",
                    color: getAccent(notif),
                  }}
                >
                  {notif.title}
                </p>
                <p
                  className="m-0 mt-1"
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#A0A0A0" : "#666",
                  }}
                >
                  {notif.body}
                </p>
                <p
                  className="m-0 mt-1"
                  style={{ fontSize: "11px", color: "#999" }}
                >
                  {formatDate(notif.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;