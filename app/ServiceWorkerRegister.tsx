"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const cleanupAndRegister = async () => {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          await registration.unregister();
        }

        if ("caches" in window) {
          const cacheNames = await caches.keys();

          await Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName))
          );
        }

        const registration = await navigator.serviceWorker.register(
          "/bright-future-sw-v2.js",
          {
            scope: "/",
            updateViaCache: "none",
          }
        );

        await registration.update();
      } catch (error) {
        console.error("Service Worker cleanup failed:", error);
      }
    };

    cleanupAndRegister();
  }, []);

  return null;
}