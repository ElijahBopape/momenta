const STROKE = "#2a1145";

export function LogoMark({ className, dark = false }: { className?: string; dark?: boolean }) {
  const gradientId = dark ? "momenta-icon-dark" : "momenta-icon-light";
  const stroke = dark ? "#ffffff" : STROKE;

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="Momenta">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          {dark ? (
            <>
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#ff8fc0" />
            </>
          ) : (
            <>
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#ff5fa2" />
            </>
          )}
        </linearGradient>
      </defs>
      <circle cx="30" cy="34" r="12" fill={`url(#${gradientId})`} stroke={stroke} strokeWidth="3" />
      <circle cx="70" cy="34" r="12" fill={`url(#${gradientId})`} stroke={stroke} strokeWidth="3" />
      <path
        d="M50,88 C20,64 10,46 22,32 C30,23 44,25 50,38 C56,25 70,23 78,32 C90,46 80,64 50,88 Z"
        fill={`url(#${gradientId})`}
        stroke={stroke}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="M80,18 L84,26 L92,29 L84,32 L80,40 L76,32 L68,29 L76,26 Z"
        fill="#ffc85c"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 ${className ?? ""}`}>
      <LogoMark className={iconClassName ?? "h-7 w-7"} />
      <span className="font-display text-lg font-extrabold tracking-tight text-foreground sm:text-xl">momenta</span>
    </span>
  );
}
