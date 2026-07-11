export interface BackgroundRecipe {
  id: string;
  name: string;
  cardBackground: string;
  textTone: "dark" | "light";
}

export const BACKGROUNDS: BackgroundRecipe[] = [
  {
    id: "dawn",
    name: "Dawn",
    cardBackground: "linear-gradient(165deg, #F3E8FF 0%, #FFFFFF 100%)",
    textTone: "dark",
  },
  {
    id: "blossom",
    name: "Blossom",
    cardBackground: "linear-gradient(165deg, #FFE7F1 0%, #FFFFFF 100%)",
    textTone: "dark",
  },
  {
    id: "sunshine",
    name: "Sunshine",
    cardBackground: "linear-gradient(165deg, #FFF3E2 0%, #FFFFFF 100%)",
    textTone: "dark",
  },
  {
    id: "meadow",
    name: "Meadow",
    cardBackground: "linear-gradient(165deg, #DFF7EC 0%, #F3E8FF 100%)",
    textTone: "dark",
  },
  {
    id: "dusk",
    name: "Dusk",
    cardBackground: "linear-gradient(165deg, #2A1145 0%, #6D28D9 100%)",
    textTone: "light",
  },
];

export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export const DEFAULT_BACKGROUND_ID: BackgroundId = "dawn";

export function getBackground(id: string): BackgroundRecipe {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
