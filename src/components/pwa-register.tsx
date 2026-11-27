/**
 * Registers the production service worker after hydration.
 * Skipped in dev so the worker cannot cache a stale Vite graph.
 */
import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!import.meta.env.PROD) return;
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* registration failure must not break the site */
    });
  }, []);

  return null;
}
