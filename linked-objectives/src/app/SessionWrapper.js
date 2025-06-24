// app/SessionWrapper.js
"use client";

import { SessionProvider } from "next-auth/react";
import { LoadingProvider } from "@/app/contexts/LoadingContext";

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </SessionProvider>
  );
}