// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// Handles background push notifications (app closed or in background)

/* eslint-disable no-undef */

// Import Firebase scripts (compat versions work in service workers)
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// ------------------------------------------------------------
// Firebase config
// NOTE: This is PUBLIC info (safe to hardcode in client code).
// Service workers cannot read import.meta.env.
// ------------------------------------------------------------
firebase.initializeApp({
  apiKey: "AIzaSyB9xSPMxWY_172d1aVS5QYOPBFGSbvFQns",
  authDomain: "my-care-app-project.firebaseapp.com",
  projectId: "my-care-app-project",
  storageBucket: "my-care-app-project.firebasestorage.app",
  messagingSenderId: "22234207428",
  appId: "1:22234207428:web:5e4a4c9df0cb0c5cb26591",
});

const messaging = firebase.messaging();

// ------------------------------------------------------------
// Background message handler
// ------------------------------------------------------------
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw] Background message:",
    JSON.stringify(payload, null, 2)
  );

  const title = payload.notification?.title || "MyCare Reminder";
  const body = payload.notification?.body || "You have a medication due";

  const options = {
    body,
    icon: "/mycare/icons.svg",
    badge: "/mycare/icons.svg",
    tag: payload.data?.doseId || "mycare-reminder",
    requireInteraction: true,
    data: payload.data || {},
    actions: [
      { action: "taken", title: "✓ Taken" },
      { action: "snooze", title: "⏰ Snooze" },
      { action: "skip", title: "✕ Skip" },
    ],
  };

  return self.registration.showNotification(title, options);
});

// ------------------------------------------------------------
// Notification click → open/focus app at the right route
// ------------------------------------------------------------
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action; // "taken" | "snooze" | "skip" | ""
  const data = event.notification.data || {};
  const doseId = data.doseId || "";
  const profileId = data.profileId || "";

  let url = "/mycare/";
  const params = new URLSearchParams();
  if (action) params.set("action", action);
  if (doseId) params.set("doseId", doseId);
  if (profileId) params.set("profileId", profileId);
  if (params.toString()) url += `?${params.toString()}`;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      // If a window is already open, focus it
      for (const client of list) {
        if (client.url.includes("/mycare/") && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ------------------------------------------------------------
// Activate handler — claim clients on new SW install
// ------------------------------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});