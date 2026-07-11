"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} aria-label="Copy link" className="text-muted-foreground hover:text-foreground">
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
