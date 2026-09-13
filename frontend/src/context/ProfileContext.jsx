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

const normalizeProfile = (p, index) => ({
  id: p.id || p._id,
  name: p.name || "Unnamed",
  relationship: p.relationship || "Self",
  condition: p.condition || null,
  isSelf: p.relationship === "Self" || p.isSelf === true,
  isDependent: p.relationship !== "Self" && p.isSelf !== true,
  initial: initialOf(p.name),
  color: PROFILE_COLORS[index % PROFILE_COLORS.length],
});

export const ProfileProvider = ({ children }) => {
  const { isOnboarded, userName } = useApp();

  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // FETCH PROFILES FROM BACKEND (with auto-bootstrap)
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
      console.log("[ProfileContext] GET /profiles →", response.data);

      // Handle all possible response shapes
      const rawProfiles =
        response.data?.profiles ||
        response.data?.data ||
        [];

      console.log("[ProfileContext] Found", rawProfiles.length, "profiles");

      // ============================================================
      // 🆕 AUTO-BOOTSTRAP: create a "Me" profile if user has none
      // ============================================================
      if (rawProfiles.length === 0) {
        console.warn(
          "[ProfileContext] No profiles found — bootstrapping 'Me'..."
        );
        try {
          const createResponse = await createProfile({
            name: userName || "Me",
            relationship: "Self",
          });

          const newProfile =
            createResponse.data?.data ||
            createResponse.data?.profile ||
            createResponse.data;

          console.log(
            "[ProfileContext] Auto-created profile:",
            newProfile
          );

          // Refetch to get the canonical list
          const retry = await getProfiles();
          const retryProfiles =
            retry.data?.profiles ||
            retry.data?.data ||
            [];

          const normalized = retryProfiles.map(normalizeProfile);
          setProfiles(normalized);

          if (normalized.length > 0) {
            const active = normalized[0];
            setActiveProfile(active);
            localStorage.setItem("mycare_currentProfileId", active.id);
          }

          setLoading(false);
          return;
        } catch (createErr) {
          console.error(
            "[ProfileContext] Auto-bootstrap failed:",
            createErr
          );

          // If it says "already exists", refetch to get the real profile
          const msg = createErr.response?.data?.message?.toLowerCase() || "";
          if (msg.includes("already exists")) {
            const retry = await getProfiles();
            const retryProfiles =
              retry.data?.profiles ||
              retry.data?.data ||
              [];

            const normalized = retryProfiles.map(normalizeProfile);
            setProfiles(normalized);

            if (normalized.length > 0) {
              const active = normalized[0];
              setActiveProfile(active);
              localStorage.setItem("mycare_currentProfileId", active.id);
            }

            setLoading(false);
            return;
          }

          setError(
            createErr.response?.data?.message ||
              "Failed to create your profile. Please reload."
          );
          setLoading(false);
          return;
        }
      }

      // ============================================================
      // NORMAL PATH — we have profiles
      // ============================================================
      const normalized = rawProfiles.map(normalizeProfile);
      setProfiles(normalized);

      // Pick active: cached → "Self" profile → first
      const cachedId = localStorage.getItem("mycare_currentProfileId");
      const cached = normalized.find((p) => p.id === cachedId);
      const selfProfile = normalized.find((p) => p.isSelf);
      const fallback = normalized[0];

      const nextActive = cached || selfProfile || fallback;
      setActiveProfile(nextActive);
      localStorage.setItem("mycare_currentProfileId", nextActive.id);

      console.log(
        "[ProfileContext] Active profile set:",
        nextActive.name,
        nextActive.id
      );
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
  // ADD DEPENDENT
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
  // UPDATE PROFILE (local only)
  // ============================================================
  const updateActiveProfile = async (updatedData) => {
    if (!activeProfile) return;

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