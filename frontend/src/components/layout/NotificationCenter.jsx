// src/components/layout/NotificationCenter.jsx
import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Clock,
  ExclamationTriangle,
  ExclamationCircle,
  HeartPulse,
} from "react-bootstrap-icons";
import { useApp } from "../../context/useApp";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../hooks/useNotifications";

const NotificationCenter = () => {
  const { setCurrentTab } = useApp();
  const { isDark } = useTheme();
  const { notifications, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getIcon = (notif) => {
    switch (notif.type) {
      case "missed":
        return <ExclamationTriangle size={16} color="#D92D20" />;
      case "due-now":
        return <Clock size={16} color="#F7C81B" />;
      case "upcoming":
        return <Clock size={16} color="#666" />;
      case "check-in-due":
        return <HeartPulse size={16} color="#0033CC" />;
      default:
        return <ExclamationCircle size={16} color="#666" />;
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
    setIsOpen(false);

    if (notif.type === "check-in-due" && notif.symptomId) {
      localStorage.setItem("mycare_checkin_symptom_id", notif.symptomId);
      setCurrentTab("CheckIn");
      return;
    }

    if (notif.actionTarget?.tab) {
      setCurrentTab(notif.actionTarget.tab);
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className="btn position-relative p-0 border-0"
        onClick={() => setIsOpen(!isOpen)}
        style={{ outline: "none", color: isDark ? "#FFF" : "#000" }}
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span
            className="position-absolute rounded-pill d-flex align-items-center justify-content-center"
            style={{
              top: "-4px",
              right: "-6px",
              backgroundColor: "#D92D20",
              color: "#FFF",
              fontSize: "10px",
              fontWeight: "700",
              minWidth: "18px",
              height: "18px",
              padding: "0 5px",
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="position-absolute shadow-lg"
          style={{
            top: "40px",
            right: "-8px",
            width: "340px",
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "420px",
            overflowY: "auto",
            backgroundColor: isDark ? "#1a1a1a" : "#FFF",
            borderRadius: "12px",
            border: `1px solid ${isDark ? "#333" : "rgba(0,0,0,0.1)"}`,
            zIndex: 1060,
          }}
        >
          <div
            className="p-3 border-bottom"
            style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
          >
            <h6
              className="fw-bold m-0"
              style={{ color: isDark ? "#FFF" : "#000" }}
            >
              Notifications
            </h6>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-secondary m-0" style={{ fontSize: "13px" }}>
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="d-flex align-items-start p-3 border-bottom"
                style={{
                  borderColor: isDark ? "#333" : "rgba(0,0,0,0.05)",
                  cursor: "pointer",
                }}
                onClick={() => handleNotifClick(notif)}
              >
                <div className="me-3 mt-1 flex-shrink-0">{getIcon(notif)}</div>
                <div className="flex-grow-1">
                  <p
                    className="m-0 fw-bold"
                    style={{
                      fontSize: "14px",
                      color: getAccent(notif),
                    }}
                  >
                    {notif.title}
                  </p>
                  <p
                    className="m-0"
                    style={{
                      fontSize: "12px",
                      color: isDark ? "#A0A0A0" : "#666",
                    }}
                  >
                    {notif.body}
                  </p>
                  <p
                    className="m-0 mt-1"
                    style={{ fontSize: "11px", color: "#999" }}
                  >
                    {notif.relativeTime || "Just now"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
