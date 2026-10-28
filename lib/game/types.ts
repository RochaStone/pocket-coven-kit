// Shared contracts between the database, the game engine, the world builder and the art layer.
// Content (rooms, witches, items) is NOT defined here: it is generated into catalog.ts from coven.config.json.

export const STATS = ["nourishment", "energy", "joy", "magic", "social"] as const;
export type StatKey = (typeof STATS)[number];
export type Stats = Record<StatKey, number>;

export const MOODS = ["thriving", "happy", "sleepy", "hungry", "bored", "magical", "offended"] as const;
export type Mood = (typeof MOODS)[number];

// The seven wardrobe slots. "companion" is the familiar.
export const SLOTS = ["outfit", "boots", "hat", "necklace", "earrings", "hair_acc", "companion"] as const;
export type Slot = (typeof SLOTS)[number];
export type Equipped = Partial<Record<Slot, string>>;

export const HAIR_STYLES = ["long_waves", "bob", "straight_long", "curls", "braid", "pixie", "buns", "pigtails"] as const;
export type HairStyle = (typeof HAIR_STYLES)[number];

export const FAMILIAR_SPECIES = ["cat", "owl", "moth", "fox", "toad", "raven", "snake", "rabbit"] as const;
export type FamiliarSpecies = (typeof FAMILIAR_SPECIES)[number];
export const FAMILIAR_COLOURWAYS = ["ink", "cream", "ginger", "moss", "dusk", "plum"] as const;
export type FamiliarColourway = (typeof FAMILIAR_COLOURWAYS)[number];
export const FAMILIAR_ACCESSORIES = ["none", "bell", "bow", "hat"] as const;
export type FamiliarAccessory = (typeof FAMILIAR_ACCESSORIES)[number];

export interface Look {
  skin: string;
  hairColor: string;
  hairStyle: HairStyle;
  eyeColor: string;
  freckles?: boolean;
  familiarColour?: FamiliarColourway;
  familiarAcc?: FamiliarAccessory;
}

export interface Pronouns {
  subject: string; // she / they / he
  object: string; // her / them / him
  possessive: string; // her / their / his
  plural: boolean; // true for they/them verb agreement ("they are")
}

export type ItemCategory = "outfit" | "boots" | "hat" | "jewellery" | "hair_acc" | "companion" | "furniture" | "decor" | "collectible";

// How the parametric art draws an item. `style` picks a shape, `colours` tint it.
export interface ItemArt {
  style: string;
  colours: string[];
}

export interface ItemDef {
  id: string;
  name: string;
  category: ItemCategory;
  slot?: Slot; // wearables only
  price?: number; // in the coven's currency; undefined = not sold, found only
  placeable?: boolean; // can go in a room
  season?: number[]; // months (1-12) when it can be bought or found; undefined = always
  rarity: "common" | "rare" | "mythic";
  description: string;
  art: ItemArt;
}

export const ANIMATIONS = [
  "eat", "drink", "sleep", "bathe", "cuddle", "play", "dance", "spell", "swim", "explore",
  "stargaze", "work", "dig", "read", "brew", "garden", "sing", "stretch", "toast",
] as const;
export type AnimationKey = (typeof ANIMATIONS)[number];

// Goal tags: weekly coven goals fill from activities carrying the matching category.
export const ACTIVITY_CATEGORIES = ["nourish", "rest", "magic", "social", "work", "play"] as const;
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];

export interface ActivityDef {
  id: string;
  locationId: string;
  name: string;
  category: ActivityCategory;
  effects: Partial<Stats>;
  coins: number; // positive = earned, negative = costs
  xp: number;
  cooldownSeconds: number;
  adultOnly?: boolean; // never offered to a young witch
  loot?: { itemId: string; chance: number }[];
  animation: AnimationKey;
  // Hotspot position inside the room scene, in % of the scene box.
  spot: { x: number; y: number };
  // Flavour templates. Tokens: {name} {they} {them} {their} {They} {Their}; {is}/{has} follow the name, {are} follows the pronoun.
  flavour: string[];
}

export interface LocationDef {
  id: string;
  name: string;
  blurb: string;
  backdrop: BackdropKind;
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  pronouns: Pronouns;
  young: boolean;
  isOwnerCharacter: boolean;
  description: string;
  personality: string;
  look: Look;
  equipped: Equipped;
  starterItems: string[];
}

export interface SharedEventDef {
  name: string;
  locationId: string;
  minParticipants: number;
  effects: Partial<Stats>;
  coins: number;
  xp: number;
  lootItemId: string;
  moonPhase?: "full" | "new";
}

export const BACKDROPS = [
  "cottage_room", "forest_glade", "mushroom_ring", "herb_garden", "apothecary", "hearth_kitchen",
  "observatory", "starfield_roof", "library", "bath_house", "pantry", "tea_room", "market",
  "tide_pool", "driftwood_shore", "sea_cave", "rooftop_garden", "lantern_lane",
] as const;
export type BackdropKind = (typeof BACKDROPS)[number];

export const WALLPAPERS = ["plain", "stripe", "check", "stars", "vines"] as const;
export type Wallpaper = (typeof WALLPAPERS)[number];
export const FLOORS = ["boards", "flagstone", "rug", "moss"] as const;
export type Floor = (typeof FLOORS)[number];
export const ROOM_COLS = 6;
export const ROOM_ROWS = 4;

export const STICKERS = ["heart", "sparkle", "crescent", "cauldron", "gasp", "starfall"] as const;
export type Sticker = (typeof STICKERS)[number];

// The world's own colours. Every preset ships one; a coven.config.json may override any key.
export interface ThemePalette {
  ground: string; // page background
  groundDeep: string; // page background, lower half
  paper: string; // panels
  ink: string; // text
  accent: string; // primary buttons, highlights
  alt: string; // secondary buttons, "together" moments
  mystic: string; // ceremony and oracle accents
  coin: string; // currency
  warn: string; // errors
  // scene colours
  sky: string;
  skyDeep: string;
  wall: string;
  wallDeep: string;
  floor: string;
  wood: string;
  leaf: string;
  leafDeep: string;
  water: string;
  stone: string;
  glow: string;
}

export interface Chrome {
  case: string;
  rim: string;
  lining: string;
  accent: string;
  ink: string;
  font: string;
}

export interface Flavour {
  moods: Record<Mood, string>;
  joined: string; // system message when a witch claims her invite. Token: {name}
  ritualComplete: string; // appended to a completed ceremony message
  dailyTitle: string;
  dailyBody: string;
  welcome: string; // tutorial heading. Token: {name}
}

export const MOTIFS = ["analog", "cyberpunk", "y2k-blog"] as const;
export type Motif = (typeof MOTIFS)[number];

export interface WorldMeta {
  name: string;
  tagline: string;
  slug: string;
  preset: string;
  timezone: string;
  currency: { singular: string; plural: string };
  palette: ThemePalette;
  displayFont: "fraunces" | "cormorant";
  // Structure of the chrome and panels: paper you could hold, the girly terminal, or the 2003 blog page.
  motif: Motif;
  chrome: Chrome;
  flavour: Flavour;
  startLocation: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
}

export interface GiftTreatDef {
  id: string;
  name: string;
  cost: number;
  effects: Partial<Stats>;
  art: ItemArt;
}

export interface CovenGoalDef {
  kind: "nourish" | "rituals" | "gifts" | "activities";
  name: string;
  description: string;
  target: number;
}

export interface OracleCardDef {
  id: string;
  name: string;
  symbol: string;
  message: string;
}

export interface GameConfig {
  decay_per_hour: Stats;
  decay_floor: number;
  decay_max_hours: number;
  daily_coins: number;
  daily_loot: string[];
  gift_daily_limit: number;
  starting_coins: number;
  chat_rate_limit: { messages: number; seconds: number };
  visit_social_bonus: number;
}

// Everything the game knows about one coven. Generated from coven.config.json into lib/game/catalog.ts.
export interface World {
  meta: WorldMeta;
  characters: CharacterDef[];
  items: ItemDef[];
  locations: LocationDef[];
  activities: ActivityDef[];
  sharedEvents: Record<string, SharedEventDef>;
  achievements: AchievementDef[];
  giftTreats: GiftTreatDef[];
  covenGoals: CovenGoalDef[];
  covenGoalReward: { coins: number; itemId: string };
  oracleCards: OracleCardDef[];
  gameConfig: GameConfig;
}
