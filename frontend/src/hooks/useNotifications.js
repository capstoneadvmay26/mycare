// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useMemo } from "react";
import { useProfile } from "../context/ProfileContext";
import { getSymptomHistory } from "../services/api";
import { useTodaySchedule } from "./useTodaySchedule";

/**
 * Compute in-app notifications from medication + symptom state.
 * No backend needed — all derived from existing data.
 */
export const useNotifications = () => {
  const { activeProfile } = useProfile();
  const profileId = activeProfile?.id || activeProfile?._id;

  // Reuse the schedule hook for meds
  const { dueNow = [], upcoming = [] } = useTodaySchedule(profileId);

  const [symptomNotifications, setSymptomNotifications] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);

  // ------------------------------------------------------------
  // Fetch symptoms to check for check-ins due
  // ------------------------------------------------------------
  const fetchSymptoms = useCallback(async () => {
    if (!profileId) {
      setSymptomNotifications([]);
      return;
    }

    setLoadingSymptoms(true);
    try {
      const resp = await getSymptomHistory(profileId);
      const allSymptoms = resp.data?.symptoms || [];

      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const now = Date.now();
      const notifications = [];

      // Check each symptom for a due check-in
      for (const symptom of allSymptoms) {
        const checkIns = symptom.checkIns?.length || 0;
        if (checkIns >= 3) continue; // cycle complete

        // Determine when the next check-in is available
        let lastAt;
        if (checkIns === 0) {
          lastAt = new Date(symptom.loggedAt).getTime();
        } else {
          const lastCheckIn = symptom.checkIns[checkIns - 1];
          lastAt = new Date(lastCheckIn.checkedInAt).getTime();
        }

        const elapsed = now - lastAt;
        if (elapsed >= ONE_DAY_MS) {
          // Check-in is available
          const symptomLabel = symptom.symptoms?.length
            ? symptom.symptoms.join(", ")
            : symptom.otherSymptom || "symptom";

          notifications.push({
            id: `checkin-${symptom._id}`,
            type: "check-in-due",
            title: `How's your ${symptomLabel} today?`,
            body: `Check-in Day ${checkIns + 1} of 3`,
            createdAt: new Date(lastAt + ONE_DAY_MS),
            // 🆕 Pre-computed
            relativeTime: computeRelative(new Date(lastAt + ONE_DAY_MS)),
            symptomId: symptom._id,
            actionTarget: { tab: "CheckIn", symptomId: symptom._id },
            read: false,
          });
        }
      }

      setSymptomNotifications(notifications);
    } catch (err) {
      console.warn("[useNotifications] symptom fetch error:", err.message);
      setSymptomNotifications([]);
    } finally {
      setLoadingSymptoms(false);
    }
  }, [profileId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (cancelled) return;
      await fetchSymptoms();
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchSymptoms]);

  // ------------------------------------------------------------
  // Compute medication notifications
  // ------------------------------------------------------------
  const medicationNotifications = useMemo(() => {
    const now = new Date();
    const nowMs = now.getTime();
    const notifs = [];

    // ... existing dueNow loop ...
    dueNow.forEach((dose) => {
      const scheduledMs = dose.scheduledFor?.getTime?.() || nowMs;
      const minutesLate = Math.max(
        0,
        Math.floor((nowMs - scheduledMs) / 60000),
      );

      let type = "due-now";
      let title = `Time for ${dose.name}`;
      let body = `Scheduled for ${formatTime(dose.time)}`;

      if (minutesLate >= 30) {
        type = "missed";
        title = `⚠️ Missed ${dose.name}`;
        body = `${minutesLate} min past schedule`;
      }

      notifs.push({
        id: `dose-${dose.id}`,
        type,
        title,
        body,
        createdAt: dose.scheduledFor || new Date(),
        // 🆕 Pre-computed relative time
        relativeTime: minutesLate < 1 ? "Just now" : `${minutesLate}m ago`,
        doseId: dose.id,
        medicationId: dose.medicationId,
        actionTarget: { tab: "Home", doseId: dose.id },
        read: false,
      });
    });

    // ... existing upcoming loop ...
    upcoming.forEach((dose) => {
      const scheduledMs = dose.scheduledFor?.getTime?.();
      if (!scheduledMs) return;

      const minutesUntil = Math.floor((scheduledMs - nowMs) / 60000);
      if (minutesUntil <= 30 && minutesUntil > 0) {
        notifs.push({
          id: `upcoming-${dose.id}`,
          type: "upcoming",
          title: `Coming up: ${dose.name}`,
          body: `In ${minutesUntil} min`,
          createdAt: new Date(),
          // 🆕 Pre-computed
          relativeTime: "Just now",
          doseId: dose.id,
          medicationId: dose.medicationId,
          actionTarget: { tab: "Home", doseId: dose.id },
          read: false,
        });
      }
    });

    return notifs.sort((a, b) => b.createdAt - a.createdAt);
  }, [dueNow, upcoming]);

  // ------------------------------------------------------------
  // Combine + sort
  // ------------------------------------------------------------
  const notifications = useMemo(() => {
    return [...medicationNotifications, ...symptomNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [medicationNotifications, symptomNotifications]);

  return {
    notifications,
    unreadCount: notifications.length,
    loading: loadingSymptoms,
    refresh: fetchSymptoms,
  };
};

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
const formatTime = (time24) => {
  if (!time24) return "";
  const [hh, mm] = time24.split(":").map(Number);
  const period = hh >= 12 ? "pm" : "am";
  const h = hh % 12 === 0 ? 12 : hh % 12;
  return `${h}:${String(mm).padStart(2, "0")}${period}`;
};

// 🆕 Compute relative time string — safe because it runs outside render
const computeRelative = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
