// src/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

// ------------------------------------------------------------
// Firebase configuration from environment variables
// ------------------------------------------------------------
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// ------------------------------------------------------------
// Singleton Firebase app instance
// ------------------------------------------------------------
let app = null;
let messaging = null;

export const getFirebaseApp = () => {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
};

// ------------------------------------------------------------
// Firebase Messaging (browser-only, async)
// ------------------------------------------------------------
export const getFirebaseMessaging = async () => {
  if (messaging) return messaging;

  const supported = await isSupported();
  if (!supported) {
    console.warn("[Firebase] Messaging is not supported in this browser");
    return null;
  }

  try {
    const firebaseApp = getFirebaseApp();
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch (err) {
    console.error("[Firebase] Failed to initialize messaging:", err);
    return null;
  }
};

export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;