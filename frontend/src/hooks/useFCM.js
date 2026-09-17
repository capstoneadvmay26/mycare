// src/hooks/useFCM.js
import { useEffect, useRef } from "react";
import { useApp } from "../context/useApp";
import { initializeFCM, onForegroundMessage } from "../services/fcm";

/**
 * Resolve the user's ID from multiple sources.
 * Priority:
 *   1. useApp().user (if hydrated)
 *   2. localStorage.mycare_user
 *   3. JWT payload in localStorage.mycare_token
 */
const resolveUserId = (userFromContext) => {
  // 1. From context
  if (userFromContext?.id) return userFromContext.id;
  if (userFromContext?._id) return userFromContext._id;

  // 2. From localStorage
  try {
    const stored = JSON.parse(localStorage.getItem("mycare_user") || "null");
    if (stored?.id) return stored.id;
    if (stored?._id) return stored._id;
  } catch (err) {
    console.warn("[useFCM] Could not parse mycare_user:", err.message);
  }

  // 3. From JWT payload
  try {
    const token = localStorage.getItem("mycare_token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.id || payload.userId || payload.sub || payload._id || null;
    }
  } catch (err) {
    console.warn("[useFCM] Could not decode token:", err.message);
  }

  return null;
};

export const useFCM = () => {
  const { isOnboarded, user } = useApp();
  const initializedRef = useRef(false);

  const userId = resolveUserId(user);

  // ----------------------------------------
  // Init FCM once we have a userId
  // ----------------------------------------
  useEffect(() => {
    console.log("[useFCM] Effect triggered:", {
      isOnboarded,
      userId,
      userFromContext: user,
      alreadyInit: initializedRef.current,
    });

    if (!isOnboarded) {
      console.log("[useFCM] Not onboarded — skipping");
      return;
    }

    if (!userId) {
      console.warn("[useFCM] No user ID — skipping FCM init");
      return;
    }

    if (initializedRef.current) {
      console.log("[useFCM] Already initialized — skipping");
      return;
    }

    initializedRef.current = true;

    let cancelled = false;

    const init = async () => {
      try {
        console.log("[useFCM] Calling initializeFCM()...");
        const token = await initializeFCM();
        if (!cancelled) {
          console.log(
            "[useFCM] FCM ready. Token:",
            token ? token.slice(0, 20) + "..." : "none (blocked or failed)"
          );
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[useFCM] Init failed:", err.message);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [isOnboarded, userId, user]);

  // ----------------------------------------
  // Foreground push handler
  // ----------------------------------------
  useEffect(() => {
    if (!isOnboarded) return;

    let unsubscribe = null;
    let cancelled = false;

    const setup = async () => {
      const unsub = await onForegroundMessage((payload) => {
        if (cancelled) return;
        console.log("[useFCM] Foreground push:", payload);

        if (Notification.permission === "granted") {
          const title = payload.notification?.title || "MyCare Reminder";
          const body = payload.notification?.body || "You have a medication due";
          try {
            new Notification(title, {
              body,
              icon: "/mycare/icons.svg",
              tag: payload.data?.doseId || "mycare-fg",
            });
          } catch (err) {
            console.warn("[useFCM] Notification failed:", err.message);
          }
        }

        window.dispatchEvent(
          new CustomEvent("mycare:fcm-foreground", { detail: payload })
        );
      });

      if (!cancelled) unsubscribe = unsub;
    };

    setup();

    return () => {
      cancelled = true;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [isOnboarded]);
};

export default useFCM;