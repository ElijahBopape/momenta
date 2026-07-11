import { DEFAULT_MASCOT_ID } from "@/design/mascots";
import { DEFAULT_BACKGROUND_ID } from "@/design/backgrounds";

export const CUSTOM_BACKGROUND_ID = "custom";

export interface CustomColors {
  from: string;
  to: string;
}

export interface InvitationDesign {
  mascotId: string;
  backgroundId: string;
  customColors?: CustomColors;
  stickers: string[];
}

export const DEFAULT_CUSTOM_COLORS: CustomColors = { from: "#6D28D9", to: "#FF5FA2" };

export const DEFAULT_INVITATION_DESIGN: InvitationDesign = {
  mascotId: DEFAULT_MASCOT_ID,
  backgroundId: DEFAULT_BACKGROUND_ID,
  stickers: [],
};

export const MESSAGE_MAX_LENGTH = 280;
export const TITLE_MAX_LENGTH = 60;
export const RECIPIENT_NAME_MAX_LENGTH = 60;

const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value: string): boolean {
  return HEX_PATTERN.test(value);
}

function relativeBrightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** Simple perceived-brightness heuristic — not full WCAG contrast, but enough to
 * keep text legible against an arbitrary user-picked two-color gradient. */
export function getCustomTextTone(colors: CustomColors): "dark" | "light" {
  const avg = (relativeBrightness(colors.from) + relativeBrightness(colors.to)) / 2;
  return avg > 0.6 ? "dark" : "light";
}

export function buildCustomGradient(colors: CustomColors): string {
  return `linear-gradient(160deg, ${colors.from} 0%, ${colors.to} 100%)`;
}
