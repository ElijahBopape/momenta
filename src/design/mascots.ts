export type MascotMood = "happy" | "smirk" | "party";

export type MascotEarShape = "round" | "long" | "pointed" | "floppy" | "small";

export interface MascotRecipe {
  id: string;
  name: string;
  ear: MascotEarShape;
  fur: string;
  earInner: string;
  belly: string;
  paw: string;
  blush: string;
  bowColor: string;
  bow?: boolean;
  horn?: boolean;
  mane?: boolean;
  patches?: boolean;
  whiskers?: boolean;
  beak?: boolean;
  beakColor?: string;
  trunk?: boolean;
}

/**
 * One shared plush anatomy, varied per species by recipe only.
 * Adding a 9th companion is a new entry here, not new markup —
 * see src/components/brand/mascot.tsx for the renderer.
 */
export const MASCOTS: MascotRecipe[] = [
  {
    id: "bear",
    name: "Bear",
    ear: "round",
    fur: "#C98A52",
    earInner: "#FFB5D8",
    belly: "#FBE6C4",
    paw: "#FBE6C4",
    blush: "#FF8FC0",
    bowColor: "#A855F7",
  },
  {
    id: "bunny",
    name: "Bunny",
    ear: "long",
    fur: "#F6EFE4",
    earInner: "#FFC3DD",
    belly: "#FFF8EF",
    paw: "#FFE3EE",
    blush: "#FF9FC7",
    bowColor: "#FF5FA2",
  },
  {
    id: "unicorn",
    name: "Unicorn",
    ear: "small",
    fur: "#EFE8FB",
    earInner: "#E3B8FF",
    belly: "#FDF9FF",
    paw: "#FDF9FF",
    blush: "#C9A4FF",
    bowColor: "#8B5CF6",
    horn: true,
    mane: true,
    bow: false,
  },
  {
    id: "fox",
    name: "Fox",
    ear: "pointed",
    fur: "#E8804A",
    earInner: "#2D0C57",
    belly: "#FFF3E2",
    paw: "#FFF3E2",
    blush: "#FF8FC0",
    bowColor: "#6D28D9",
  },
  {
    id: "panda",
    name: "Panda",
    ear: "round",
    fur: "#F7F5F0",
    earInner: "#2B2B2B",
    belly: "#FFFFFF",
    paw: "#EFEFEF",
    blush: "#FF9FC7",
    bowColor: "#FF5FA2",
    patches: true,
  },
  {
    id: "cat",
    name: "Cat",
    ear: "pointed",
    fur: "#C9BFE0",
    earInner: "#FFC3DD",
    belly: "#F7F2FF",
    paw: "#F7F2FF",
    blush: "#FF9FC7",
    bowColor: "#8B5CF6",
    whiskers: true,
  },
  {
    id: "penguin",
    name: "Penguin",
    ear: "small",
    fur: "#243050",
    earInner: "#243050",
    belly: "#FFFFFF",
    paw: "#FFB347",
    blush: "#FF9FC7",
    bowColor: "#FF5FA2",
    beak: true,
    beakColor: "#FFB347",
  },
  {
    id: "sloth",
    name: "Sloth",
    ear: "round",
    fur: "#A9967D",
    earInner: "#7A6A54",
    belly: "#EFE4D0",
    paw: "#EFE4D0",
    blush: "#E0A4A4",
    bowColor: "#6D28D9",
  },
];

export type MascotId = (typeof MASCOTS)[number]["id"];

export const DEFAULT_MASCOT_ID: MascotId = "bear";

export function getMascot(id: string): MascotRecipe {
  return MASCOTS.find((m) => m.id === id) ?? MASCOTS[0];
}
