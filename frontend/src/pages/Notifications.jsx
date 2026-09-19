// src/pages/Notifications.jsx
import { useState, useEffect } from "react";
import { ChevronLeft, Bell } from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext";
import { getNotificationSettings, updateNotificationSettings } from "../services/api";

const Toggle = ({ isOn, onClick, disabled }) => (
  <div
    onClick={disabled ? null : onClick}
    className="rounded-pill d-flex align-items-center"
    style={{
      width: "48px",
      height: "28px",
      backgroundColor: isOn ? "#0033CC" : "rgba(107,114,128,0.5)",
      justifyContent: isOn ? "flex-end" : "flex-start",
      padding: "2px",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      opacity: disabled ? 0.6 : 1,
    }}
  >
    <div
      className="rounded-circle bg-white shadow-sm"
      style={{ width: "24px", height: "24px" }}
    />
  </div>
);

const Notifications = ({ onBack }) => {
  const { isDark } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const resp = await getNotificationSettings();
        if (!cancelled && resp.data?.settings) {
          setPushEnabled(resp.data.settings.pushEnabled ?? true);
        }
      } catch (err) {
        console.warn("[Notifications] fetch failed:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async () => {
    const next = !pushEnabled;
    setPushEnabled(next);
    setSaving(true);
    try {
      await updateNotificationSettings({ pushEnabled: next });
    } catch (err) {
      console.error("[Notifications] update failed:", err);
      setPushEnabled(!next); // rollback
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      {/* Header with back arrow */}
      <div
        className="d-flex align-items-center p-3 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        <button
          className="btn p-0 border-0"
          onClick={onBack}
          style={{ color: isDark ? "#FFF" : "#000" }}
          aria-label="Back"
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Notifications
        </h1>
      </div>

      <div className="p-3 flex-grow-1">
        <p className="text-secondary fw-bold mb-3" style={{ fontSize: "16px" }}>
          Manage how MyCare contacts you
        </p>

        <div
          className="d-flex align-items-center p-3 border rounded-3"
          style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.15)" }}
        >
          <Bell size={24} color={isDark ? "#FFF" : "#000"} className="me-3" />
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
            >
              Push Notifications
            </p>
            <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
              Receive medication reminders and check-ins
            </p>
          </div>
          <Toggle
            isOn={pushEnabled}
            onClick={handleToggle}
            disabled={loading || saving}
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;