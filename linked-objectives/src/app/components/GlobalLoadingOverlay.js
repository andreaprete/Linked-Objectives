"use client";
import { useLoading } from "@/app/contexts/LoadingContext";
import "@/app/styles/GlobalLoadingOverlay.css";

export default function GlobalLoadingOverlay() {
  const { isPageTransitioning, loadingLabel } = useLoading();

  if (!isPageTransitioning) return null;

  return (
    <div className="route-blur-overlay">
      <div className="loading-spinner" />
      <p>{loadingLabel}</p>
    </div>
  );
}