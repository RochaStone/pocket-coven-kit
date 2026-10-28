// The world builder: coven.config.json + a theme preset + the shared library  ->  a complete World.
// Pure function (no file system), so tests can build every preset in memory.
import { ACHIEVEMENT_LIBRARY, ACTIVITY_LIBRARY, FAMILIAR_INFO, ORACLE_DECK, WARDROBE_STYLES } from "./library.ts";
import type { Preset, PresetCollectible } from "./presets.ts";
import { roomIdOf, slugify, type CovenConfig, type PronounChoice } from "./schema.ts";
import { DEFAULT_CHROME } from "./style.ts";
import {
  FAMILIAR_ACCESSORIES,
  HAIR_STYLES,
  type ActivityDef,
  type CharacterDef,
  type Chrome,
  type Equipped,
  type ItemDef,
  type LocationDef,
  type Pronouns,
  type SharedEventDef,
  type World,
} from "../lib/game/types.ts";

export const PRONOUNS: Record<PronounChoice, Pronouns> = {
  she: { subject: "she", object: "her", possessive: "her", plural: false },
  they: { subject: "they", object: "them", possessive: "their", plural: true },
  he: { subject: "he", object: "him", possessive: "his", plural: false },
};

// Hotspot positions inside a 4:3 scene, in % of the box. Activity n in a room uses SPOTS[n].
export const SPOTS = [
  { x: 24, y: 60 },
  { x: 74, y: 58 },
  { x: 50, y: 34 },
  { x: 14, y: 36 },
  { x: 86, y: 34 },
  { x: 50, y: 74 },
];

const SKINS = ["#f6dcc8", "#e9b993", "#c98f68", "#a8714d", "#7d4f33", "#5a3826", "#f1cfb4", "#d6a27c"];
const HAIRS = ["#2a1f1a", "#6b4428", "#b5652e", "#e3c07a", "#d9d4cf", "#4a2a4f", "#1f2a44", "#8a3a2e"];
const EYES = ["#5a3a22", "#3f6a50", "#3b5a8f", "#6b4a2e", "#4a3a6a", "#2f5a5a"];

const WEARABLE_DESCRIPTIONS: Record<string, string> = {
  cloak: "Heavy wool, deep hood, a pocket for every season.",
  pinafore: "Two big pockets. One for seeds, one for sweets.",
  wrap_dress: "Ties at the waist and twirls when you turn.",
  gown: "Floor-length and made for standing in moonlight.",
  cardigan: "Chunky knit with buttons carved from bone.",
  apron_dress: "Built for brewing. Splashes add character.",
  lace_up: "Laced to the shin for long muddy walks.",
  ankle: "Short, sturdy and puddle-proof.",
  buckled: "Three brass buckles that jingle on the stairs.",
  slippers: "Felted wool for padding about at night.",
  pointed: "The classic. Tall enough to keep a secret in.",
  wide_brim: "Keeps off sun, rain and unwanted opinions.",
  hood: "Pull it up for weather and for mystery.",
  beret: "Worn at an angle that means business.",
  flower_crown: "Woven this morning from whatever was blooming.",
  moon_pendant: "A crescent that turns to face the real moon.",
  crystal: "A clear point that warms in your hand.",
  acorn: "A locket the size of an acorn with a wish inside.",
  key: "A key to nothing in particular, worn for luck.",
  hoops: "Plain bright hoops. Go with everything.",
  stars: "Two pinpricks of starlight.",
  drops: "One bead each side, catching the lamplight.",
  leaves: "Tiny metal leaves that rustle in a breeze.",
  ribbon: "A velvet bow tied big.",
  sprig: "A fresh sprig tucked behind the ear.",
  clip: "A crescent clip that holds a wild fringe.",
  pins: "Little stars scattered through a bun.",
};

const SLOT_PREFIX = { outfit: "outfit", boots: "boots", hat: "hat", necklace: "neck", earrings: "ear", hair_acc: "hair" } as const;
const SLOT_CATEGORY = { outfit: "outfit", boots: "boots", hat: "hat", necklace: "jewellery", earrings: "jewellery", hair_acc: "hair_acc" } as const;
// Each slot is painted from a different starting point in the preset's six wardrobe colours, so pieces mix well.
const SLOT_OFFSET = { outfit: 0, boots: 2, hat: 1, necklace: 3, earrings: 4, hair_acc: 5 } as const;

const uniqueId = (base: string, taken: Set<string>) => {
  let id = base;
  for (let n = 2; taken.has(id); n++) id = `${base}_${n}`;
  taken.add(id);
  return id;
};

// Character ids must be lowercase letters only (2 to 20), unique within the coven.
function witchId(name: string, taken: Set<string>): string {
  const base = (slugify(name, "").replace(/[^a-z]/g, "") || "witch").slice(0, 18).padEnd(2, "x");
  let id = base;
  for (let n = 0; taken.has(id); n++) id = base.slice(0, 18) + String.fromCharCode(97 + (n % 26)) + (n >= 26 ? String.fromCharCode(97 + Math.floor(n / 26)) : "");
  taken.add(id);
  return id;
}

export interface BuildOptions {
  chrome?: Chrome;
}

export function buildWorld(config: CovenConfig, preset: Preset, opts: BuildOptions = {}): World {
  const currency = { singular: config.currency.singular.trim(), plural: config.currency.plural.trim() };
  const palette = { ...preset.palette, ...(config.palette ?? {}) };

  // ── items ──────────────────────────────────────────────────────────────
  const items: ItemDef[] = [];
  const itemIds = new Set<string>();
  const colours = preset.wardrobeColours;

  for (const slot of Object.keys(WARDROBE_STYLES) as (keyof typeof WARDROBE_STYLES)[]) {
    WARDROBE_STYLES[slot].forEach((s, i) => {
      const c = colours[(i + SLOT_OFFSET[slot]) % colours.length];
      const jewellery = slot === "necklace" || slot === "earrings";
      items.push({
        id: uniqueId(`${SLOT_PREFIX[slot]}_${s.style}`, itemIds),
        name: `${c.name} ${s.name}`,
        category: SLOT_CATEGORY[slot],
        slot,
        price: s.price,
        rarity: s.price >= 150 ? "rare" : "common",
        description: WEARABLE_DESCRIPTIONS[s.style] ?? "",
        art: { style: s.style, colours: jewellery ? [preset.metal, c.hex] : [c.hex, c.trim] },
      });
    });
  }

  const familiars = config.familiars ?? preset.familiars;
  const familiarIds = familiars.map((species) => {
    const info = FAMILIAR_INFO[species];
    const id = uniqueId(`fam_${species}`, itemIds);
    items.push({ id, name: info.name, category: "companion", slot: "companion", price: info.price, rarity: info.price >= 200 ? "rare" : "common", description: info.description, art: { style: species, colours: [] } });
    return id;
  });

  const placeable = (kind: "furniture" | "decor", list: Preset["furniture"]) =>
    list.map((f, i) => {
      const id = uniqueId(`${kind === "furniture" ? "furn" : "decor"}_${f.style}`, itemIds);
      items.push({ id, name: f.name, category: kind, price: f.price, placeable: true, rarity: f.rarity, description: f.description, art: { style: f.style, colours: [palette.wood, colours[i % colours.length].hex, palette.glow] } });
      return id;
    });
  const furnitureIds = placeable("furniture", preset.furniture);
  const decorIds = placeable("decor", preset.decor);

  const collectibleId = new Map<PresetCollectible, string>();
  for (const c of preset.collectibles) {
    const id = uniqueId(`col_${slugify(c.name)}`, itemIds);
    collectibleId.set(c, id);
    items.push({ id, name: c.name, category: "collectible", placeable: true, rarity: c.rarity, description: c.description, art: { style: c.style, colours: [c.colour] } });
  }
  const reward = (key: "fullMoon" | "newMoon" | "charm", id: string) => {
    const r = preset.rewards[key];
    items.push({ id: uniqueId(id, itemIds), name: r.name, category: "collectible", placeable: true, rarity: "mythic", description: r.description, art: { style: r.style, colours: [r.colour] } });
    return id;
  };
  const fullMoonId = reward("fullMoon", "col_full_moon");
  const newMoonId = reward("newMoon", "col_new_moon");
  const charmId = reward("charm", "col_goal_charm");

  // Two seasonal pieces every coven gets: October and December.
  items.push({ id: uniqueId("decor_pumpkin", itemIds), name: "Carved Pumpkin", category: "decor", price: 60, placeable: true, season: [10], rarity: "rare", description: "A crescent-moon grin and a candle inside.", art: { style: "pumpkin", colours: ["#c9752f", palette.glow] } });
  items.push({ id: uniqueId("decor_star_tree", itemIds), name: "Star Tree", category: "decor", price: 80, placeable: true, season: [12], rarity: "rare", description: "A little fir hung with paper stars.", art: { style: "star_tree", colours: [palette.leafDeep, palette.glow] } });

  const tier = (t: PresetCollectible["tier"]) => preset.collectibles.filter((c) => c.tier === t);
  const chanceOf = (c: PresetCollectible) => (c.rarity === "mythic" ? 0.03 : c.rarity === "rare" ? 0.1 : c.tier === "forage" ? 0.3 : 0.25);
  const lootFor = (t?: "forage" | "gem" | "rare") => {
    if (!t) return undefined;
    const pool = t === "rare" ? [...tier("forage").slice(0, 1), ...tier("rare")] : tier(t);
    return pool.map((c) => ({ itemId: collectibleId.get(c)!, chance: chanceOf(c) }));
  };

  // ── rooms and activities ───────────────────────────────────────────────
  const locations: LocationDef[] = [];
  const activities: ActivityDef[] = [];
  config.rooms.forEach((r, ri) => {
    const id = roomIdOf(r);
    const fallback = preset.rooms[ri % preset.rooms.length];
    locations.push({ id, name: r.name.trim(), blurb: r.blurb?.trim() ?? "", backdrop: r.backdrop ?? fallback.backdrop });
    r.activities.forEach((entry, j) => {
      const e = typeof entry === "string" ? { id: entry } : entry;
      const lib = ACTIVITY_LIBRARY.find((a) => a.id === e.id)!;
      activities.push({
        id: `${id}_${lib.id}`,
        locationId: id,
        name: e.name?.trim() ?? lib.name,
        category: lib.category,
        effects: { ...lib.effects },
        coins: lib.coins,
        xp: lib.xp,
        cooldownSeconds: lib.cooldownSeconds,
        ...(lib.adultOnly ? { adultOnly: true } : {}),
        ...(lib.loot ? { loot: lootFor(lib.loot) } : {}),
        animation: lib.animation,
        spot: SPOTS[j % SPOTS.length],
        flavour: e.flavour ?? [...lib.flavour],
      });
    });
  });

  // ── ceremonies ─────────────────────────────────────────────────────────
  const gems = tier("gem").map((c) => collectibleId.get(c)!);
  const ceremonies = config.ceremonies ?? preset.ceremonies.filter((c) => locations.some((l) => l.id === c.room));
  const sharedEvents: Record<string, SharedEventDef> = {};
  ceremonies.forEach((c, i) => {
    const id = c.id ?? slugify(c.name);
    sharedEvents[id] =
      i % 2 === 0
        ? { name: c.name, locationId: c.room, minParticipants: 2, effects: { magic: 30, social: 25, joy: 10 }, coins: 30, xp: 25, lootItemId: gems[i % gems.length] }
        : { name: c.name, locationId: c.room, minParticipants: 2, effects: { magic: 25, energy: 20, social: 20 }, coins: 25, xp: 20, lootItemId: gems[i % gems.length] };
  });
  const moonRoom = config.moonRoom ?? (locations.some((l) => l.id === preset.moonRoom) ? preset.moonRoom : ceremonies[0]?.room ?? locations[0].id);
  sharedEvents.full_moon = { name: "Full Moon Ceremony", locationId: moonRoom, minParticipants: 2, effects: { magic: 40, social: 30, joy: 20 }, coins: 60, xp: 40, lootItemId: fullMoonId, moonPhase: "full" };
  sharedEvents.new_moon = { name: "New Moon Intentions", locationId: moonRoom, minParticipants: 2, effects: { magic: 35, energy: 20, social: 25 }, coins: 50, xp: 35, lootItemId: newMoonId, moonPhase: "new" };

  // ── witches ────────────────────────────────────────────────────────────
  const count = config.witches?.count ?? 5;
  const defaultPronouns = config.witches?.defaultPronouns ?? "they";
  const slots = config.witches?.slots ?? [];
  const witchIds = new Set<string>();
  const wear = (slot: keyof typeof SLOT_PREFIX, i: number) => items.filter((it) => it.slot === slot)[i % WARDROBE_STYLES[slot].length].id;
  const characters: CharacterDef[] = Array.from({ length: count }, (_, i) => {
    const slot = slots[i] ?? {};
    const name = slot.name?.trim() || preset.witchNames[i % preset.witchNames.length];
    const equipped: Equipped = { outfit: wear("outfit", i), hat: wear("hat", i), boots: wear("boots", i), companion: familiarIds[i % familiarIds.length] };
    if (i % 2 === 0) equipped.necklace = wear("necklace", i);
    if (i % 3 === 1) equipped.hair_acc = wear("hair_acc", i);
    const starter = new Set<string>([...Object.values(equipped) as string[], wear("hat", i + 2), furnitureIds[i % furnitureIds.length], decorIds[i % decorIds.length]]);
    return {
      id: witchId(name, witchIds),
      name,
      title: slot.title?.trim() || preset.titles[i % preset.titles.length],
      pronouns: PRONOUNS[slot.pronouns ?? defaultPronouns],
      young: slot.young === true,
      isOwnerCharacter: i === 0,
      description: `A witch of ${config.coven.name.trim()}.`,
      personality: "",
      look: {
        skin: SKINS[(i * 3) % SKINS.length],
        hairColor: HAIRS[(i * 5 + 1) % HAIRS.length],
        hairStyle: HAIR_STYLES[i % HAIR_STYLES.length],
        eyeColor: EYES[i % EYES.length],
        freckles: i % 3 === 2,
        familiarColour: preset.familiarColours[i % preset.familiarColours.length],
        familiarAcc: FAMILIAR_ACCESSORIES[(i % (FAMILIAR_ACCESSORIES.length - 1)) + 1],
      },
      equipped,
      starterItems: [...starter],
    };
  });

  // ── the rest ───────────────────────────────────────────────────────────
  const flavour = {
    ...preset.flavour,
    ...(config.flavour ?? {}),
    moods: { ...preset.flavour.moods, ...(config.flavour?.moods ?? {}) },
  };

  return {
    meta: {
      name: config.coven.name.trim(),
      tagline: config.coven.tagline?.trim() ?? preset.coven.tagline,
      slug: config.coven.slug ?? (slugify(config.coven.name, "-").replace(/^[^a-z]+/, "") || "pocket-coven"),
      preset: preset.id,
      timezone: config.timezone ?? "UTC",
      currency,
      palette,
      displayFont: preset.displayFont,
      motif: config.motif ?? preset.motif,
      chrome: opts.chrome ?? DEFAULT_CHROME,
      flavour,
      startLocation: locations[0].id,
    },
    characters,
    items,
    locations,
    activities,
    sharedEvents,
    achievements: ACHIEVEMENT_LIBRARY.map((a) => ({ id: a.id, name: a.name, description: a.description.replace("{currency}", currency.plural) })),
    giftTreats: preset.treats.map((t) => ({ id: t.id, name: t.name, cost: t.cost, effects: t.effects, art: { style: t.style, colours: [palette.accent, palette.glow] } })),
    covenGoals: (["nourish", "rituals", "gifts", "activities"] as const).map((kind) => ({ kind, ...preset.goals[kind] })),
    covenGoalReward: { coins: 40, itemId: charmId },
    oracleCards: ORACLE_DECK.map((c) => ({ ...c })),
    gameConfig: {
      decay_per_hour: { nourishment: 4, energy: 3, joy: 3, magic: 2, social: 3 },
      decay_floor: 10,
      decay_max_hours: 72,
      daily_coins: 30,
      daily_loot: tier("forage").map((c) => collectibleId.get(c)!),
      gift_daily_limit: 12,
      starting_coins: 120,
      chat_rate_limit: { messages: 5, seconds: 10 },
      visit_social_bonus: 10,
    },
  };
}
