"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#FF5FA2", "#8B5CF6", "#FFC85C", "#FFD1E4", "#6D28D9"];

export function Confetti() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
      piece.style.animationDuration = 2.5 + Math.random() * 2 + "s";
      piece.style.animationDelay = Math.random() * 0.6 + "s";
      piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      layer.appendChild(piece);
    }

    const timeout = setTimeout(() => {
      if (layer) layer.innerHTML = "";
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return <div ref={layerRef} className="confetti-layer" aria-hidden="true" />;
}
