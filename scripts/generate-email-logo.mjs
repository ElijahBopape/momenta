import sharp from "sharp";
import path from "node:path";

const svg = `
<svg width="320" height="320" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6d28d9"/>
      <stop offset="100%" stop-color="#ff5fa2"/>
    </linearGradient>
  </defs>
  <circle cx="30" cy="34" r="12" fill="url(#g)" stroke="#2a1145" stroke-width="3"/>
  <circle cx="70" cy="34" r="12" fill="url(#g)" stroke="#2a1145" stroke-width="3"/>
  <path d="M50,88 C20,64 10,46 22,32 C30,23 44,25 50,38 C56,25 70,23 78,32 C90,46 80,64 50,88 Z"
        fill="url(#g)" stroke="#2a1145" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M80,18 L84,26 L92,29 L84,32 L80,40 L76,32 L68,29 L76,26 Z"
        fill="#ffc85c" stroke="#2a1145" stroke-width="2" stroke-linejoin="round"/>
</svg>`;

const outPath = path.join(import.meta.dirname, "..", "public", "logo-email.png");
await sharp(Buffer.from(svg)).png().toFile(outPath);
console.log("wrote", outPath);
