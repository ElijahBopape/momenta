import { getMascot, type MascotId, type MascotMood } from "@/design/mascots";

const STROKE = "#2d0c57";

function Ears({ shape, fur, inner }: { shape: string; fur: string; inner: string }) {
  switch (shape) {
    case "long":
      return (
        <>
          <ellipse cx="82" cy="30" rx="16" ry="46" fill={fur} stroke={STROKE} strokeWidth="3" transform="rotate(-8 82 30)" />
          <ellipse cx="158" cy="30" rx="16" ry="46" fill={fur} stroke={STROKE} strokeWidth="3" transform="rotate(8 158 30)" />
          <ellipse cx="83" cy="34" rx="7" ry="32" fill={inner} transform="rotate(-8 83 34)" />
          <ellipse cx="157" cy="34" rx="7" ry="32" fill={inner} transform="rotate(8 157 34)" />
        </>
      );
    case "pointed":
      return (
        <>
          <path d="M60,90 L48,32 L96,68 Z" fill={fur} stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M180,90 L192,32 L144,68 Z" fill={fur} stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <path d="M64,80 L57,46 L82,64 Z" fill={inner} />
          <path d="M176,80 L183,46 L158,64 Z" fill={inner} />
        </>
      );
    case "floppy":
      return (
        <>
          <ellipse cx="70" cy="98" rx="20" ry="38" fill={fur} stroke={STROKE} strokeWidth="3" transform="rotate(-18 70 98)" />
          <ellipse cx="170" cy="98" rx="20" ry="38" fill={fur} stroke={STROKE} strokeWidth="3" transform="rotate(18 170 98)" />
          <ellipse cx="72" cy="100" rx="9" ry="26" fill={inner} transform="rotate(-18 72 100)" />
          <ellipse cx="168" cy="100" rx="9" ry="26" fill={inner} transform="rotate(18 168 100)" />
        </>
      );
    case "small":
      return (
        <>
          <circle cx="82" cy="76" r="16" fill={fur} stroke={STROKE} strokeWidth="3" />
          <circle cx="158" cy="76" r="16" fill={fur} stroke={STROKE} strokeWidth="3" />
          <circle cx="82" cy="78" r="7" fill={inner} />
          <circle cx="158" cy="78" r="7" fill={inner} />
        </>
      );
    default:
      return (
        <>
          <circle cx="76" cy="80" r="25" fill={fur} stroke={STROKE} strokeWidth="3" />
          <circle cx="164" cy="80" r="25" fill={fur} stroke={STROKE} strokeWidth="3" />
          <circle cx="76" cy="82" r="12" fill={inner} />
          <circle cx="164" cy="82" r="12" fill={inner} />
        </>
      );
  }
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === "smirk") {
    return (
      <>
        <circle cx="95" cy="103" r="8" fill={STROKE} />
        <circle cx="98" cy="100" r="3" fill="#fff" />
        <path d="M123,101 Q145,95 157,101" stroke={STROKE} strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    );
  }
  return (
    <>
      <circle cx="95" cy="103" r="8" fill={STROKE} />
      <circle cx="98" cy="100" r="3" fill="#fff" />
      <circle cx="145" cy="103" r="8" fill={STROKE} />
      <circle cx="148" cy="100" r="3" fill="#fff" />
    </>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  if (mood === "smirk") {
    return <path d="M104,146 Q118,150 132,140" stroke={STROKE} strokeWidth="4" fill="none" strokeLinecap="round" />;
  }
  if (mood === "party") {
    return <path d="M100,141 Q120,163 140,141 Q120,159 100,141 Z" fill="#c2185b" />;
  }
  return <path d="M102,142 Q120,155 138,142" stroke={STROKE} strokeWidth="4" fill="none" strokeLinecap="round" />;
}

export interface MascotProps {
  species?: MascotId | string;
  mood?: MascotMood;
  className?: string;
}

export function Mascot({ species = "bear", mood = "happy", className }: MascotProps) {
  const r = getMascot(species);

  return (
    <svg viewBox="0 0 240 320" className={className} role="img" aria-label={`${r.name}, ${mood}`}>
      <defs>
        <linearGradient id={`horn-${r.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe9a8" />
          <stop offset="100%" stopColor="#ffc85c" />
        </linearGradient>
        <linearGradient id={`mane-${r.id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff8fc0" />
          <stop offset="50%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#8be3d0" />
        </linearGradient>
      </defs>

      <ellipse cx="93" cy="296" rx="23" ry="18" fill={r.fur} stroke={STROKE} strokeWidth="3" />
      <ellipse cx="147" cy="296" rx="23" ry="18" fill={r.fur} stroke={STROKE} strokeWidth="3" />
      <ellipse cx="93" cy="299" rx="10" ry="7" fill={r.paw} />
      <ellipse cx="147" cy="299" rx="10" ry="7" fill={r.paw} />

      <ellipse cx="62" cy="222" rx="18" ry="31" fill={r.fur} stroke={STROKE} strokeWidth="3" transform="rotate(-16 62 222)" />
      <ellipse cx="178" cy="222" rx="18" ry="31" fill={r.fur} stroke={STROKE} strokeWidth="3" transform="rotate(16 178 222)" />

      <ellipse cx="120" cy="238" rx="62" ry="54" fill={r.fur} stroke={STROKE} strokeWidth="3" />
      <ellipse cx="120" cy="248" rx="36" ry="30" fill={r.belly} stroke={STROKE} strokeWidth="2.5" />

      {r.bow !== false && (
        <>
          <path d="M120,182 L100,172 L100,192 Z" fill={r.bowColor} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M120,182 L140,172 L140,192 Z" fill={r.bowColor} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="120" cy="182" r="8" fill={r.bowColor} stroke={STROKE} strokeWidth="2.5" />
        </>
      )}

      <Ears shape={r.ear} fur={r.fur} inner={r.earInner} />

      {mood === "party" && (
        <g>
          <path d="M120,38 L100,68 L140,68 Z" fill="#ff6fb5" stroke={STROKE} strokeWidth="3" strokeLinejoin="round" />
          <circle cx="120" cy="65" r="3" fill="#a855f7" />
          <circle cx="112" cy="56" r="3" fill="#a855f7" />
          <circle cx="128" cy="49" r="3" fill="#a855f7" />
          <circle cx="120" cy="38" r="6" fill="#fff3dc" stroke={STROKE} strokeWidth="2" />
        </g>
      )}

      <circle cx="120" cy="126" r="58" fill={r.fur} stroke={STROKE} strokeWidth="3" />
      <circle cx="80" cy="130" r="10" fill={r.blush} opacity="0.6" />
      <circle cx="160" cy="130" r="10" fill={r.blush} opacity="0.6" />

      {r.beak ? (
        <path d="M105,142 L120,158 L135,142 Z" fill={r.beakColor} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
      ) : (
        <>
          <ellipse cx="120" cy="140" rx="34" ry="26" fill={r.belly} stroke={STROKE} strokeWidth="3" />
          <ellipse cx="120" cy="128" rx="11" ry="8" fill={STROKE} />
        </>
      )}

      {r.horn && (
        <>
          <path d={`M120,20 L112,58 L128,58 Z`} fill={`url(#horn-${r.id})`} stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M115,32 L125,32 M113,42 L127,42 M114,50 L126,50" stroke="#fff" strokeWidth="2" opacity="0.6" />
        </>
      )}
      {r.mane && (
        <path d="M70,60 Q90,30 120,45 Q150,25 172,55" stroke={`url(#mane-${r.id})`} strokeWidth="10" fill="none" strokeLinecap="round" />
      )}
      {r.patches && (
        <>
          <ellipse cx="88" cy="118" rx="20" ry="24" fill="#2b2b2b" transform="rotate(-12 88 118)" />
          <ellipse cx="152" cy="118" rx="20" ry="24" fill="#2b2b2b" transform="rotate(12 152 118)" />
        </>
      )}
      {r.whiskers && (
        <path
          d="M60,138 L20,132 M60,146 L18,148 M180,138 L220,132 M180,146 L222,148"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}
      {r.trunk && (
        <path d="M120,150 Q112,190 128,204 Q138,208 134,196 Z" fill={r.fur} stroke={STROKE} strokeWidth="3" strokeLinecap="round" />
      )}

      <Mouth mood={mood} />
      <Eyes mood={mood} />
    </svg>
  );
}
