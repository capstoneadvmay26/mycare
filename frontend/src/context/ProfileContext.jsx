// src/context/ProfileContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useApp } from "./useApp";
import { getProfiles, createProfile } from "../services/api";

const ProfileContext = createContext();

// Palette for assigning visual colors to profiles
const PROFILE_COLORS = [
  "#0033CC", // brand blue
  "#2196F3", // light blue
  "#4CBB17", // green
  "#EC4899", // pink
  "#F7C81B", // yellow
  "#F97316", // orange
];

const initialOf = (name) => {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
};

// Normalize a backend profile to the shape our UI expects
const normalizeProfile = (p, index) => ({
  id: p.id || p._id,                              // real Mongo ObjectId
  name: p.name || "Unnamed",
  relationship: p.relationship || "Self",
  condition: p.condition || null,
  isSelf: p.relationship === "Self" || p.isSelf === true,
  isDependent: p.relationship !== "Self" && p.isSelf !== true,
  initial: initialOf(p.name),
  color: PROFILE_COLORS[index % PROFILE_COLORS.length],
});

export const ProfileProvider = ({ children }) => {
  const { isOnboarded } = useApp();

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
      const rawProfiles = response.data?.profiles || [];
      const normalized = rawProfiles.map(normalizeProfile);

      setProfiles(normalized);

      if (normalized.length > 0) {
        // Prefer: cached id → "Me" profile → first profile
        const cachedId = localStorage.getItem("mycare_currentProfileId");
        const cached = normalized.find((p) => p.id === cachedId);
        const selfProfile = normalized.find((p) => p.isSelf);
        const fallback = normalized[0];

        const nextActive = cached || selfProfile || fallback;
        setActiveProfile(nextActive);
        localStorage.setItem("mycare_currentProfileId", nextActive.id);
      } else {
        setActiveProfile(null);
      }
    } catch (err) {
      console.error("[ProfileContext] fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load profiles"
      );
    } finally {
      setLoading(false);
    }
  }, [isOnboarded]);

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
  // SWITCH ACTIVE PROFILE
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
  // ADD DEPENDENT (calls backend)
  // ============================================================
  const addDependent = async (newDep) => {
    try {
      const response = await createProfile({
        name: newDep.name,
        relationship: newDep.relationship,
        condition: newDep.condition || null,
      });
      await fetchProfiles();
      return response.data;
    } catch (err) {
      console.error("[ProfileContext] addDependent error:", err);
      throw err;
    }
  };

  // ============================================================
  // UPDATE PROFILE (local only for now)
  // ============================================================
  const updateActiveProfile = async (updatedData) => {
    if (!activeProfile) return;

    // ⚠️ TODO: wire to backend when `updateProfile` endpoint is ready.
    // For now, just update local state so UI reflects changes.

    setProfiles((prev) =>
      prev.map((p) =>
        p.id === activeProfile.id ? { ...p, ...updatedData } : p
      )
    );
    setActiveProfile((prev) => ({ ...prev, ...updatedData }));
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