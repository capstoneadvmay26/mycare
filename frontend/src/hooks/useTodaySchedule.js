// src/hooks/useTodaySchedule.js
import { useState, useEffect, useCallback } from "react";
import { getMedications, getMedicationHistory } from "../services/api";

/**
 * Compute today's dose schedule for a given profile.
 *
 * The backend stores times as UTC ISO strings (e.g. "2026-09-13T18:06:00.000Z"),
 * but the user's wall-clock time is intended to match the HH:MM in the ISO string.
 * To avoid timezone drift, we compare the raw HH:MM substrings instead of
 * parsing through Date (which shifts by the local timezone offset).
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
        getMedicationHistory(profileId, "week"),
      ]);

      const medications = medsResponse.data?.data || medsResponse.data || [];
      const allLogs =
        historyResponse.data?.history || historyResponse.data?.data || [];

      console.log(
        "[useTodaySchedule] Fetched",
        medications.length,
        "medications,",
        allLogs.length,
        "logs"
      );

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

      const todayMidnight = todayStart.getTime();
      const todayDateStr = today.toISOString().split("T")[0]; // "2026-09-13"

      // --------------------------------------------------------
      // 2. Filter logs to TODAY using the raw ISO date substring
      //    This avoids timezone drift entirely.
      // --------------------------------------------------------
      const todayLogs = allLogs.filter((log) => {
        const iso = log.scheduledFor || log.date;
        if (!iso) return false;
        const logDateStr = String(iso).split("T")[0];
        return logDateStr === todayDateStr;
      });

      console.log(
        "[useTodaySchedule] Today's logs:",
        todayLogs.map((l) => ({
          _id: l._id,
          medName: l.medication?.name,
          scheduledFor: l.scheduledFor,
          status: l.status,
        }))
      );

      // --------------------------------------------------------
      // 3. Build today's dose slots
      // --------------------------------------------------------
      const now = new Date();
      const nowHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
      const slots = [];

      medications.forEach((med) => {
        const times = Array.isArray(med.scheduleTime) ? med.scheduleTime : [];
        if (times.length === 0) return;

        // Skip meds not yet started
        if (med.startDate) {
          const ms = new Date(med.startDate);
          const msMid = new Date(ms.getFullYear(), ms.getMonth(), ms.getDate()).getTime();
          if (msMid > todayMidnight) return;
        }

        // Skip meds already ended
        if (med.endDate) {
          const me = new Date(med.endDate);
          const meMid = new Date(me.getFullYear(), me.getMonth(), me.getDate()).getTime();
          if (meMid < todayMidnight) return;
        }

        const medId = med._id || med.id;

        times.forEach((timeStr) => {
          // timeStr is "HH:MM" from the medication's scheduleTime array
          const [hh, mm] = timeStr.split(":").map(Number);

          // 🎯 Find matching log by comparing raw HH:MM substrings
          // The backend stores the intended wall-clock time as-is in the UTC
          // string (e.g. "18:08" → "…T18:08:00.000Z"), so we compare strings.
          const matchingLog = todayLogs.find((log) => {
            const logMedId =
              typeof log.medication === "object"
                ? log.medication?._id || log.medication?.id
                : log.medication;

            if (String(logMedId) !== String(medId)) return false;

            const iso = log.scheduledFor || log.date;
            if (!iso) return false;

            // Extract HH:MM from ISO string without timezone conversion
            // "2026-09-13T18:08:00.000Z" → "18:08"
            const timePart = String(iso).split("T")[1] || "";
            const logHHMM = timePart.substring(0, 5);

            return logHHMM === timeStr;
          });

          // Determine status
          let status;
          if (matchingLog?.status === "taken") status = "taken";
          else if (matchingLog?.status === "skipped") status = "skipped";
          else {
            // Compare using wall-clock strings, not Date objects
            status = timeStr <= nowHHMM ? "due-now" : "upcoming";
          }

          // For UI display, build a "scheduledFor" Date using the raw HH:MM
          // as LOCAL time — this makes it consistent with the string match.
          const scheduledFor = new Date(todayStart);
          scheduledFor.setHours(hh, mm, 0, 0);

          slots.push({
            id: `${medId}-${timeStr}`,
            medicationId: medId,
            logId: matchingLog?._id || null,
            name: med.name,
            dosage: med.dosage,
            time: timeStr,
            scheduledFor,
            status,
            logStatus: matchingLog?.status || null,
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

      console.log("[useTodaySchedule] Slot summary:", {
        total,
        taken,
        dueNow: dueNow.length,
        upcoming: upcoming.length,
        completed: completed.length,
      });

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