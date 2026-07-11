import { ImageResponse } from "next/og";

export const alt = "momenta — every great date starts with one good moment";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2A1145 0%, #6D28D9 55%, #FF5FA2 100%)",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 100 100">
          <circle cx="30" cy="34" r="12" fill="#ffffff" />
          <circle cx="70" cy="34" r="12" fill="#ffffff" />
          <path
            d="M50,88 C20,64 10,46 22,32 C30,23 44,25 50,38 C56,25 70,23 78,32 C90,46 80,64 50,88 Z"
            fill="#ffffff"
          />
          <path d="M80,18 L84,26 L92,29 L84,32 L80,40 L76,32 L68,29 L76,26 Z" fill="#FFC85C" />
        </svg>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, color: "#ffffff", marginTop: 24 }}>
          momenta
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#F3E8FF", marginTop: 12 }}>
          Every great date starts with one good moment
        </div>
      </div>
    ),
    { ...size }
  );
}
