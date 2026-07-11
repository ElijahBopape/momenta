export interface OsmTag {
  key: string;
  value: string;
}

export interface ActivityRecipe {
  id: string;
  label: string;
  emoji: string;
  /**
   * OpenStreetMap tag used to search Overpass for this activity (see
   * src/lib/venues/osm-provider.ts). A handful of these are best-effort
   * proxies where OSM has no exact equivalent (e.g. "Hiking" has no POI tag
   * of its own — trailheads are the closest searchable point).
   */
  osmTag: OsmTag;
}

export const ACTIVITIES: ActivityRecipe[] = [
  { id: "coffee", label: "Coffee", emoji: "☕", osmTag: { key: "amenity", value: "cafe" } },
  { id: "pizza", label: "Pizza", emoji: "🍕", osmTag: { key: "cuisine", value: "pizza" } },
  { id: "sushi", label: "Sushi", emoji: "🍣", osmTag: { key: "cuisine", value: "sushi" } },
  { id: "steak", label: "Steak", emoji: "🥩", osmTag: { key: "cuisine", value: "steak_house" } },
  { id: "local-food", label: "Local Food", emoji: "🍲", osmTag: { key: "amenity", value: "restaurant" } },
  { id: "breakfast", label: "Breakfast", emoji: "🥞", osmTag: { key: "cuisine", value: "breakfast" } },
  { id: "lunch", label: "Lunch", emoji: "🍱", osmTag: { key: "amenity", value: "restaurant" } },
  { id: "dinner", label: "Dinner", emoji: "🍽️", osmTag: { key: "amenity", value: "restaurant" } },
  { id: "ice-cream", label: "Ice Cream", emoji: "🍦", osmTag: { key: "amenity", value: "ice_cream" } },
  { id: "movies", label: "Movies", emoji: "🎬", osmTag: { key: "amenity", value: "cinema" } },
  { id: "bowling", label: "Bowling", emoji: "🎳", osmTag: { key: "leisure", value: "bowling_alley" } },
  { id: "arcade", label: "Arcade", emoji: "🕹️", osmTag: { key: "leisure", value: "amusement_arcade" } },
  { id: "hiking", label: "Hiking", emoji: "🥾", osmTag: { key: "leisure", value: "nature_reserve" } },
  { id: "museum", label: "Museum", emoji: "🖼️", osmTag: { key: "tourism", value: "museum" } },
  { id: "aquarium", label: "Aquarium", emoji: "🐠", osmTag: { key: "tourism", value: "aquarium" } },
  { id: "picnic", label: "Picnic", emoji: "🧺", osmTag: { key: "tourism", value: "picnic_site" } },
  { id: "go-karting", label: "Go Karting", emoji: "🏎️", osmTag: { key: "sport", value: "karting" } },
  { id: "mini-golf", label: "Mini Golf", emoji: "⛳", osmTag: { key: "leisure", value: "miniature_golf" } },
  { id: "escape-room", label: "Escape Room", emoji: "🔐", osmTag: { key: "leisure", value: "escape_game" } },
  { id: "karaoke", label: "Karaoke", emoji: "🎤", osmTag: { key: "amenity", value: "karaoke_box" } },
  { id: "shopping", label: "Shopping", emoji: "🛍️", osmTag: { key: "shop", value: "mall" } },
  { id: "beach", label: "Beach", emoji: "🏖️", osmTag: { key: "natural", value: "beach" } },
  { id: "park", label: "Park", emoji: "🌳", osmTag: { key: "leisure", value: "park" } },
  { id: "zoo", label: "Zoo", emoji: "🦁", osmTag: { key: "tourism", value: "zoo" } },
  { id: "live-music", label: "Live Music", emoji: "🎵", osmTag: { key: "amenity", value: "nightclub" } },
  { id: "theatre", label: "Theatre", emoji: "🎭", osmTag: { key: "amenity", value: "theatre" } },
];

export function getActivity(id: string): ActivityRecipe | undefined {
  return ACTIVITIES.find((a) => a.id === id);
}
