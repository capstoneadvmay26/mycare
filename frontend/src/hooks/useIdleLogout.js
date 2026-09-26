// src/hooks/useIdleLogout.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Auto-logout after N minutes of inactivity.
 *
 * Shows a warning modal WARNING_SECONDS before logout.
 * Any user interaction resets the timer.
 */
export const useIdleLogout = ({
  onLogout,
  onWarning,
  onActivity,
  timeoutMs = 30 * 60 * 1000,   // 30 min
  warningMs = 60 * 1000,        // 60 s
  enabled = true,
}) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  // Refs so we don't re-register listeners on every render
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isWarningVisibleRef = useRef(false);

  // Keep the ref in sync with state
  useEffect(() => {
    isWarningVisibleRef.current = isWarningVisible;
  }, [isWarningVisible]);

  // ------------------------------------------------------------
  // Clear both timers
  // ------------------------------------------------------------
  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
  }, []);

  // ------------------------------------------------------------
  // Reset the idle timer
  // ------------------------------------------------------------
  const resetTimer = useCallback(() => {
    clearTimers();

    // If warning is currently visible and user became active → dismiss warning
    if (isWarningVisibleRef.current) {
      setIsWarningVisible(false);
      onActivity?.();
    }

    // Start the idle countdown
    idleTimerRef.current = setTimeout(() => {
      // Idle timeout hit → show warning
      setIsWarningVisible(true);
      onWarning?.();

      // Start the warning countdown
      warningTimerRef.current = setTimeout(() => {
        // Warning expired → log out
        setIsWarningVisible(false);
        onLogout?.();
      }, warningMs);
    }, timeoutMs - warningMs);  // Show warning `warningMs` before the timeout
  }, [timeoutMs, warningMs, onLogout, onWarning, onActivity, clearTimers]);

  // ------------------------------------------------------------
  // Reset warning state when `enabled` changes to false
  // (extracted from the main effect to avoid ESLint's
  //  "setState synchronously in effect" warning)
  // ------------------------------------------------------------
  useEffect(() => {
    if (!enabled) {
      // Defer the state update to the next tick
      const timer = setTimeout(() => {
        setIsWarningVisible(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  // ------------------------------------------------------------
  // Track user activity
  // ------------------------------------------------------------
  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

    // Events that count as "activity"
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "touchmove",
      "click",
      "focus",
    ];

    // Throttle mousemove / touchmove to avoid resetting on every pixel
    let lastReset = 0;
    const THROTTLE_MS = 1000; // only reset at most once per second

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset < THROTTLE_MS) return;
      lastReset = now;
      resetTimer();
    };

    // Handle tab visibility changes
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleActivity();
      }
    };

    // Register listeners
    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibility);

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimers();
    };
  }, [enabled, resetTimer, clearTimers]);

  return {
    isWarningVisible,
    resetTimer,
  };
};

export default useIdleLogout;