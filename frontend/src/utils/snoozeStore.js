// src/utils/snoozeStore.js

const STORAGE_KEY = "mycare_snoozed_doses";

/**
 * Read the full snooze map from localStorage.
 * Format: { [logId]: { until: ISO string, minutes: number, snoozedAt: ISO string } }
 */
export const getSnoozedDoses = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed;
  } catch (err) {
    console.error("[snoozeStore] Read error:", err);
    return {};
  }
};

/**
 * Save the snooze map to localStorage.
 */
const saveSnoozedDoses = (map) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error("[snoozeStore] Write error:", err);
  }
};

/**
 * Add a snooze entry for a specific dose.
 * @param {string} logId - The medication log _id
 * @param {number} minutes - Snooze duration in minutes
 */
export const snoozeDose = (logId, minutes) => {
  if (!logId) return;

  const now = new Date();
  const until = new Date(now.getTime() + minutes * 60 * 1000);

  const map = getSnoozedDoses();
  map[logId] = {
    until: until.toISOString(),
    minutes,
    snoozedAt: now.toISOString(),
  };
  saveSnoozedDoses(map);
};

/**
 * Remove a snooze entry (e.g. after user marks taken or skips).
 */
export const clearSnooze = (logId) => {
  if (!logId) return;
  const map = getSnoozedDoses();
  delete map[logId];
  saveSnoozedDoses(map);
};

/**
 * Check if a specific dose is currently snoozed.
 * Returns { isSnoozed: boolean, until?: Date, minutes?: number }
 */
export const getSnoozeState = (logId) => {
  if (!logId) return { isSnoozed: false };

  const map = getSnoozedDoses();
  const entry = map[logId];
  if (!entry) return { isSnoozed: false };

  const until = new Date(entry.until);
  if (until <= new Date()) {
    // Expired — clean up
    delete map[logId];
    saveSnoozedDoses(map);
    return { isSnoozed: false };
  }

  return {
    isSnoozed: true,
    until,
    minutes: entry.minutes,
  };
};

/**
 * Remove all expired snoozes (housekeeping).
 */
export const clearExpiredSnoozes = () => {
  const map = getSnoozedDoses();
  const now = new Date();
  let changed = false;

  Object.keys(map).forEach((logId) => {
    const entry = map[logId];
    if (!entry || !entry.until) {
      delete map[logId];
      changed = true;
      return;
    }
    if (new Date(entry.until) <= now) {
      delete map[logId];
      changed = true;
    }
  });

  if (changed) saveSnoozedDoses(map);
};