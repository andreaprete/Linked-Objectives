// app/contexts/LoadingContext.js
"use client";
import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isRouteLoading, setIsRouteLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(""); // 🆕

  const startLoading = (label = "Loading...") => {
    setLoadingLabel(label);
    setIsRouteLoading(true);
  };

  const stopLoading = () => {
    setIsRouteLoading(false);
    setLoadingLabel("");
  };

  return (
    <LoadingContext.Provider value={{ isRouteLoading, loadingLabel, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
