// src/hooks/useTodaySchedule.js
import { useState, useEffect, useCallback } from "react";
import { getMedications, getMedicationHistory } from "../services/api";
import { getSnoozeState, clearExpiredSnoozes } from "../utils/snoozeStore";
import { useProfile } from "../context/ProfileContext";

// ------------------------------------------------------------
// Date helpers — all in profile timezone
// ------------------------------------------------------------

const isoToDateStrInZone = (iso, timeZone) => {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: timeZone || undefined,
    }).format(new Date(iso));
  } catch {
    return String(iso).split("T")[0];
  }
};
// eslint-disable-next-line no-unused-vars
const isoToHHMMInZone = (iso, timeZone) => {
  if (!iso) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone || undefined,
    }).formatToParts(new Date(iso));
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    return `${hour}:${minute}`;
  } catch {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
  }
};

const nowMinutesInZone = (timeZone) => {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZone || undefined,
    }).formatToParts(new Date());
    const h = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
      10
    );
    const m = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
      10
    );
    return h * 60 + m;
  } catch {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
};

const toScheduleArray = (scheduleTime) => {
  if (!scheduleTime) return [];
  if (Array.isArray(scheduleTime)) return scheduleTime.filter(Boolean);
  return [scheduleTime];
};

const getLogMedicationIdentity = (log) => {
  const m = log?.medication;
  if (!m) return { id: null, name: null };
  if (typeof m === "object") {
    return { id: m._id || m.id || null, name: m.name || null };
  }
  return { id: null, name: String(m) };
};

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

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

      const medications =
        medsResponse.data?.data || medsResponse.data || [];
      const allLogs =
        historyResponse.data?.history ||
        historyResponse.data?.data ||
        [];

      const todayDateStr = isoToDateStrInZone(new Date(), profileTimezone);

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayMidnight = todayStart.getTime();

      const todayLogs = allLogs.filter((log) => {
        const iso = log.scheduledFor || log.date;
        if (!iso) return false;
        return isoToDateStrInZone(iso, profileTimezone) === todayDateStr;
      });

      const logsByMedKey = new Map();

      const medKeyForLog = (log) => {
        const { id, name } = getLogMedicationIdentity(log);
        return id
          ? `id:${id}`
          : `name:${(name || "").trim().toLowerCase()}`;
      };

      todayLogs.forEach((log) => {
        const key = medKeyForLog(log);
        if (!logsByMedKey.has(key)) logsByMedKey.set(key, []);
        logsByMedKey.get(key).push(log);
      });

      logsByMedKey.forEach((arr) => {
        arr.sort(
          (a, b) =>
            new Date(a.scheduledFor || a.date) -
            new Date(b.scheduledFor || b.date)
        );
      });

      const nowMinutes = nowMinutesInZone(profileTimezone);

      const slots = [];

      medications.forEach((med) => {
        const times = toScheduleArray(med.scheduleTime);
        if (times.length === 0) return;

        if (med.startDate) {
          const ms = new Date(med.startDate);
          const msMid = new Date(
            ms.getFullYear(),
            ms.getMonth(),
            ms.getDate()
          ).getTime();
          if (msMid > todayMidnight) return;
        }

        if (med.endDate) {
          const me = new Date(med.endDate);
          const meMid = new Date(
            me.getFullYear(),
            me.getMonth(),
            me.getDate()
          ).getTime();
          if (meMid < todayMidnight) return;
        }

        const medId = med._id || med.id;
        const medName = med.name || "";

        const idKey = medId ? `id:${medId}` : null;
        const nameKey = `name:${medName.trim().toLowerCase()}`;

        const medLogs =
          (idKey && logsByMedKey.get(idKey)) ||
          logsByMedKey.get(nameKey) ||
          [];

        const sortedTimes = [...times].sort((a, b) => {
          const [ah, am] = a.split(":").map(Number);
          const [bh, bm] = b.split(":").map(Number);
          return ah * 60 + am - (bh * 60 + bm);
        });

        sortedTimes.forEach((timeStr, index) => {
          const [slotHH, slotMM] = timeStr.split(":").map(Number);
          const slotMinutes = slotHH * 60 + slotMM;
          const minutesPast = nowMinutes - slotMinutes;

          const matchingLog = medLogs[index] || null;

          let status;
          if (matchingLog?.status === "taken") {
            status = "taken";
          } else if (matchingLog?.status === "skipped") {
            status = "skipped";
          } else if (minutesPast < 0) {
            status = "upcoming";
          } else if (minutesPast <= 30) {
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