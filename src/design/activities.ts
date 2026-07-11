export interface ActivityRecipe {
  id: string;
  label: string;
  emoji: string;
}

export const ACTIVITIES: ActivityRecipe[] = [
  { id: "coffee", label: "Coffee", emoji: "☕" },
  { id: "pizza", label: "Pizza", emoji: "🍕" },
  { id: "sushi", label: "Sushi", emoji: "🍣" },
  { id: "steak", label: "Steak", emoji: "🥩" },
  { id: "local-food", label: "Local Food", emoji: "🍲" },
  { id: "breakfast", label: "Breakfast", emoji: "🥞" },
  { id: "lunch", label: "Lunch", emoji: "🍱" },
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "ice-cream", label: "Ice Cream", emoji: "🍦" },
  { id: "movies", label: "Movies", emoji: "🎬" },
  { id: "bowling", label: "Bowling", emoji: "🎳" },
  { id: "arcade", label: "Arcade", emoji: "🕹️" },
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "museum", label: "Museum", emoji: "🖼️" },
  { id: "aquarium", label: "Aquarium", emoji: "🐠" },
  { id: "picnic", label: "Picnic", emoji: "🧺" },
  { id: "go-karting", label: "Go Karting", emoji: "🏎️" },
  { id: "mini-golf", label: "Mini Golf", emoji: "⛳" },
  { id: "escape-room", label: "Escape Room", emoji: "🔐" },
  { id: "karaoke", label: "Karaoke", emoji: "🎤" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "beach", label: "Beach", emoji: "🏖️" },
  { id: "park", label: "Park", emoji: "🌳" },
  { id: "zoo", label: "Zoo", emoji: "🦁" },
  { id: "live-music", label: "Live Music", emoji: "🎵" },
  { id: "theatre", label: "Theatre", emoji: "🎭" },
];

export function getActivity(id: string): ActivityRecipe | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}
