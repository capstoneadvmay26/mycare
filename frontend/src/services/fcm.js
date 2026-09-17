// src/services/fcm.js
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { getFirebaseMessaging, VAPID_KEY } from "./firebase";
import { registerFCMToken, unregisterFCMToken } from "./api";

const STORAGE_KEY = "mycare_fcm_token";
const SW_PATH = "/mycare/firebase-messaging-sw.js";
const SW_SCOPE = "/mycare/";

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

const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.warn("[FCM] Service Worker not supported");
    return null;
  }

  try {
    // Check existing registration first
    const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (existing) {
      console.log("[FCM] SW already registered:", existing.scope);
      await navigator.serviceWorker.ready;
      return existing;
    }

    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: SW_SCOPE,
    });
    console.log("[FCM] SW registered:", registration.scope);

    // Wait for it to be active
    await navigator.serviceWorker.ready;

    return registration;
  } catch (err) {
    console.error("[FCM] SW registration failed:", err);
    return null;
  }
};

const sendTokenToBackend = async (token) => {
  try {
    const res = await registerFCMToken(token);
    console.log("[FCM] ✅ Token registered on backend:", res?.data);
    return true;
  } catch (err) {
    console.warn(
      "[FCM] ⚠️ Backend token registration failed:",
      err.response?.status || err.message
    );
    return false;
  }
};

export const initializeFCM = async () => {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    console.warn("[FCM] Permission not granted:", permission);
    return null;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    console.warn("[FCM] No service worker — cannot fetch token");
    return null;
  }

  const messaging = await getFirebaseMessaging();
  if (!messaging) {
    console.warn("[FCM] Messaging not available");
    return null;
  }

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
    localStorage.setItem(STORAGE_KEY, token);
    await sendTokenToBackend(token);

    return token;
  } catch (err) {
    console.error("[FCM] Failed to get token:", err);
    return null;
  }
};

export const onForegroundMessage = async (callback) => {
  const messaging = await getFirebaseMessaging();
  if (!messaging) return null;

  return onMessage(messaging, (payload) => {
    console.log("[FCM] Foreground message:", payload);
    callback(payload);
  });
};

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
      "[FCM] Backend token removal failed:",
      err.response?.status || err.message
    );
  }

  localStorage.removeItem(STORAGE_KEY);
};

export const getCachedFCMToken = () => localStorage.getItem(STORAGE_KEY);