// coven.config.json: the one file a founder edits (usually through the guided setup).
// WORLD.md documents every key. parseConfig() returns a typed config or throws ConfigError with every problem listed.
import { ACTIVITY_LIBRARY, SIGNATURE_STYLES, WARDROBE_STYLES } from "./library.ts";
import { isMapRef, isPictureRef, isSpot, PAINTINGS, PAINTED_MAP, type ArtConfig } from "./painted.ts";
import { ART_THEMES, BACKDROPS, FAMILIAR_ACCESSORIES, FAMILIAR_COLOURWAYS, FAMILIAR_SPECIES, HAIR_STYLES, MOTIFS, type FamiliarAccessory, type FamiliarColourway, type HairStyle, type BackdropKind, type FamiliarSpecies, type Flavour, type Mood, type Motif, type ThemePalette } from "../lib/game/types.ts";

export const PRESET_IDS = ["hedge-witch", "moon-coven", "kitchen-witch", "sea-witch", "city-witch"] as const;
export type PresetId = (typeof PRESET_IDS)[number];

export type PronounChoice = "she" | "they" | "he";

export interface RoomActivityConfig {
  id: string; // an id from world/library.ts
  name?: string; // rename it for this room
  flavour?: string[]; // replace the flavour lines (pronoun-neutral tokens only)
}

export interface RoomConfig {
  id?: string; // lowercase letters, digits, underscores. Defaults to a slug of the name.
  name: string;
  backdrop?: BackdropKind;
  painting?: string; // painted theme: a painting id from world/painted.ts, or "mine/<file>" from public/world/mine/
  blurb?: string;
  activities: (string | RoomActivityConfig)[];
}

export interface CeremonyConfig {
  id?: string;
  name: string;
  room: string; // a room id
}

export type WearSlot = keyof typeof WARDROBE_STYLES;
export type WearChoice = string | { style: string; colours?: [string, string]; name?: string };

export interface WitchSlotConfig {
  name?: string;
  // How she looks to begin with (everyone can change it in the game).
  look?: { skin?: string; hairColor?: string; hairStyle?: HairStyle; eyeColor?: string; freckles?: boolean; familiarColour?: FamiliarColourway; familiarAcc?: FamiliarAccessory };
  // What she wears to begin with: a style name per slot, or { style, colours, name } for your own colours.
  wear?: Partial<Record<WearSlot, WearChoice>>;
  title?: string;
  pronouns?: PronounChoice;
  young?: boolean; // young witches never see adults-only activities
}

export interface CovenConfig {
  coven: { name: string; tagline?: string; for?: string; slug?: string };
  theme: PresetId;
  motif?: Motif;
  art?: ArtConfig; // how the world is drawn: { "theme": "painted" | "flat", "map", "hotspots" }
  currency: { singular: string; plural: string };
  timezone?: string;
  palette?: Partial<ThemePalette>;
  wardrobe?: { name: string; hex: string; trim: string }[]; // your own outfit colours, replacing the preset's six
  rooms: RoomConfig[];
  ceremonies?: CeremonyConfig[];
  moonRoom?: string;
  familiars?: FamiliarSpecies[];
  witches?: { count?: number; defaultPronouns?: PronounChoice; slots?: WitchSlotConfig[] };
  flavour?: Partial<Omit<Flavour, "moods">> & { moods?: Partial<Record<Mood, string>> };
}

export class ConfigError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(`coven.config.json has ${problems.length} problem${problems.length === 1 ? "" : "s"}:\n- ${problems.join("\n- ")}`);
    this.problems = problems;
  }
}

export const slugify = (s: string, sep = "_") =>
  s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`^\\${sep}+|\\${sep}+$`, "g"), "");

export const roomIdOf = (r: Pick<RoomConfig, "id" | "name">) => r.id ?? slugify(r.name).replace(/^[^a-z]+/, "").slice(0, 24);

const HEX = /^#[0-9a-fA-F]{6}$/;
const ID = /^[a-z][a-z0-9_]{1,23}$/;
const WORD = /^[\p{L}][\p{L} '-]{0,23}$/u;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;

function validTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

// Every style a slot can wear: the shared wardrobe plus the signature pieces.
export const wearStyles = (slot: WearSlot): string[] => [...WARDROBE_STYLES[slot].map((x) => x.style), ...SIGNATURE_STYLES[slot].map((x) => x.style)];

function lookProblems(look: unknown, where: string): string[] {
  if (look === undefined) return [];
  if (!isObj(look)) return [`${where} must be an object.`];
  const p: string[] = [];
  for (const k of ["skin", "hairColor", "eyeColor"] as const) if (look[k] !== undefined && !(typeof look[k] === "string" && HEX.test(look[k] as string))) p.push(`${where}.${k} must be a hex colour like #f48cc4.`);
  if (look.hairStyle !== undefined && !HAIR_STYLES.includes(look.hairStyle as HairStyle)) p.push(`${where}.hairStyle must be one of ${HAIR_STYLES.join(", ")}.`);
  if (look.freckles !== undefined && typeof look.freckles !== "boolean") p.push(`${where}.freckles must be true or false.`);
  if (look.familiarColour !== undefined && !FAMILIAR_COLOURWAYS.includes(look.familiarColour as FamiliarColourway)) p.push(`${where}.familiarColour must be one of ${FAMILIAR_COLOURWAYS.join(", ")}.`);
  if (look.familiarAcc !== undefined && !FAMILIAR_ACCESSORIES.includes(look.familiarAcc as FamiliarAccessory)) p.push(`${where}.familiarAcc must be one of ${FAMILIAR_ACCESSORIES.join(", ")}.`);
  return p;
}

function wearProblems(wear: unknown, where: string): string[] {
  if (wear === undefined) return [];
  if (!isObj(wear)) return [`${where} must be an object of slots, for example { "hat": "crown" }.`];
  const p: string[] = [];
  for (const [slot, choice] of Object.entries(wear)) {
    if (!(slot in WARDROBE_STYLES)) {
      p.push(`${where}: "${slot}" is not a slot. Use ${Object.keys(WARDROBE_STYLES).join(", ")}.`);
      continue;
    }
    const style = typeof choice === "string" ? choice : isObj(choice) ? choice.style : undefined;
    if (typeof style !== "string" || !wearStyles(slot as WearSlot).includes(style)) p.push(`${where}.${slot}: choose one of ${wearStyles(slot as WearSlot).join(", ")}.`);
    if (isObj(choice)) {
      const c = choice.colours;
      if (c !== undefined && !(Array.isArray(c) && c.length === 2 && c.every((h) => typeof h === "string" && HEX.test(h)))) p.push(`${where}.${slot}.colours must be two hex colours, the main one and the trim.`);
      if (choice.name !== undefined && !str(choice.name, 40)) p.push(`${where}.${slot}.name must be 1 to 40 characters.`);
    }
  }
  return p;
}

export function parseConfig(raw: unknown): CovenConfig {
  const p: string[] = [];
  if (!isObj(raw)) throw new ConfigError(["The file must be a JSON object."]);

  // coven
  if (!isObj(raw.coven) || !str(raw.coven.name, 40)) p.push('coven.name is required (1 to 40 characters), for example "The Bramble Coven".');
  else {
    if (raw.coven.tagline !== undefined && !str(raw.coven.tagline, 120)) p.push("coven.tagline must be 1 to 120 characters.");
    if (raw.coven.slug !== undefined && !(typeof raw.coven.slug === "string" && /^[a-z][a-z0-9-]{1,39}$/.test(raw.coven.slug))) p.push("coven.slug must be lowercase letters, digits and hyphens.");
  }

  // theme
  if (!PRESET_IDS.includes(raw.theme as PresetId)) p.push(`theme must be one of: ${PRESET_IDS.join(", ")}.`);

  if (raw.motif !== undefined && !MOTIFS.includes(raw.motif as Motif)) p.push(`motif must be one of: ${MOTIFS.join(", ")}.`);

  // currency
  if (!isObj(raw.currency)) p.push('currency is required, for example { "singular": "acorn", "plural": "acorns" }.');
  else {
    for (const k of ["singular", "plural"] as const) {
      if (typeof raw.currency[k] !== "string" || !WORD.test(raw.currency[k] as string)) p.push(`currency.${k} must be a word or two (letters only, up to 24 characters).`);
    }
  }

  if (raw.timezone !== undefined && !(typeof raw.timezone === "string" && validTimezone(raw.timezone))) p.push(`timezone "${String(raw.timezone)}" is not a real time zone. Use a name like "Europe/London" or "America/New_York".`);

  if (raw.palette !== undefined) {
    if (!isObj(raw.palette)) p.push("palette must be an object of colour names to hex values.");
    else for (const [k, v] of Object.entries(raw.palette)) if (typeof v !== "string" || !HEX.test(v)) p.push(`palette.${k} must be a hex colour like #5f7a43.`);
  }

  if (raw.wardrobe !== undefined) {
    if (!Array.isArray(raw.wardrobe) || raw.wardrobe.length < 3 || raw.wardrobe.length > 8) p.push("wardrobe: list 3 to 8 colours, each { \"name\", \"hex\", \"trim\" }.");
    else
      raw.wardrobe.forEach((c, i) => {
        if (!isObj(c) || typeof c.name !== "string" || !/^[\p{L}][\p{L} -]{0,15}$/u.test(c.name)) p.push(`wardrobe[${i}].name must be a colour name (letters, up to 16), for example "Rosewater".`);
        else if (typeof c.hex !== "string" || !HEX.test(c.hex) || typeof c.trim !== "string" || !HEX.test(c.trim)) p.push(`wardrobe[${i}] "${c.name}": hex and trim must be hex colours like #c2246e.`);
      });
  }

  // rooms
  const roomIds = new Set<string>();
  if (!Array.isArray(raw.rooms) || raw.rooms.length === 0) {
    p.push("rooms is required: list 4 to 8 rooms, each with a name and 2 to 6 activities.");
  } else {
    if (raw.rooms.length < 4 || raw.rooms.length > 8) p.push(`rooms: a coven needs 4 to 8 rooms (found ${raw.rooms.length}).`);
    raw.rooms.forEach((r, i) => {
      const where = `rooms[${i}]`;
      if (!isObj(r) || !str(r.name, 30)) {
        p.push(`${where} needs a name (1 to 30 characters).`);
        return;
      }
      const id = roomIdOf(r as unknown as RoomConfig);
      if (!ID.test(id)) p.push(`${where} "${r.name}": its id "${id}" must start with a letter and use only lowercase letters, digits and underscores (set "id" to fix).`);
      if (roomIds.has(id)) p.push(`${where} "${r.name}": another room already uses the id "${id}". Give one of them an "id".`);
      roomIds.add(id);
      if (id === "full_moon" || id === "new_moon") p.push(`${where}: "${id}" is reserved.`);
      if (r.backdrop !== undefined && !BACKDROPS.includes(r.backdrop as BackdropKind)) p.push(`${where} "${r.name}": backdrop must be one of ${BACKDROPS.join(", ")}.`);
      if (r.painting !== undefined && !isPictureRef(r.painting)) p.push(`${where} "${r.name}": painting must be one of ${PAINTINGS.join(", ")}, or "mine/your-picture.jpg" for a picture you put in public/world/mine/.`);
      if (r.blurb !== undefined && !str(r.blurb, 120)) p.push(`${where} "${r.name}": blurb must be 1 to 120 characters.`);
      if (!Array.isArray(r.activities) || r.activities.length < 2 || r.activities.length > 6) {
        p.push(`${where} "${r.name}": list 2 to 6 activities from world/library.ts.`);
        return;
      }
      const seen = new Set<string>();
      r.activities.forEach((a, j) => {
        const aid = typeof a === "string" ? a : isObj(a) ? a.id : undefined;
        if (typeof aid !== "string" || !ACTIVITY_LIBRARY.some((x) => x.id === aid)) {
          p.push(`${where} "${r.name}" activity ${j + 1}: "${String(aid)}" is not in the activity library (see WORLD.md).`);
          return;
        }
        if (seen.has(aid)) p.push(`${where} "${r.name}": "${aid}" is listed twice.`);
        seen.add(aid);
        if (isObj(a)) {
          if (a.name !== undefined && !str(a.name, 40)) p.push(`${where} "${r.name}" ${aid}: name must be 1 to 40 characters.`);
          if (a.flavour !== undefined && !(Array.isArray(a.flavour) && a.flavour.length > 0 && a.flavour.every((f) => str(f, 200)))) p.push(`${where} "${r.name}" ${aid}: flavour must be a list of lines (each up to 200 characters).`);
        }
      });
    });
  }

  // ceremonies
  if (raw.ceremonies !== undefined) {
    if (!Array.isArray(raw.ceremonies) || raw.ceremonies.length < 1 || raw.ceremonies.length > 4) p.push("ceremonies: list 1 to 4 ceremonies, each with a name and a room.");
    else {
      const cids = new Set<string>();
      raw.ceremonies.forEach((c, i) => {
        if (!isObj(c) || !str(c.name, 40)) return p.push(`ceremonies[${i}] needs a name.`);
        const cid = typeof c.id === "string" ? c.id : slugify(c.name as string);
        if (!ID.test(cid) || cid === "full_moon" || cid === "new_moon") p.push(`ceremonies[${i}] "${c.name}": id "${cid}" is not allowed.`);
        if (cids.has(cid)) p.push(`ceremonies[${i}] "${c.name}": id "${cid}" is used twice.`);
        cids.add(cid);
        if (typeof c.room !== "string" || !roomIds.has(c.room)) p.push(`ceremonies[${i}] "${c.name}": room "${String(c.room)}" is not one of your room ids.`);
      });
    }
  }
  // art: painted or flat, the map picture, and where each room sits on it
  if (raw.art !== undefined) {
    const a = raw.art;
    if (!isObj(a)) p.push('art must be an object, for example { "theme": "painted" }.');
    else {
      if (a.theme !== undefined && !ART_THEMES.includes(a.theme as (typeof ART_THEMES)[number])) p.push(`art.theme must be "painted" or "flat".`);
      if (a.map !== undefined && !isMapRef(a.map)) p.push(`art.map must be "${PAINTED_MAP}" or "mine/your-map.jpg" for a map you put in public/world/mine/.`);
      if (a.hotspots !== undefined) {
        if (!isObj(a.hotspots)) p.push("art.hotspots must be an object of room ids to { \"x\", \"y\" } positions.");
        else
          for (const [rid, spot] of Object.entries(a.hotspots)) {
            if (!roomIds.has(rid)) p.push(`art.hotspots: "${rid}" is not one of your room ids.`);
            if (!isSpot(spot)) p.push(`art.hotspots.${rid} must be { "x": 0 to 100, "y": 0 to 100 } (percent across and down the map).`);
          }
      }
    }
  }

  if (raw.moonRoom !== undefined && (typeof raw.moonRoom !== "string" || !roomIds.has(raw.moonRoom))) p.push(`moonRoom "${String(raw.moonRoom)}" is not one of your room ids.`);

  // familiars
  if (raw.familiars !== undefined) {
    if (!Array.isArray(raw.familiars) || raw.familiars.length < 1 || raw.familiars.length > FAMILIAR_SPECIES.length) p.push(`familiars: list 1 to 8 of ${FAMILIAR_SPECIES.join(", ")}.`);
    else {
      for (const f of raw.familiars) if (!FAMILIAR_SPECIES.includes(f as FamiliarSpecies)) p.push(`familiars: "${String(f)}" is not a familiar. Choose from ${FAMILIAR_SPECIES.join(", ")}.`);
      if (new Set(raw.familiars).size !== raw.familiars.length) p.push("familiars: each familiar can be listed once.");
    }
  }

  // witches
  if (raw.witches !== undefined) {
    if (!isObj(raw.witches)) p.push("witches must be an object.");
    else {
      const count = raw.witches.count ?? 5;
      if (typeof count !== "number" || !Number.isInteger(count) || count < 2 || count > 12) p.push("witches.count must be a whole number from 2 to 12.");
      if (raw.witches.defaultPronouns !== undefined && !["she", "they", "he"].includes(raw.witches.defaultPronouns as string)) p.push('witches.defaultPronouns must be "she", "they" or "he".');
      if (raw.witches.slots !== undefined) {
        if (!Array.isArray(raw.witches.slots) || (typeof count === "number" && raw.witches.slots.length > count)) p.push("witches.slots must be a list no longer than witches.count.");
        else
          raw.witches.slots.forEach((s, i) => {
            if (!isObj(s)) return p.push(`witches.slots[${i}] must be an object.`);
            if (s.name !== undefined && !(typeof s.name === "string" && WORD.test(s.name) && /[a-zA-Z]/.test(s.name))) p.push(`witches.slots[${i}].name must be letters (up to 24), for example "Bramble".`);
            if (s.title !== undefined && !str(s.title, 40)) p.push(`witches.slots[${i}].title must be 1 to 40 characters.`);
            if (s.pronouns !== undefined && !["she", "they", "he"].includes(s.pronouns as string)) p.push(`witches.slots[${i}].pronouns must be "she", "they" or "he".`);
            if (s.young !== undefined && typeof s.young !== "boolean") p.push(`witches.slots[${i}].young must be true or false.`);
            p.push(...lookProblems(s.look, `witches.slots[${i}].look`), ...wearProblems(s.wear, `witches.slots[${i}].wear`));
          });
      }
    }
  }

  // flavour
  if (raw.flavour !== undefined) {
    if (!isObj(raw.flavour)) p.push("flavour must be an object.");
    else
      for (const [k, v] of Object.entries(raw.flavour)) {
        if (k === "moods") {
          if (!isObj(v)) p.push("flavour.moods must be an object.");
          else for (const [m, line] of Object.entries(v)) if (!str(line, 200)) p.push(`flavour.moods.${m} must be a line of text.`);
        } else if (!str(v, 200)) p.push(`flavour.${k} must be a line of text.`);
      }
  }

  if (p.length) throw new ConfigError(p);
  return raw as unknown as CovenConfig;
}
