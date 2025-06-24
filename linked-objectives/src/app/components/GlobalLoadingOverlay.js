// app/components/GlobalLoadingOverlay.js
"use client";
import { useLoading } from "@/app/contexts/LoadingContext";

export default function GlobalLoadingOverlay() {
  const { isRouteLoading, loadingLabel } = useLoading();

  if (!isRouteLoading) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-white/40 backdrop-blur-sm flex flex-col items-center justify-center text-gray-700 transition-opacity duration-300">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
      <p className="text-sm font-medium">{loadingLabel}</p>
    </div>
  );
}
