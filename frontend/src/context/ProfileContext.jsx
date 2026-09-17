// src/context/ProfileContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useApp } from "./useApp";
//import { getProfiles, createProfile, updateProfile } from "../services/api";

import { getProfiles, createProfile, updateProfile, deleteProfile as deleteProfileApi } from "../services/api";

const ProfileContext = createContext();

const PROFILE_COLORS = [
  "#0033CC",
  "#2196F3",
  "#4CBB17",
  "#EC4899",
  "#F7C81B",
  "#F97316",
];

const initialOf = (name) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

const normalizeProfile = (p, index) => {
  const profileId = p.id || p._id;
  const cachedAvatar = localStorage.getItem(`mycare_avatar_${profileId}`);
  return {
    id: profileId,
    name: p.name || "Unnamed",
    relationship: p.relationship || "Self",
    condition: p.condition || null,
    isSelf: p.relationship === "Self" || p.isSelf === true,
    isDependent: p.relationship !== "Self" && p.isSelf !== true,
    initial: initialOf(p.name),
    color: PROFILE_COLORS[index % PROFILE_COLORS.length],
    avatarUrl: cachedAvatar || p.avatarUrl || null,
    avatarPublicId: p.avatarPublicId || null,
    dateOfBirth: p.dateOfBirth || null,
    gender: p.gender || null,
    timezone: p.timezone || "UTC",   // NEW
  };
};

export const ProfileProvider = ({ children }) => {
  const { isOnboarded, userName } = useApp();

  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH PROFILES FROM BACKEND
  // ============================================================
  const fetchProfiles = useCallback(async () => {
    if (!isOnboarded) {
      setProfiles([]);
      setActiveProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getProfiles();
      let rawProfiles = response.data?.profiles || response.data?.data || [];

      console.log("[ProfileContext] GET /profiles →", rawProfiles.length);

      // ============================================================
      // AUTO-BOOTSTRAP: create a "Me" profile if user has none
      // ============================================================
      if (rawProfiles.length === 0) {
        console.warn(
          "[ProfileContext] No profiles found — bootstrapping 'Me'...",
        );

        try {
          const profileName = userName && userName.trim().length >= 2 ? userName.trim() : "Me";
          const userTimezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          await createProfile({
            name: profileName,
            relationship: "Self",
            timezone: userTimezone, // 🆕
          });

          // Refetch to get the canonical list
          const retry = await getProfiles();
          rawProfiles = retry.data?.profiles || retry.data?.data || [];
        } catch (createErr) {
          const msg = createErr.response?.data?.message?.toLowerCase() || "";
          if (msg.includes("already exists")) {
            // Race — refetch
            const retry = await getProfiles();
            rawProfiles = retry.data?.profiles || retry.data?.data || [];
          } else {
            throw createErr;
          }
        }
      }

      // ============================================================
      // SELF-HEAL: rename "Me" placeholder profile to user's real name
      // ============================================================
      const selfProfile = rawProfiles.find(
        (p) => p.relationship === "Self" || p.isSelf === true,
      );

      if (
        selfProfile &&
        selfProfile.name === "Me" &&
        userName &&
        userName.trim().length >= 2 &&
        userName.trim() !== "Me"
      ) {
        try {
          const profileId = selfProfile.id || selfProfile._id;
          await updateProfile(profileId, { name: userName.trim() });
          console.log(
            "[ProfileContext] Auto-renamed 'Me' profile to:",
            userName,
          );

          // Refetch to get the updated name
          const refreshed = await getProfiles();
          rawProfiles = refreshed.data?.profiles || refreshed.data?.data || [];
        } catch (renameErr) {
          console.warn(
            "[ProfileContext] Could not rename 'Me' profile:",
            renameErr.response?.data?.message || renameErr.message,
          );
          // Continue with the un-renamed profile — UI handles the display
        }
      }

      // ============================================================
      // NORMAL PATH
      // ============================================================
      const normalized = rawProfiles.map(normalizeProfile);
      setProfiles(normalized);

      if (normalized.length > 0) {
        // Pick active: cached → "Self" → first
        const cachedId = localStorage.getItem("mycare_currentProfileId");
        const cached = normalized.find((p) => p.id === cachedId);
        const self = normalized.find((p) => p.isSelf);
        const fallback = normalized[0];

        const nextActive = cached || self || fallback;
        setActiveProfile(nextActive);
        localStorage.setItem("mycare_currentProfileId", nextActive.id);
      } else {
        setActiveProfile(null);
      }
    } catch (err) {
      console.error("[ProfileContext] fetch error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load profiles",
      );
    } finally {
      setLoading(false);
    }
  }, [isOnboarded, userName]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (cancelled) return;
      await fetchProfiles();
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fetchProfiles]);

  // ============================================================
  // SWITCH PROFILE
  // ============================================================
  const switchProfile = (id) => {
    const next = profiles.find((p) => p.id === id);
    if (!next) {
      console.warn("[ProfileContext] switchProfile: id not found", id);
      return;
    }
    setActiveProfile(next);
    localStorage.setItem("mycare_currentProfileId", next.id);
  };

  // ============================================================
  // ADD DEPENDENT
  // ============================================================
const addDependent = async (newDep) => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  const response = await createProfile({
    name: newDep.name,
    relationship: newDep.relationship,
    condition: newDep.condition || null,
    timezone: userTimezone,   // 🆕
  });
  await fetchProfiles();
  return response.data;
};


  // ============================================================
  // DELETE PROFILE (dependent only — self cannot be deleted)
  // ============================================================
  const deleteProfile = async (profileId) => {
    if (!profileId) {
      throw new Error("Profile ID is required");
    }

    // Guard: never delete the self profile
    const target = profiles.find((p) => p.id === profileId);
    if (target?.isSelf) {
      throw new Error("You cannot delete your own profile.");
    }

    // Optimistic update: remove from list
    const previousProfiles = profiles;
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));

    // If the deleted profile was active, switch to self (or first)
    if (activeProfile?.id === profileId) {
      const fallback =
        previousProfiles.find((p) => p.isSelf) ||
        previousProfiles.find((p) => p.id !== profileId);
      if (fallback) {
        setActiveProfile(fallback);
        localStorage.setItem("mycare_currentProfileId", fallback.id);
      }
    }

    try {
      await deleteProfileApi(profileId);
      // Refetch to be safe
      await fetchProfiles();
    } catch (err) {
      // Rollback on failure
      setProfiles(previousProfiles);
      console.error("[ProfileContext] delete error:", err);
      throw err;
    }
  };
  // ============================================================
  // UPDATE ACTIVE PROFILE
  // ============================================================
  const updateActiveProfile = async (updatedData) => {
    if (!activeProfile) return;
    const id = activeProfile.id || activeProfile._id;

    // 🆕 Persist avatar locally as fallback
    if (updatedData.avatarUrl) {
      localStorage.setItem(`mycare_avatar_${id}`, updatedData.avatarUrl);
    }

    // Optimistic local update
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
    );
    setActiveProfile((prev) => ({ ...prev, ...updatedData }));

    // Attempt backend sync
    try {
      await updateProfile(id, updatedData);
      const refreshed = await getProfiles();
      const refreshedProfiles =
        refreshed.data?.profiles || refreshed.data?.data || [];
      const normalized = refreshedProfiles.map(normalizeProfile);
      setProfiles(normalized);
      const stillActive = normalized.find((p) => p.id === id);
      if (stillActive) setActiveProfile(stillActive);
    } catch (err) {
      console.warn(
        "[ProfileContext] Backend update partial:",
        err.response?.data?.message || err.message,
      );
    }
  };

    return (
    <ProfileContext.Provider
      value={{
        profiles,
        activeProfile,
        loading,
        error,
        switchProfile,
        updateActiveProfile,
        addDependent,
        deleteProfile,        // ← NEW
        refreshProfiles: fetchProfiles,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
