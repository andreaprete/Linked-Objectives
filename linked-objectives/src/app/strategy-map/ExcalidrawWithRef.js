"use client";

import React from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

export default function ExcalidrawWithRef({ onApiReady, ...props }) {
  return (
    <Excalidraw
      UIOptions={{ canvasActions: { toggleTheme: false } }}
      autoFocus={false}
      {...props}
      excalidrawAPI={(api) => {
        if (onApiReady && typeof onApiReady === "function") {
          onApiReady(api);
        }
      }}
    />
  );
}
