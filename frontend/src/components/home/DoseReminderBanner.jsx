// src/components/home/DoseReminderBanner.jsx
import { useEffect, useRef, useState } from "react";
import { Bell, Check, Alarm, X } from "react-bootstrap-icons";
import { useTheme } from "../../context/ThemeContext";

const CHIME_INTERVAL_MS = 3000;
const CHIME_MAX_DURATION_MS = 60000;

// ------------------------------------------------------------
// 🆕 Shared AudioContext — created once, resumed on user gesture
// ------------------------------------------------------------
let sharedAudioCtx = null;

const getAudioContext = () => {
  if (sharedAudioCtx) return sharedAudioCtx;

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    sharedAudioCtx = new AudioCtx();
    return sharedAudioCtx;
  } catch (err) {
    console.warn("[Chime] AudioContext creation failed:", err.message);
    return null;
  }
};

/**
 * Play the two-tone chime.
 * The AudioContext must be running (resumed after user gesture).
 */
const playChime = async () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // 🆕 If the context is suspended, try to resume it
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch (err) {
      console.warn("[Chime] Failed to resume context:", err.message);
      return;
    }
  }

  // If it's still not running, bail
  if (ctx.state !== "running") {
    console.warn("[Chime] Audio context not running, skipping chime");
    return;
  }

  try {
    const now = ctx.currentTime;

    // First tone — A5
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.value = 880;
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Second tone — E5
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.value = 660;
    gain2.gain.setValueAtTime(0.0001, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 1.0);
  } catch (err) {
    console.warn("[Chime] Playback error:", err.message);
  }
};

const DoseReminderBanner = ({ dose, onTaken, onSnooze, onSkip, onDismiss }) => {
  const { isDark } = useTheme();

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // 🆕 Flag to track if audio is allowed
  const [audioBlocked, setAudioBlocked] = useState(false);

  const stopChime = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // ------------------------------------------------------------
  // 🆕 Start loop with resume-aware logic
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      // First chime
      await playChime();

      // Check if it worked
      const ctx = getAudioContext();
      if (ctx && ctx.state !== "running") {
        // Audio is blocked — user hasn't interacted with the page yet
        setAudioBlocked(true);
        return;
      }

      if (cancelled) return;

      // Loop every 3 seconds
      intervalRef.current = setInterval(() => {
        playChime();
      }, CHIME_INTERVAL_MS);

      // Auto-stop after 60s
      timeoutRef.current = setTimeout(() => {
        stopChime();
      }, CHIME_MAX_DURATION_MS);
    };

    start();

    return () => {
      cancelled = true;
      stopChime();
    };
    
  }, []);

  // 🆕 Resume audio on any user gesture (tap anywhere in the banner)
  const handleUserGesture = async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
        setAudioBlocked(false);
      } catch (err) {
        console.warn("[Chime] Resume on gesture failed:", err.message);
      }
    }
  };

  // ------------------------------------------------------------
  // Action handlers — stop chime
  // ------------------------------------------------------------
  const handleTaken = (d) => {
    stopChime();
    onTaken?.(d);
  };

  const handleSnooze = (d) => {
    stopChime();
    onSnooze?.(d);
  };

  const handleSkip = (d) => {
    stopChime();
    onSkip?.(d);
  };

  const handleDismiss = () => {
    stopChime();
    onDismiss?.();
  };

  const formatTime = (time24) => {
    const [hh, mm] = time24.split(":").map(Number);
    const period = hh >= 12 ? "pm" : "am";
    const h = hh % 12 === 0 ? 12 : hh % 12;
    return `${h}:${String(mm).padStart(2, "0")}${period}`;
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x w-100 p-3"
      style={{
        maxWidth: "480px",
        zIndex: 1080,
        animation: "reminderSlideDown 0.3s ease-out",
      }}
      onClick={handleUserGesture}   // 🆕 resume audio on any tap
    >
      <div
        className="rounded-4 shadow-lg p-4"
        style={{
          backgroundColor: isDark ? "#1a1a1a" : "#FFF",
          border: "2px solid #0033CC",
        }}
      >
        {/* Header */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="d-flex justify-content-center align-items-center rounded-circle me-3"
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "rgba(0, 51, 204, 0.1)",
            }}
          >
            <Bell size={20} color="#0033CC" />
          </div>
          <div className="flex-grow-1">
            <p
              className="m-0 fw-bold"
              style={{ fontSize: "13px", color: "#0033CC" }}
            >
              Medication Reminder
            </p>
            <p
              className="m-0 text-secondary"
              style={{ fontSize: "11px" }}
            >
              {audioBlocked ? "Tap to enable sound" : "Due now"}
            </p>
          </div>
          <button
            className="btn p-1 border-0"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            style={{ color: "#666" }}
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dose info */}
        <div className="mb-4">
          <p
            className="m-0 fw-bold"
            style={{ fontSize: "20px", color: isDark ? "#FFF" : "#000" }}
          >
            {dose.name}
          </p>
          <p className="m-0 text-secondary" style={{ fontSize: "14px" }}>
            {dose.dosage} · Scheduled for {formatTime(dose.time)}
          </p>
        </div>

        {/* Actions */}
        <div className="d-flex gap-2">
          <button
            className="btn flex-grow-1 py-3 fw-bold text-white d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "#0033CC",
              borderRadius: "10px",
              border: "none",
              fontSize: "14px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleTaken(dose);
            }}
          >
            <Check size={18} className="me-2" />
            Taken
          </button>

          <button
            className="btn flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(247, 200, 27, 0.15)",
              color: "#B45309",
              borderRadius: "10px",
              border: "none",
              fontSize: "14px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSnooze(dose);
            }}
          >
            <Alarm size={18} className="me-2" />
            Snooze
          </button>

          <button
            className="btn flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "rgba(217, 45, 32, 0.1)",
              color: "#D92D20",
              borderRadius: "10px",
              border: "none",
              fontSize: "14px",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleSkip(dose);
            }}
          >
            <X size={18} className="me-2" />
            Skip
          </button>
        </div>
      </div>

      <style>{`
        @keyframes reminderSlideDown {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DoseReminderBanner;