// app/contexts/LoadingContext.js
"use client";
import { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isPageTransitioning, setIsPageTransitioning] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");

  const startPageTransition = (label = "Loading...") => {
    setLoadingLabel(label);
    setIsPageTransitioning(true);
  };

  const stopPageTransition = () => {
    setIsPageTransitioning(false);
    setLoadingLabel("");
  };

  return (
    <LoadingContext.Provider value={{
      isPageTransitioning,
      loadingLabel,
      startPageTransition,
      stopPageTransition,
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
