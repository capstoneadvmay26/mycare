// src/hooks/useTodaySchedule.js
import { useState, useEffect, useCallback } from "react";
import { getMedications, getMedicationHistory } from "../services/api";
import {
  getSnoozeState,
  clearExpiredSnoozes,
} from "../utils/snoozeStore";

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
      // Housekeeping: remove expired snoozes
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
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const todayMidnight = todayStart.getTime();
      const todayDateStr = today.toISOString().split("T")[0];

      // Filter logs to today via raw ISO date string
      const todayLogs = allLogs.filter((log) => {
        const iso = log.scheduledFor || log.date;
        if (!iso) return false;
        return String(iso).split("T")[0] === todayDateStr;
      });

      const now = new Date();
      const nowHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      const slots = [];

      medications.forEach((med) => {
        const times = Array.isArray(med.scheduleTime) ? med.scheduleTime : [];
        if (times.length === 0) return;

        if (med.startDate) {
          const ms = new Date(med.startDate);
          const msMid = new Date(ms.getFullYear(), ms.getMonth(), ms.getDate()).getTime();
          if (msMid > todayMidnight) return;
        }

        if (med.endDate) {
          const me = new Date(med.endDate);
          const meMid = new Date(me.getFullYear(), me.getMonth(), me.getDate()).getTime();
          if (meMid < todayMidnight) return;
        }

        const medId = med._id || med.id;

        times.forEach((timeStr) => {
          const [hh, mm] = timeStr.split(":").map(Number);

          const matchingLog = todayLogs.find((log) => {
            const logMedId =
              typeof log.medication === "object"
                ? log.medication?._id || log.medication?.id
                : log.medication;

            if (String(logMedId) !== String(medId)) return false;

            const iso = log.scheduledFor || log.date;
            if (!iso) return false;

            const timePart = String(iso).split("T")[1] || "";
            const logHHMM = timePart.substring(0, 5);

            return logHHMM === timeStr;
          });

          let status;
          if (matchingLog?.status === "taken") status = "taken";
          else if (matchingLog?.status === "skipped") status = "skipped";
          else {
            status = timeStr <= nowHHMM ? "due-now" : "upcoming";
          }

          const scheduledFor = new Date(todayStart);
          scheduledFor.setHours(hh, mm, 0, 0);

          // 🆕 Read snooze state for this dose
          const logId = matchingLog?._id || null;
          const snoozeState = logId ? getSnoozeState(logId) : { isSnoozed: false };

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
            // 🆕 Snooze fields
            isSnoozed: snoozeState.isSnoozed,
            snoozedUntil: snoozeState.until || null,
            snoozeMinutes: snoozeState.minutes || null,
          });
        });
      });

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