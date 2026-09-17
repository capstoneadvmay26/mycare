// src/hooks/useTodaySchedule.js
import { useState, useEffect, useCallback } from "react";
import { getMedications, getMedicationHistory } from "../services/api";
import { getSnoozeState, clearExpiredSnoozes } from "../utils/snoozeStore";
import { useProfile } from "../context/ProfileContext";

/**
 * Convert an ISO timestamp to "HH:MM" in a given timezone.
 * Falls back to the browser's local timezone if no timeZone is provided.
 */
const isoToHHMMInZone = (iso, timeZone) => {
  if (!iso) return "";
  const date = new Date(iso);
  try {
    if (timeZone) {
      const parts = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      }).formatToParts(date);

      const hour = parts.find((p) => p.type === "hour")?.value || "00";
      const minute = parts.find((p) => p.type === "minute")?.value || "00";
      return `${hour}:${minute}`;
    }
  } catch (err) {
    console.warn("[useTodaySchedule] timezone conversion failed:", err.message);
  }

  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * Extract a medication identifier from a history log entry.
 * Handles BOTH:
 *   - populated object: { _id, name, dosage }
 *   - plain name string: "Paracetamol"
 */
const getLogMedicationIdentity = (log) => {
  const m = log?.medication;
  if (!m) return { id: null, name: null };
  if (typeof m === "object") {
    return {
      id: m._id || m.id || null,
      name: m.name || null,
    };
  }
  return { id: null, name: String(m) };
};

/**
 * Extract a medication identifier from a medication object.
 */
const getMedIdentity = (med) => ({
  id: med._id || med.id,
  name: med.name,
});

export const useTodaySchedule = (profileId) => {
  const { activeProfile } = useProfile();
  const profileTimezone = activeProfile?.timezone || null;

  const [state, setState] = useState({
    dueNow: [],
    upcoming: [],
    missed: [],
    completed: [],
    total: 0,
    taken: 0,
    adherence: 0,
    loading: true,
    error: "",
  });

  const fetchSchedule = useCallback(async () => {
    if (!profileId) {
      setState((s) => ({
        ...s,
        loading: false,
        error: "",
        dueNow: [],
        upcoming: [],
        missed: [],
        completed: [],
        total: 0,
        taken: 0,
        adherence: 0,
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: "" }));

    try {
      clearExpiredSnoozes();

      const [medsResponse, historyResponse] = await Promise.all([
        getMedications(profileId),
        getMedicationHistory(profileId, "week"),
      ]);

      const medications = medsResponse.data?.data || medsResponse.data || [];
      const allLogs =
        historyResponse.data?.history || historyResponse.data?.data || [];

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayMidnight = todayStart.getTime();

      // Get today's date string in the profile's timezone
      let todayDateStr;
      try {
        todayDateStr = new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: profileTimezone || undefined,
        }).format(new Date());
      } catch {
        todayDateStr = today.toISOString().split("T")[0];
      }

      // Filter logs to today (in profile timezone)
      const todayLogs = allLogs.filter((log) => {
        const iso = log.scheduledFor || log.date;
        if (!iso) return false;
        try {
          const logDateStr = new Intl.DateTimeFormat("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            timeZone: profileTimezone || undefined,
          }).format(new Date(iso));
          return logDateStr === todayDateStr;
        } catch {
          return String(iso).split("T")[0] === todayDateStr;
        }
      });

      // Get current time in profile timezone
      let nowMinutes;
      try {
        const parts = new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: profileTimezone || undefined,
        }).formatToParts(new Date());

        const hour = parseInt(
          parts.find((p) => p.type === "hour")?.value || "0",
          10
        );
        const minute = parseInt(
          parts.find((p) => p.type === "minute")?.value || "0",
          10
        );
        nowMinutes = hour * 60 + minute;
      } catch {
        nowMinutes = today.getHours() * 60 + today.getMinutes();
      }

      const slots = [];

      medications.forEach((med) => {
        const times = Array.isArray(med.scheduleTime)
          ? med.scheduleTime
          : med.scheduleTime
          ? [med.scheduleTime]
          : [];
        if (times.length === 0) return;

        // Skip meds not yet started
        if (med.startDate) {
          const ms = new Date(med.startDate);
          const msMid = new Date(
            ms.getFullYear(),
            ms.getMonth(),
            ms.getDate()
          ).getTime();
          if (msMid > todayMidnight) return;
        }

        // Skip meds already ended
        if (med.endDate) {
          const me = new Date(med.endDate);
          const meMid = new Date(
            me.getFullYear(),
            me.getMonth(),
            me.getDate()
          ).getTime();
          if (meMid < todayMidnight) return;
        }

        const { id: medId, name: medName } = getMedIdentity(med);

        times.forEach((timeStr) => {
          const [slotHH, slotMM] = timeStr.split(":").map(Number);
          const slotMinutes = slotHH * 60 + slotMM;
          const minutesPast = nowMinutes - slotMinutes;

          // ---- Match a log to this slot ----
          // Strategy:
          //   1. If log.medication is a populated object → match by _id
          //   2. Fallback → match by name (case-insensitive)
          //   3. Then apply fuzzy time window (<= 5 min) to disambiguate
          //      multiple doses of the same medication per day
          const matchingLog = todayLogs.find((log) => {
            const { id: logMedId, name: logMedName } =
              getLogMedicationIdentity(log);

            // Identity check
            let identityMatch = false;
            if (logMedId && medId) {
              identityMatch = String(logMedId) === String(medId);
            } else if (logMedName && medName) {
              identityMatch =
                logMedName.trim().toLowerCase() ===
                medName.trim().toLowerCase();
            }
            if (!identityMatch) return false;

            const iso = log.scheduledFor || log.date;
            if (!iso) return false;

            // Time check (fuzzy — same occurrence)
            const logHHMM = isoToHHMMInZone(iso, profileTimezone);
            const [logH, logM] = logHHMM.split(":").map(Number);
            if (
              !Number.isFinite(logH) ||
              !Number.isFinite(logM)
            ) {
              return false;
            }
            const logMinutes = logH * 60 + logM;

            return Math.abs(logMinutes - slotMinutes) <= 5;
          });

          // ---- Status ----
          let status;
          if (matchingLog?.status === "taken") {
            status = "taken";
          } else if (matchingLog?.status === "skipped") {
            status = "skipped";
          } else if (minutesPast < 0) {
            // Anything before the scheduled minute → upcoming
            status = "upcoming";
          } else if (minutesPast <= 30) {
            // Within the markable window
            status = "due-now";
          } else {
            status = "missed";
          }

          const scheduledFor = new Date(todayStart);
          scheduledFor.setHours(slotHH, slotMM, 0, 0);

          const logId = matchingLog?._id || matchingLog?.id || null;
          const snoozeState = logId
            ? getSnoozeState(logId)
            : { isSnoozed: false };

          slots.push({
            id: `${medId}-${timeStr}`,
            medicationId: medId,
            logId,
            name: med.name,
            dosage: med.dosage,
            time: timeStr,
            scheduledFor,
            status,
            logStatus: matchingLog?.status || null,
            hasLog: !!logId,
            isSnoozed: snoozeState.isSnoozed,
            snoozedUntil: snoozeState.until || null,
            snoozeMinutes: snoozeState.minutes || null,
            minutesPast: Math.max(0, minutesPast),
          });
        });
      });

      const dueNow = slots.filter((s) => s.status === "due-now");
      const upcoming = slots.filter((s) => s.status === "upcoming");
      const missed = slots.filter((s) => s.status === "missed");
      const completed = slots.filter(
        (s) => s.status === "taken" || s.status === "skipped"
      );

      const taken = completed.filter((s) => s.status === "taken").length;
      const total = slots.length;
      const adherence =
        total > 0 ? Math.round((taken / total) * 100) : 0;

      setState({
        dueNow,
        upcoming,
        missed,
        completed,
        total,
        taken,
        adherence,
        loading: false,
        error: "",
      });
    } catch (err) {
      console.error("[useTodaySchedule] Error:", err);
      setState((s) => ({
        ...s,
        loading: false,
        error:
          err.response?.data?.message ||
          err.message ||
          "Failed to load schedule",
      }));
    }
  }, [profileId, profileTimezone]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { ...state, refresh: fetchSchedule };
};