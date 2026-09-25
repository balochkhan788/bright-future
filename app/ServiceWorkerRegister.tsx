"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registrations =
          await navigator.serviceWorker.getRegistrations();

        for (const registration of registrations) {
          await registration.unregister();
        }

        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );

        await navigator.serviceWorker.register(
          "/bright-future-sw-v3.js",
          {
            scope: "/",
            updateViaCache: "none",
          }
        );
      } catch (error) {
        console.error("Service Worker update failed:", error);
      }
    };

    register();
  }, []);

  return null;
}