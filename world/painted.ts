// The painted world: hand-painted scenes and a painted map, the look a fresh install starts with.
// Pictures live in public/world/painted/ (the bundled set) and public/world/mine/ (your own).
// A picture is named in coven.config.json by its painting id ("palace") or as "mine/<file>" ("mine/my-garden.jpg").
import type { ArtTheme, MapSpot, WorldArt } from "../lib/game/types.ts";

export const PAINTINGS = [
  "palace", "cafe", "grotto", "lagoon", "reef", "beach", "pool", "moon_deck",
  "lounge", "members-cafe", "cowork", "gym", "sound-bath", "studio",
] as const;
export type Painting = (typeof PAINTINGS)[number];

export const PAINTED_MAP = "map-shell";

// What each bundled painting shows, so the guided setup can match a room to a picture.
export const PAINTING_LABEL: Record<Painting, string> = {
  palace: "a canopy bedroom with a moon at the window",
  cafe: "a tea bar with cakes, lanterns and a sea view",
  grotto: "a candlelit cave with a chandelier and crystal walls",
  lagoon: "a waterfall pouring into a glowing spring",
  reef: "an underwater reef of jellyfish lanterns and crystals",
  beach: "a sunset beach with a hammock and a treasure chest",
  pool: "a warm pool under a glass dome",
  moon_deck: "a wooden deck with a telescope under a crescent moon",
  lounge: "a pink sitting room with books, cushions and a crystal ball",
  "members-cafe": "a second tea bar with a pool behind it",
  cowork: "a bright studio with desks and a pin board",
  gym: "a training room with weights and palm windows",
  "sound-bath": "singing bowls, a gong and floor cushions",
  studio: "a movement studio with mats and arched windows",
};

// Where each painting's room sits on the bundled map, in % of the map picture.
export const MAP_SPOTS: Partial<Record<Painting, MapSpot>> = {
  palace: { x: 50, y: 20 },
  cafe: { x: 26, y: 36 },
  grotto: { x: 73, y: 34 },
  lagoon: { x: 51, y: 50 },
  reef: { x: 22, y: 63 },
  beach: { x: 78, y: 62 },
  pool: { x: 50, y: 76 },
  moon_deck: { x: 51, y: 90 },
};

// Used for rooms with no spot of their own: around the edges of the map, then down the middle.
const FALLBACK_SPOTS: MapSpot[] = [
  { x: 14, y: 12 }, { x: 86, y: 12 }, { x: 12, y: 88 }, { x: 88, y: 88 },
  { x: 14, y: 50 }, { x: 86, y: 50 }, { x: 50, y: 6 }, { x: 50, y: 96 },
];

const MINE = /^mine\/[A-Za-z0-9][A-Za-z0-9_-]{0,60}\.(jpe?g|png|webp)$/;

export const isPainting = (v: unknown): v is Painting => typeof v === "string" && (PAINTINGS as readonly string[]).includes(v);
// A room picture: a bundled painting id, or one of your own files in public/world/mine/.
export const isPictureRef = (v: unknown): v is string => isPainting(v) || (typeof v === "string" && MINE.test(v));
export const isMapRef = (v: unknown): v is string => v === PAINTED_MAP || (typeof v === "string" && MINE.test(v));
// The address the browser loads it from (files in public/ are served from the site root).
export const pictureUrl = (ref: string) => (MINE.test(ref) ? `/world/${ref}` : `/world/painted/${ref}.jpg`);

export const isSpot = (v: unknown): v is MapSpot => {
  if (typeof v !== "object" || v === null || Array.isArray(v)) return false;
  const { x, y } = v as Record<string, unknown>;
  return typeof x === "number" && typeof y === "number" && x >= 0 && x <= 100 && y >= 0 && y <= 100;
};

export interface ArtConfig {
  theme?: ArtTheme;
  map?: string;
  hotspots?: Record<string, MapSpot>;
}

export const FLAT_ART: WorldArt = { theme: "flat", map: "", hotspots: {} };

// Turns the config's "art" block and each room's "painting" into the world's art and one picture per room.
// No "art" block at all means the flat drawn world, so older configs and the five presets keep their look.
export function resolveArt(art: ArtConfig | undefined, rooms: { id: string; painting?: string }[]): { art: WorldArt; paintings: Record<string, string> } {
  const theme: ArtTheme = art ? (art.theme ?? "painted") : "flat";
  if (theme === "flat") return { art: FLAT_ART, paintings: {} };
  const map = art?.map ?? PAINTED_MAP;
  const paintings: Record<string, string> = {};
  const hotspots: Record<string, MapSpot> = {};
  const used = new Set<string>();
  const taken = (s: MapSpot) => used.has(`${s.x},${s.y}`);
  rooms.forEach((r, i) => {
    const ref = r.painting ?? PAINTINGS[i % PAINTINGS.length];
    paintings[r.id] = pictureUrl(ref);
    const own = art?.hotspots?.[r.id];
    const bundled = map === PAINTED_MAP && isPainting(ref) ? MAP_SPOTS[ref] : undefined;
    const spot = own ?? (bundled && !taken(bundled) ? bundled : FALLBACK_SPOTS.find((s) => !taken(s)) ?? { x: 50, y: 50 });
    used.add(`${spot.x},${spot.y}`);
    hotspots[r.id] = { x: spot.x, y: spot.y };
  });
  return { art: { theme, map: pictureUrl(map), hotspots }, paintings };
}

// The world a fresh install starts with: the painted map and eight painted rooms, with witchy names of its own.
// It builds on the Sea Witch preset (wardrobe, treasures, treats) and repaints the frame in candlelit plum, blush and gold.
// `npm run new:world painted` writes this again; rename anything, swap any picture.
export function paintedStarterConfig() {
  return {
    coven: { name: "The Moonshell Coven", tagline: "A lantern-lit world tucked inside a shell, open under the real moon." },
    theme: "sea-witch" as const,
    motif: "y2k-blog" as const,
    art: {
      theme: "painted" as const,
      map: PAINTED_MAP,
      // Where each room's label sits on the map, in % across and down. Move them with scripts/place-hotspots.html.
      hotspots: {
        bedchamber: MAP_SPOTS.palace!, terrace: MAP_SPOTS.cafe!, grotto: MAP_SPOTS.grotto!, spring: MAP_SPOTS.lagoon!,
        reef: MAP_SPOTS.reef!, cove: MAP_SPOTS.beach!, conservatory: MAP_SPOTS.pool!, deck: MAP_SPOTS.moon_deck!,
      },
    },
    currency: { singular: "sand dollar", plural: "sand dollars" },
    timezone: "UTC",
    palette: {
      ground: "#50163C", groundDeep: "#3B1230", paper: "#FFF7F4", ink: "#3B1230", accent: "#C2246E", alt: "#8A5A1E",
      mystic: "#6B4FA0", coin: "#9A6B1C", warn: "#B03A3A", sky: "#C9B6F0", skyDeep: "#3B2A6B", wall: "#F6D9E4",
      wallDeep: "#E3B3C6", floor: "#E8C9A8", wood: "#B8892E", leaf: "#4F9A6A", leafDeep: "#2F6A4A", water: "#5FD3C9",
      stone: "#CDB9C4", glow: "#F7D488",
    },
    wardrobe: [
      { name: "Rosewater", hex: "#E58FB4", trim: "#FFF7F4" },
      { name: "Plum", hex: "#682047", trim: "#E9B949" },
      { name: "Candlelight", hex: "#E9B949", trim: "#682047" },
      { name: "Lilac", hex: "#9C86D9", trim: "#FFF7F4" },
      { name: "Seaglass", hex: "#3FB8B0", trim: "#FFF7F4" },
      { name: "Blush", hex: "#F6C1D6", trim: "#C2246E" },
    ],
    rooms: [
      { id: "bedchamber", name: "Starlit Bedchamber", painting: "palace", backdrop: "cottage_room" as const, blurb: "A canopy bed, a moon at the window, a familiar on every pillow.", activities: ["nap", "daydream", "cuddle"] },
      { id: "terrace", name: "Tea Leaf Terrace", painting: "cafe", backdrop: "tea_room" as const, blurb: "Tea under the vines, cakes on the stand, leaves to read after.", activities: ["herbal_tea", "honey_cake", "read_cards"] },
      { id: "grotto", name: "Candlelit Grotto", painting: "grotto", backdrop: "sea_cave" as const, blurb: "Crystals in the walls and a chandelier dripping light.", activities: ["candle_magic", "gossip", "elderflower_toast"] },
      { id: "spring", name: "Wishing Spring", painting: "lagoon", backdrop: "tide_pool" as const, blurb: "A waterfall pours into a pool that grants small wishes.", activities: ["swim", "scry"] },
      { id: "reef", name: "Glimmer Reef", painting: "reef", backdrop: "sea_cave" as const, blurb: "Jellyfish lanterns drift over coral and crystal.", activities: ["rock_pool", "forage", "crystal_cleanse"] },
      { id: "cove", name: "Hammock Cove", painting: "beach", backdrop: "driftwood_shore" as const, blurb: "A hammock, a half-buried chest, and a stall for trading finds.", activities: ["dig", "market_stall", "sing"] },
      { id: "conservatory", name: "Glass Conservatory", painting: "pool", backdrop: "bath_house" as const, blurb: "Warm water under a glass dome. Bring a book.", activities: ["bath", "write_almanac", "sketch"] },
      { id: "deck", name: "Stargazer's Deck", painting: "moon_deck", backdrop: "starfield_roof" as const, blurb: "A telescope, a rug and the whole sky.", activities: ["stargaze", "moon_bath", "spellbook"] },
    ],
    ceremonies: [
      { id: "lantern_circle", name: "Lantern Circle", room: "spring" },
      { id: "tea_leaf_supper", name: "Tea Leaf Supper", room: "terrace" },
    ],
    moonRoom: "deck",
    familiars: ["cat", "owl", "moth", "toad", "rabbit", "fox"],
    witches: { count: 5, defaultPronouns: "they" as const },
  };
}
