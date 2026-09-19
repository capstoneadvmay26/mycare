// src/pages/Reminders.jsx
import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ClockHistory,
  Alarm,
  Capsule,
  ChatHeart,
  BoxSeam,
} from "react-bootstrap-icons";
import { useTheme } from "../context/ThemeContext";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "../services/api";
import Toast from "../components/ui/Toast";

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

const ReminderRow = ({ icon, title, subtitle, isOn, toggleKey, onToggle }) => (
  <div
    className="d-flex align-items-center py-3 border-bottom"
    style={{ borderColor: "rgba(0,0,0,0.1)" }}
  >
    <div className="me-3">{icon}</div>
    <div className="flex-grow-1">
      <p className="m-0 fw-bold" style={{ fontSize: "16px" }}>
        {title}
      </p>
      <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
        {subtitle}
      </p>
    </div>
    <Toggle isOn={isOn} onClick={() => onToggle(toggleKey)} />
  </div>
);

const Reminders = ({ onBack }) => {
  const { isDark } = useTheme();

  const [settings, setSettings] = useState({
    medNotifications: true,
    checkInReminders: true,
    refillReminders: true,
    snoozeEnabled: true,
  });

  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // Fetch settings
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const resp = await getNotificationSettings();
        const s = resp.data?.settings;
        if (!cancelled && s) {
          setSettings((prev) => ({
            ...prev,
            medNotifications: s.pushEnabled ?? prev.medNotifications,
          }));
          if (s.quietHours) {
            setQuietHoursEnabled(s.quietHours.enabled ?? false);
            setQuietStart(s.quietHours.start || "22:00");
            setQuietEnd(s.quietHours.end || "07:00");
          }
        }
      } catch (err) {
        console.warn("[Reminders] fetch failed:", err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleSetting = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Save quiet hours to backend
  const saveQuietHours = async (enabled, start, end) => {
    setSaving(true);
    try {
      await updateNotificationSettings({
        quietHours: { enabled, start, end },
      });
      setToast({ message: "Quiet hours saved", type: "success" });
    } catch (err) {
      console.error("[Reminders] save failed:", err);
      setToast({
        message:
          err.response?.data?.message || "Failed to save quiet hours",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuietToggle = () => {
    const next = !quietHoursEnabled;
    setQuietHoursEnabled(next);
    saveQuietHours(next, quietStart, quietEnd);
  };

  const handleTimeChange = (which, value) => {
    if (which === "start") {
      setQuietStart(value);
      saveQuietHours(quietHoursEnabled, value, quietEnd);
    } else {
      setQuietEnd(value);
      saveQuietHours(quietHoursEnabled, quietStart, value);
    }
  };

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
          aria-label="Back"
        >
          <ChevronLeft size={28} />
        </button>
        <h1
          className="fw-bold m-0 ms-3"
          style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
        >
          Reminders
        </h1>
      </div>

      <div className="p-3 flex-grow-1 overflow-auto">
        <p
          className="text-secondary fw-bold mb-3"
          style={{ fontSize: "16px" }}
        >
          Manage medication & check-in reminders
        </p>

        <ReminderRow
          icon={<Capsule size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Medication Notifications"
          subtitle="Alerts when it's time to take your meds"
          isOn={settings.medNotifications}
          toggleKey="medNotifications"
          onToggle={toggleSetting}
        />

        <ReminderRow
          icon={<ChatHeart size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Symptom Check-ins"
          subtitle="Daily follow-ups for logged symptoms (Day 1, 2, 3)"
          isOn={settings.checkInReminders}
          toggleKey="checkInReminders"
          onToggle={toggleSetting}
        />

        <ReminderRow
          icon={<BoxSeam size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Refill Reminders"
          subtitle="Get notified when medication supply is running low"
          isOn={settings.refillReminders}
          toggleKey="refillReminders"
          onToggle={toggleSetting}
        />

        <ReminderRow
          icon={<Alarm size={24} color={isDark ? "#FFF" : "#000"} />}
          title="Allow Snooze"
          subtitle="Enable 10/30 minute snooze options"
          isOn={settings.snoozeEnabled}
          toggleKey="snoozeEnabled"
          onToggle={toggleSetting}
        />

        <div className="d-flex align-items-center py-3">
          <ClockHistory size={24} color={isDark ? "#FFF" : "#000"} className="me-3" />
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
            >
              Default Reminder Time
            </p>
            <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
              Set when daily notifications are sent
            </p>
          </div>
          <span className="fw-bold" style={{ color: "#0033CC" }}>
            08:00 AM
          </span>
        </div>

        {/* 🆕 Quiet Hours */}
        <div className="mt-4 pt-3 border-top" style={{ borderColor: isDark ? "#333" : "rgba(0,0,0,0.1)" }}>
          <div className="d-flex align-items-center mb-3">
            <div className="flex-grow-1">
              <p
                className="m-0 fw-bold"
                style={{ fontSize: "16px", color: isDark ? "#FFF" : "#000" }}
              >
                Quiet Hours
              </p>
              <p className="m-0 text-secondary" style={{ fontSize: "12px" }}>
                Pause non-urgent notifications during these hours
              </p>
            </div>
            <Toggle
              isOn={quietHoursEnabled}
              onClick={handleQuietToggle}
              disabled={loading || saving}
            />
          </div>

          {quietHoursEnabled && (
            <div className="d-flex gap-3">
              <div className="flex-grow-1">
                <label
                  className="fw-bold mb-1"
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#FFF" : "#000",
                  }}
                >
                  Start
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={quietStart}
                  onChange={(e) => handleTimeChange("start", e.target.value)}
                  disabled={saving}
                />
              </div>
              <div className="flex-grow-1">
                <label
                  className="fw-bold mb-1"
                  style={{
                    fontSize: "13px",
                    color: isDark ? "#FFF" : "#000",
                  }}
                >
                  End
                </label>
                <input
                  type="time"
                  className="form-control"
                  value={quietEnd}
                  onChange={(e) => handleTimeChange("end", e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3">
        <div
          className="rounded-3 p-3"
          style={{
            backgroundColor: "rgba(0,51,204,0.05)",
            border: "1px solid rgba(0,51,204,0.2)",
          }}
        >
          <p className="m-0" style={{ fontSize: "12px", color: "#0033CC" }}>
            💡 Tip: Keep Medication Notifications on for the best health
            outcomes. You can snooze notifications in the main app if you're
            busy.
          </p>
        </div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />
    </div>
  );
};

export default Reminders;