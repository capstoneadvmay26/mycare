// src/hooks/useFCM.js
import { useEffect, useRef } from "react";
import { useApp } from "../context/useApp";
import {
  initializeFCM,
  onForegroundMessage,
  getCachedFCMToken,
} from "../services/fcm";

/**
 * Mount once in AppContent. Handles:
 *   - Requesting permission
 *   - Registering the service worker
 *   - Fetching FCM token
 *   - Registering token with backend
 *   - Handling foreground push messages
 */
export const useFCM = () => {
  const { isOnboarded, user } = useApp();
  const initializedRef = useRef(false);

  // ----------------------------------------
  // Init on onboarded
  // ----------------------------------------
  useEffect(() => {
    if (!isOnboarded) return;
    if (!user?.id) return;
    if (initializedRef.current) return;

    // Skip if we already have a token in localStorage
    const cached = getCachedFCMToken();
    if (cached) {
      console.log("[useFCM] Cached token found, skipping init");
      initializedRef.current = true;
      return;
    }

    initializedRef.current = true;
    let cancelled = false;

    const init = async () => {
      try {
        console.log("[useFCM] Initializing FCM...");
        await initializeFCM();
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
    
  }, [isOnboarded, user?.id]);

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

        // Show a browser notification even in the foreground
        if (Notification.permission === "granted") {
          const title = payload.notification?.title || "MyCare Reminder";
          const body =
            payload.notification?.body || "You have a medication due";

          try {
            new Notification(title, {
              body,
              icon: "/mycare/icons.svg",
              tag: payload.data?.doseId || "mycare-fg",
            });
          } catch (err) {
            console.warn("[useFCM] Failed to show notification:", err.message);
          }
        }

        // Broadcast for other components (e.g., refresh schedule)
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