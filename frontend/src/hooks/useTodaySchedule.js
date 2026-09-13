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
 * ⚠️ Only includes meds whose startDate <= today <= endDate (or no endDate)
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
      const [medsResponse, historyResponse] = await Promise.all([
        getMedications(profileId),
        getHistory(profileId, "medications"),
      ]);

      const medications = medsResponse.data?.data || medsResponse.data || [];
      const allLogs =
        historyResponse.data?.history || historyResponse.data?.data || [];

      // --------------------------------------------------------
      // 1. Compute today's boundaries
      // --------------------------------------------------------
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      // 🆕 Normalized "today" for date-range comparison (midnight local)
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime();

      // --------------------------------------------------------
      // 2. Filter logs to today (client-side, timezone-safe)
      // --------------------------------------------------------
      const todayLogs = allLogs.filter((log) => {
        if (!log.date) return false;
        const logDate = new Date(log.date);
        return logDate >= todayStart && logDate < todayEnd;
      });

      // --------------------------------------------------------
      // 3. Build today's dose slots — ONLY for meds active today
      // --------------------------------------------------------
      const now = new Date();
      const slots = [];

      medications.forEach((med) => {
        const times = Array.isArray(med.scheduleTime) ? med.scheduleTime : [];
        if (times.length === 0) return;

        // 🆕 Check startDate — skip if med starts in the future
        if (med.startDate) {
          const medStart = new Date(med.startDate);
          const medStartMidnight = new Date(
            medStart.getFullYear(),
            medStart.getMonth(),
            medStart.getDate()
          ).getTime();

          if (medStartMidnight > todayMidnight) {
            // Med starts in the future — skip for today's schedule
            return;
          }
        }

        // 🆕 Check endDate — skip if med ended before today
        if (med.endDate) {
          const medEnd = new Date(med.endDate);
          const medEndMidnight = new Date(
            medEnd.getFullYear(),
            medEnd.getMonth(),
            medEnd.getDate()
          ).getTime();

          if (medEndMidnight < todayMidnight) {
            // Med ended in the past — skip for today's schedule
            return;
          }
        }

        // Med is active today → build slots for each scheduled time
        times.forEach((timeStr) => {
          const [hh, mm] = timeStr.split(":").map(Number);
          const slotDate = new Date(todayStart);
          slotDate.setHours(hh, mm, 0, 0);

          // Match log within 60 minutes
          const matchingLog = todayLogs.find((log) => {
            if (!log.medication) return false;
            if (log.medication !== med.name) return false;
            const logDate = new Date(log.date);
            const diffMs = Math.abs(logDate.getTime() - slotDate.getTime());
            return diffMs <= 60 * 60 * 1000;
          });

          slots.push({
            id: `${med._id || med.id}-${timeStr}`,
            medicationId: med._id || med.id,
            name: med.name,
            dosage: med.dosage,
            time: timeStr,
            scheduledFor: slotDate,
            status: matchingLog
              ? matchingLog.status
              : slotDate <= now
              ? "due-now"
              : "upcoming",
            logId: matchingLog?.id || null,
          });
        });
      });

      // --------------------------------------------------------
      // 4. Bucket into sections
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