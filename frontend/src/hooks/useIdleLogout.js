// src/hooks/useIdleLogout.js
import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Auto-logout after N minutes of inactivity.
 *
 * Shows a warning modal WARNING_SECONDS before logout.
 * Any user interaction resets the timer.
 *
 * Callbacks are stored in refs so the hook doesn't reset on every
 * parent render (which was the previous bug).
 */
export const useIdleLogout = ({
  onLogout,
  onWarning,
  onActivity,
  timeoutMs = 30 * 60 * 1000,
  warningMs = 60 * 1000,
  enabled = true,
}) => {
  const [isWarningVisible, setIsWarningVisible] = useState(false);

  // ──────────────────────────────────────────────────────────
  // Refs for values that shouldn't trigger effect re-runs
  // ──────────────────────────────────────────────────────────
  const idleTimerRef = useRef(null);
  const warningTimerRef = useRef(null);
  const isWarningVisibleRef = useRef(false);

  const onLogoutRef = useRef(onLogout);
  const onWarningRef = useRef(onWarning);
  const onActivityRef = useRef(onActivity);
  const timeoutMsRef = useRef(timeoutMs);
  const warningMsRef = useRef(warningMs);

  // Keep refs in sync with props
  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    onActivityRef.current = onActivity;
  }, [onActivity]);

  useEffect(() => {
    timeoutMsRef.current = timeoutMs;
  }, [timeoutMs]);

  useEffect(() => {
    warningMsRef.current = warningMs;
  }, [warningMs]);

  useEffect(() => {
    isWarningVisibleRef.current = isWarningVisible;
  }, [isWarningVisible]);

  // ──────────────────────────────────────────────────────────
  // Clear both timers
  // ──────────────────────────────────────────────────────────
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

  // ──────────────────────────────────────────────────────────
  // Reset the idle timer
  // Reads from refs so it never needs to be recreated
  // ──────────────────────────────────────────────────────────
  const resetTimer = useCallback(() => {
    clearTimers();

    const timeout = timeoutMsRef.current;
    const warning = warningMsRef.current;

    // If warning is currently visible and user became active → dismiss warning
    if (isWarningVisibleRef.current) {
      setIsWarningVisible(false);
      onActivityRef.current?.();
    }

    // Show warning (timeoutMs - warningMs) after activity
    const warningDelay = Math.max(0, timeout - warning);

    idleTimerRef.current = setTimeout(() => {
      setIsWarningVisible(true);
      onWarningRef.current?.();

      // Log out after warning period
      warningTimerRef.current = setTimeout(() => {
        setIsWarningVisible(false);
        onLogoutRef.current?.();
      }, warning);
    }, warningDelay);
  }, [clearTimers]);   // ← ONLY depends on clearTimers (stable)

  // ──────────────────────────────────────────────────────────
  // Reset warning state when `enabled` becomes false (deferred)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      const t = setTimeout(() => setIsWarningVisible(false), 0);
      return () => clearTimeout(t);
    }
  }, [enabled]);

  // ──────────────────────────────────────────────────────────
  // Register activity listeners (only when `enabled` changes)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      clearTimers();
      return;
    }

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

    // Throttle to once per second
    let lastReset = 0;
    const THROTTLE_MS = 1000;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset < THROTTLE_MS) return;
      lastReset = now;
      resetTimer();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleActivity();
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibility);

    // Kick off the initial timer
    resetTimer();

    return () => {
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibility);
      clearTimers();
    };
  }, [enabled, resetTimer, clearTimers]);  // ← all deps are stable now

  return {
    isWarningVisible,
    resetTimer,
  };
};

export default useIdleLogout;