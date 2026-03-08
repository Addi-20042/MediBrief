import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const bootstrap = async () => {
  // Important: clear stale service workers/caches in development BEFORE rendering.
  // This avoids mixed old/new Vite chunks that can cause duplicate React runtime errors.
  if (import.meta.env.DEV && "serviceWorker" in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    } catch {
      // no-op
    }
  }

  createRoot(document.getElementById("root")!).render(<App />);
};

void bootstrap();
