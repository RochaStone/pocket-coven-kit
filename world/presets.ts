// Loads the five theme presets. Each one is plain JSON in world/presets/ so it is easy to read and copy.
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ActivityCategory, BackdropKind, Motif, FamiliarColourway, FamiliarSpecies, Flavour, Stats, ThemePalette } from "../lib/game/types.ts";
import { PRESET_IDS, type PresetId } from "./schema.ts";

export interface PresetItem {
  style: string;
  name: string;
  price: number;
  rarity: "common" | "rare" | "mythic";
  description: string;
}

export interface PresetCollectible {
  style: string;
  name: string;
  tier: "forage" | "gem" | "rare";
  rarity: "common" | "rare" | "mythic";
  colour: string;
  description: string;
}

export interface PresetReward {
  style: string;
  name: string;
  colour: string;
  description: string;
}

export interface Preset {
  id: PresetId;
  label: string;
  description: string;
  coven: { name: string; tagline: string };
  currency: { singular: string; plural: string };
  displayFont: "fraunces" | "cormorant";
  motif: Motif;
  palette: ThemePalette;
  metal: string;
  wardrobeColours: { name: string; hex: string; trim: string }[];
  rooms: { id: string; name: string; backdrop: BackdropKind; blurb: string; activities: string[] }[];
  ceremonies: { id: string; name: string; room: string }[];
  moonRoom: string;
  familiars: FamiliarSpecies[];
  familiarColours: FamiliarColourway[];
  witchNames: string[];
  titles: string[];
  furniture: PresetItem[];
  decor: PresetItem[];
  collectibles: PresetCollectible[];
  rewards: { fullMoon: PresetReward; newMoon: PresetReward; charm: PresetReward };
  treats: { id: string; style: string; name: string; cost: number; effects: Partial<Stats> }[];
  goals: Record<"nourish" | "rituals" | "gifts" | "activities", { name: string; description: string; target: number }>;
  flavour: Flavour;
}

export type { ActivityCategory };

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "presets");

export function loadPreset(id: PresetId): Preset {
  return JSON.parse(readFileSync(path.join(DIR, `${id}.json`), "utf8")) as Preset;
}

export function loadAllPresets(): Record<PresetId, Preset> {
  return Object.fromEntries(PRESET_IDS.map((id) => [id, loadPreset(id)])) as Record<PresetId, Preset>;
}

// A full, valid coven.config.json built from a preset's defaults. The guided setup starts here.
export function starterConfig(preset: Preset) {
  return {
    coven: { ...preset.coven },
    theme: preset.id,
    motif: preset.motif,
    currency: { ...preset.currency },
    timezone: "UTC",
    rooms: preset.rooms.map((r) => ({ id: r.id, name: r.name, backdrop: r.backdrop, blurb: r.blurb, activities: [...r.activities] })),
    ceremonies: preset.ceremonies.map((c) => ({ ...c })),
    moonRoom: preset.moonRoom,
    familiars: [...preset.familiars],
    witches: { count: 5, defaultPronouns: "they" as const },
  };
}
