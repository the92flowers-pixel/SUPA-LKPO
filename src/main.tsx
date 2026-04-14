import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import App from "./App";
import "./globals.css";

const LoadingFallback = () => (
  <div className="min-h-screen bg-[#050505] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-red-700 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Завантаження...</p>
    </div>
  </div>
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found. Please check index.html");
}

const root = createRoot(rootElement);

root.render(
  <Suspense fallback={<LoadingFallback />}>
    <App />
  </Suspense>
);

// Global error handler for production
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled rejection:", event.reason);
});