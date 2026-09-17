// src/services/fcm.js
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { getFirebaseMessaging, VAPID_KEY } from "./firebase";
import { registerFCMToken, unregisterFCMToken } from "./api";

const STORAGE_KEY = "mycare_fcm_token";
const SW_PATH = "/mycare/firebase-messaging-sw.js";
const SW_SCOPE = "/mycare/";

// ------------------------------------------------------------
// Request notification permission from the browser
// ------------------------------------------------------------
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("[FCM] Notification API not supported");
    return "unsupported";
  }

  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";

  try {
    const result = await Notification.requestPermission();
    console.log("[FCM] Permission result:", result);
    return result;
  } catch (err) {
    console.error("[FCM] Permission request failed:", err);
    return "error";
  }
};

// ------------------------------------------------------------
// Register the Firebase Messaging service worker
// ------------------------------------------------------------
const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("[FCM] Service Worker not supported");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: SW_SCOPE,
    });
    console.log("[FCM] Service Worker registered:", registration.scope);
    return registration;
  } catch (err) {
    console.error("[FCM] Service Worker registration failed:", err);
    return null;
  }
};

// ------------------------------------------------------------
// Send token to backend (uses Bearer token, no profileId)
// ------------------------------------------------------------
const sendTokenToBackend = async (token) => {
  try {
    await registerFCMToken(token);
    console.log("[FCM] ✅ Token registered on backend");
  } catch (err) {
    console.warn(
      "[FCM] ⚠️ Backend token registration failed (may not be live yet):",
      err.response?.status || err.message
    );
  }
};

// ------------------------------------------------------------
// Full init: permission → SW → token → backend
// ------------------------------------------------------------
export const initializeFCM = async () => {
  // 1. Permission
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("[FCM] Permission not granted, skipping token fetch");
    return null;
  }

  // 2. Service worker
  const registration = await registerServiceWorker();
  if (!registration) {
    console.warn("[FCM] No service worker — cannot fetch token");
    return null;
  }

  // 3. Messaging instance
  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn("[FCM] Messaging not available");
    return null;
  }

  // 4. FCM token
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("[FCM] No FCM token available");
      return null;
    }

    console.log("[FCM] Token acquired:", token.slice(0, 30) + "...");

    // 5. Cache locally
    localStorage.setItem(STORAGE_KEY, token);

    // 6. Register with backend
    await sendTokenToBackend(token);

    return token;
  } catch (err) {
    console.error("[FCM] Failed to get token:", err);
    return null;
  }
};

// ------------------------------------------------------------
// Foreground message handler
// ------------------------------------------------------------
export const onForegroundMessage = async (callback) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message:", payload);
    callback(payload);
  });
};

// ------------------------------------------------------------
// Clear token on logout
// ------------------------------------------------------------
export const clearFCMToken = async () => {
  const token = localStorage.getItem(STORAGE_KEY);
  if (!token) return;

  try {
    const messaging = await getFirebaseMessaging();
    if (messaging) {
      await deleteToken(messaging);
      console.log("[FCM] Token deleted locally");
    }
  } catch (err) {
    console.warn("[FCM] Error deleting token:", err.message);
  }

  try {
    await unregisterFCMToken(token);
  } catch (err) {
    console.warn(
      "[FCM] Backend token removal failed (may not be live yet):",
      err.response?.status || err.message
    );
  }

  localStorage.removeItem(STORAGE_KEY);
};

// ------------------------------------------------------------
// Get cached token
// ------------------------------------------------------------
export const getCachedFCMToken = () => localStorage.getItem(STORAGE_KEY);