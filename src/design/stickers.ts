export interface StickerRecipe {
  id: string;
  emoji: string;
  label: string;
}

export const STICKERS: StickerRecipe[] = [
  { id: "heart", emoji: "💜", label: "Heart" },
  { id: "sparkles", emoji: "✨", label: "Sparkles" },
  { id: "confetti", emoji: "🎉", label: "Confetti" },
  { id: "balloon", emoji: "🎈", label: "Balloon" },
  { id: "cake", emoji: "🍰", label: "Cake" },
  { id: "music", emoji: "🎵", label: "Music note" },
  { id: "camera", emoji: "📸", label: "Camera" },
  { id: "letter", emoji: "💌", label: "Love letter" },
  { id: "blossom", emoji: "🌸", label: "Blossom" },
  { id: "star", emoji: "🌟", label: "Star" },
];

export const MAX_STICKERS = 4;

export function getSticker(id: string): StickerRecipe | undefined {
  return STICKERS.find((s) => s.id === id);
}
