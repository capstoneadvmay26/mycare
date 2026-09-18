// src/pages/History.jsx
import { useState, useEffect, useMemo } from "react";
import {
  JournalCheck,
  JournalX,
  HeartPulse,
} from "react-bootstrap-icons";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";
import { getHistory } from "../services/api";

// Period options
const PERIOD_OPTIONS = [
  { value: "week", label: "Week", days: 7 },
  { value: "month", label: "Month", days: 30 },
  { value: "2months", label: "2 Months", days: 60 },
];

// Type tabs
const TYPE_TABS = [
  { value: "all", label: "All" },
  { value: "medications", label: "Medication" },
  { value: "symptoms", label: "Symptom" },
];

// Format an ISO date into "Today" / "Yesterday" / "Mon, Sep 16"
const formatDateLabel = (iso, now) => {
  if (!iso) return "Unknown date";
  const d = new Date(iso);
  const today = new Date(now);
  const yesterday = new Date(now);
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";

  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// Format time as "10:30 AM"
const formatTime = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
};

const History = () => {
  const { activeProfile } = useProfile();
  const { isDark } = useTheme();
  const profileId = activeProfile?.id || activeProfile?._id;

  const [rawHistory, setRawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [period, setPeriod] = useState("week");

  // "now" — updated once on mount and every 60s via interval.
  // Using setInterval defers the setState call, avoiding the
  // "setState synchronously within an effect" ESLint warning.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  // ------------------------------------------------------------
  // Fetch once (all) on mount + when profile changes
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!profileId) {
        setLoading(false);
        setError("No profile selected.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const resp = await getHistory(profileId, "all");
        const items = resp.data?.history || [];
        if (!cancelled) setRawHistory(items);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Failed to load history"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  // ------------------------------------------------------------
  // Filter + group (client-side)
  // ------------------------------------------------------------
  const groupedHistory = useMemo(() => {
    const periodDays =
      PERIOD_OPTIONS.find((p) => p.value === period)?.days || 7;
    const cutoff = now - periodDays * 24 * 60 * 60 * 1000;

    const filtered = rawHistory.filter((item) => {
      const t = new Date(item.date).getTime();
      if (!Number.isFinite(t) || t < cutoff) return false;

      if (activeTab === "all") return true;
      if (activeTab === "medications") return item.type === "medication";
      if (activeTab === "symptoms") return item.type === "symptom";
      if (activeTab === "check-ins") return item.type === "check-in";
      return true;
    });

    const groups = new Map();
    filtered.forEach((item) => {
      const label = formatDateLabel(item.date, now);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(item);
    });

    return Array.from(groups.entries()).map(([label, items]) => ({
      label,
      items: items.sort((a, b) => new Date(b.date) - new Date(a.date)),
    }));
  }, [rawHistory, activeTab, period, now]);

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------
  const getItemIcon = (item) => {
    if (item.type === "medication") {
      if (item.status === "taken")
        return <JournalCheck size={18} color="#4CBB17" />;
      return <JournalX size={18} color="#D92D20" />;
    }
    return <HeartPulse size={18} color="#F7C81B" />;
  };

  const getItemColor = (item) => {
    if (item.type === "medication") {
      return item.status === "taken" ? "#4CBB17" : "#D92D20";
    }
    if (item.type === "symptom") {
      const sev = (item.severity || "").toLowerCase();
      if (sev === "mild") return "#4CBB17";
      if (sev === "moderate") return "#F7C81B";
      if (sev === "severe") return "#F97316";
      if (sev === "very_severe") return "#D92D20";
      return "#F7C81B";
    }
    return "#0033CC";
  };

  const getItemTitle = (item) => {
    if (item.type === "medication") {
      return `${item.medication || "Medication"} ${item.dosage || ""}`.trim();
    }
    if (item.type === "symptom") return item.symptom || "Symptom";
    if (item.type === "check-in") {
      return `${item.symptom || "Check-in"} · ${item.title || ""}`;
    }
    return item.title || "Event";
  };

  const getItemStatus = (item) => {
    if (item.type === "medication") {
      return item.status === "taken" ? "Taken" : "Skipped";
    }
    if (item.type === "symptom") return item.severity || "";
    if (item.type === "check-in") return item.status || "";
    return "";
  };

  const hasAny = groupedHistory.length > 0;

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      className="d-flex flex-column h-100 p-3"
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#FFF" }}
    >
      <h1
        className="fw-bold mb-3"
        style={{ fontSize: "24px", color: isDark ? "#FFF" : "#000" }}
      >
        History
      </h1>

      {/* Type tabs */}
      <div
        className="d-flex mb-4 border-bottom"
        style={{ borderColor: isDark ? "#333" : "#DEDFE2" }}
      >
        {TYPE_TABS.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="flex-grow-1 pb-2 fw-bold"
              style={{
                border: "none",
                borderBottom: active
                  ? "3px solid #0033CC"
                  : "2px solid transparent",
                background: "transparent",
                color: active ? "#0033CC" : isDark ? "#FFF" : "#000",
                fontSize: "15px",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 🆕 Period filter — polished */}
      <div className="d-flex gap-2 mb-4">
        {PERIOD_OPTIONS.map((p) => {
          const active = period === p.value;
          return (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                flex: 1,
                padding: "10px 0",
                borderRadius: "10px",
                border: active
                  ? "2px solid #0033CC"
                  : `1px solid ${isDark ? "#444" : "rgba(0,0,0,0.12)"}`,
                backgroundColor: active
                  ? "#0033CC"
                  : isDark
                  ? "#1a1a1a"
                  : "#FFFFFF",
                color: active ? "#FFFFFF" : isDark ? "#FFF" : "#333",
                fontWeight: "600",
                fontSize: "13px",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="alert alert-danger py-2" style={{ fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !hasAny && (
        <div className="text-center mt-5 text-muted px-4">
          <p
            className="fw-bold mb-1"
            style={{ fontSize: "16px", color: isDark ? "#FFF" : "#333" }}
          >
            No history in the last{" "}
            {period === "week"
              ? "week"
              : period === "month"
              ? "month"
              : "2 months"}
          </p>
          <p style={{ fontSize: "14px" }}>
            Your logs will appear here as you use the app.
          </p>
        </div>
      )}

      {/* Timeline */}
      {!loading && !error && hasAny && (
        <div className="d-flex flex-column overflow-auto flex-grow-1">
          {groupedHistory.map((group, idx) => (
            <div key={idx} className="mb-4">
              <p
                className="text-secondary fw-bold mb-2"
                style={{ fontSize: "13px" }}
              >
                {group.label}
              </p>

              <div className="d-flex flex-column gap-2">
                {group.items.map((item) => {
                  const color = getItemColor(item);
                  return (
                    <div
                      key={item.id}
                      className="d-flex align-items-center justify-content-between p-3 rounded-3"
                      style={{
                        border: `1px solid ${
                          isDark ? "#333" : "rgba(0,0,0,0.1)"
                        }`,
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="d-flex justify-content-center align-items-center me-3"
                          style={{
                            width: "42px",
                            height: "42px",
                            backgroundColor: `${color}15`,
                            color,
                            borderRadius: "10px",
                            flexShrink: 0,
                          }}
                        >
                          {getItemIcon(item)}
                        </div>

                        <div>
                          <p
                            className="m-0 fw-bold"
                            style={{
                              fontSize: "15px",
                              color: isDark ? "#FFF" : "#000",
                            }}
                          >
                            {getItemTitle(item)}
                          </p>
                          <p
                            className="m-0"
                            style={{
                              fontSize: "13px",
                              color: isDark ? "#A0A0A0" : "#666",
                            }}
                          >
                            {formatTime(item.date)}
                          </p>
                        </div>
                      </div>

                      <div className="text-end">
                        <span
                          className="fw-bold"
                          style={{ fontSize: "12px", color }}
                        >
                          {getItemStatus(item)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;