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
    cardBackground: "linear-gradient(160deg, #E4D2FF 0%, #F6EEFF 55%, #FFFFFF 100%)",
    textTone: "dark",
  },
  {
    id: "blossom",
    name: "Blossom",
    cardBackground: "linear-gradient(160deg, #FFC9E1 0%, #FFEAF3 55%, #FFFFFF 100%)",
    textTone: "dark",
  },
  {
    id: "sunset",
    name: "Sunset",
    cardBackground: "linear-gradient(160deg, #FFC85C 0%, #FF9F6B 40%, #FFC9E1 100%)",
    textTone: "dark",
  },
  {
    id: "meadow",
    name: "Meadow",
    cardBackground: "linear-gradient(160deg, #9CEFC6 0%, #DFF7EC 50%, #F3E8FF 100%)",
    textTone: "dark",
  },
  {
    id: "dusk",
    name: "Dusk",
    cardBackground: "linear-gradient(165deg, #2A1145 0%, #6D28D9 70%, #A855F7 100%)",
    textTone: "light",
  },
];

export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export const DEFAULT_BACKGROUND_ID: BackgroundId = "dawn";

export function getBackground(id: string): BackgroundRecipe {
  return BACKGROUNDS.find((b) => b.id === id) ?? BACKGROUNDS[0];
}
