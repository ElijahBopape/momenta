"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled root error", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", background: "#FFFBF6", color: "#2A1145" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "0 0 0.5rem" }}>Something went wrong</h1>
          <p style={{ color: "#6B5A86", margin: "0 0 1rem" }}>Try reloading the page.</p>
          <button
            onClick={() => reset()}
            style={{
              background: "#6D28D9",
              color: "#fff",
              border: "none",
              borderRadius: "999px",
              padding: "0.6rem 1.5rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
