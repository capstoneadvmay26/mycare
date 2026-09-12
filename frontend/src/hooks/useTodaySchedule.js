// src/hooks/useTodaySchedule.js
import { useState, useEffect, useCallback } from "react";
import { getMedications, getHistory } from "../services/api";

/**
 * Compute today's dose schedule for a given profile.
 *
 * Fetches:
 *   - Active medications for the profile
 *   - Medication history logs (today's taken/skipped events)
 *
 * Then buckets each dose slot into:
 *   - dueNow      → time has passed, no log yet
 *   - upcoming    → time hasn't come yet
 *   - completed   → taken or skipped today
 *
 * Returns:
 *   { dueNow, upcoming, completed, total, taken, adherence, loading, error, refresh }
 */
export const useTodaySchedule = (profileId) => {
  const [state, setState] = useState({
    dueNow: [],
    upcoming: [],
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
        completed: [],
        total: 0,
        taken: 0,
        adherence: 0,
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: "" }));

    try {
      // Fetch medications and history in parallel
      const [medsResponse, historyResponse] = await Promise.all([
        getMedications(profileId),
        getHistory(profileId, "medications"),
      ]);

      const medications =
        medsResponse.data?.data || medsResponse.data || [];

      const allLogs =
        historyResponse.data?.history ||
        historyResponse.data?.data ||
        [];

      // --------------------------------------------------------
      // 1. Filter logs to today (client-side, timezone-safe)
      // --------------------------------------------------------
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const todayLogs = allLogs.filter((log) => {
        if (!log.date) return false;
        const logDate = new Date(log.date);
        return logDate >= todayStart && logDate < todayEnd;
      });

      // --------------------------------------------------------
      // 2. Build today's dose slots
      // --------------------------------------------------------
      const now = new Date();
      const slots = [];

      medications.forEach((med) => {
        const times = Array.isArray(med.scheduleTime) ? med.scheduleTime : [];
        if (times.length === 0) return; // skip as-needed meds

        times.forEach((timeStr) => {
          const [hh, mm] = timeStr.split(":").map(Number);
          const slotDate = new Date(todayStart);
          slotDate.setHours(hh, mm, 0, 0);

          // Find a matching log for this dose (by medication name + time)
          const matchingLog = todayLogs.find((log) => {
            if (!log.medication) return false;
            if (log.medication !== med.name) return false;
            const logDate = new Date(log.date);
            return (
              logDate.getHours() === hh &&
              logDate.getMinutes() === mm
            );
          });

          slots.push({
            id: `${med._id || med.id}-${timeStr}`,
            medicationId: med._id || med.id,
            name: med.name,
            dosage: med.dosage,
            time: timeStr,
            scheduledFor: slotDate,
            status: matchingLog
              ? matchingLog.status // "taken" | "skipped"
              : slotDate <= now
              ? "due-now"
              : "upcoming",
            logId: matchingLog?.id || null,
          });
        });
      });

      // --------------------------------------------------------
      // 3. Bucket into sections
      // --------------------------------------------------------
      const dueNow = slots.filter((s) => s.status === "due-now");
      const upcoming = slots.filter((s) => s.status === "upcoming");
      const completed = slots.filter(
        (s) => s.status === "taken" || s.status === "skipped"
      );

      const taken = completed.filter((s) => s.status === "taken").length;
      const total = slots.length;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      setState({
        dueNow,
        upcoming,
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
  }, [profileId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  return { ...state, refresh: fetchSchedule };
};