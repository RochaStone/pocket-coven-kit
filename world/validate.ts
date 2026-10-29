// Integrity checks for a built World. `npm run build:world` refuses to write a world that fails any of these,
// and the unit tests run them against every preset.
import { ANIMATIONS, SLOTS, STATS, type World } from "../lib/game/types.ts";

export const FLAVOUR_TOKENS = new Set(["{name}", "{they}", "{them}", "{their}", "{They}", "{Their}", "{is}", "{has}", "{are}"]);

// A flavour line must use only known tokens and never assume the acting witch's gender.
export function flavourProblems(line: string): string[] {
  const out: string[] = [];
  for (const tok of line.match(/\{[^}]+\}/g) ?? []) if (!FLAVOUR_TOKENS.has(tok)) out.push(`unknown token ${tok}`);
  if (/[.!?]\s+\{(they|them|their)\}/.test(line)) out.push("capitalise a sentence-initial pronoun ({They}/{Their})");
  if (/\b(she|her|hers|herself|he|him|his|himself)\b/i.test(line)) out.push("hard-coded gendered pronoun");
  return out;
}

export function validateWorld(w: World): string[] {
  const p: string[] = [];
  const itemIds = new Set(w.items.map((i) => i.id));
  const locIds = new Set(w.locations.map((l) => l.id));

  for (const [label, list] of [["item", w.items], ["activity", w.activities], ["room", w.locations], ["witch", w.characters]] as const) {
    const ids = (list as { id: string }[]).map((x) => x.id);
    if (new Set(ids).size !== ids.length) p.push(`duplicate ${label} ids`);
  }
  for (const c of w.characters) if (!/^[a-z]{2,20}$/.test(c.id)) p.push(`witch id "${c.id}" must be 2 to 20 lowercase letters`);
  for (const l of w.locations) if (!/^[a-z][a-z0-9_]{1,23}$/.test(l.id)) p.push(`room id "${l.id}" is not valid`);
  if (w.locations.length < 4 || w.locations.length > 8) p.push("a world needs 4 to 8 rooms");

  for (const a of w.activities) {
    if (!locIds.has(a.locationId)) p.push(`${a.id}: unknown room ${a.locationId}`);
    for (const l of a.loot ?? []) {
      if (!itemIds.has(l.itemId)) p.push(`${a.id}: loot ${l.itemId} does not exist`);
      if (!(l.chance > 0 && l.chance <= 1)) p.push(`${a.id}: loot chance out of range`);
    }
    for (const k of Object.keys(a.effects)) if (!(STATS as readonly string[]).includes(k)) p.push(`${a.id}: unknown stat ${k}`);
    if (!(ANIMATIONS as readonly string[]).includes(a.animation)) p.push(`${a.id}: unknown animation ${a.animation}`);
    if (a.spot.x < 0 || a.spot.x > 100 || a.spot.y < 0 || a.spot.y > 100) p.push(`${a.id}: hotspot off the scene`);
    if (a.flavour.length === 0) p.push(`${a.id}: needs at least one flavour line`);
    for (const f of a.flavour) for (const prob of flavourProblems(f)) p.push(`${a.id}: "${f}": ${prob}`);
  }
  if (w.meta.art.theme === "painted") {
    if (!w.meta.art.map) p.push("the painted world needs a map picture");
    for (const l of w.locations) {
      if (!l.painting) p.push(`${l.name}: the painted world needs a painting for every room`);
      const s = w.meta.art.hotspots[l.id];
      if (!s || s.x < 0 || s.x > 100 || s.y < 0 || s.y > 100) p.push(`${l.name}: needs a spot on the map`);
    }
  }
  for (const l of w.locations) {
    const n = w.activities.filter((a) => a.locationId === l.id).length;
    if (n < 2 || n > 6) p.push(`${l.name}: needs 2 to 6 activities (has ${n})`);
  }

  for (const c of w.characters) {
    for (const it of c.starterItems) if (!itemIds.has(it)) p.push(`${c.name}: starter item ${it} does not exist`);
    for (const [slot, id] of Object.entries(c.equipped)) {
      const item = w.items.find((i) => i.id === id);
      if (!(SLOTS as readonly string[]).includes(slot)) p.push(`${c.name}: unknown slot ${slot}`);
      if (item?.slot !== slot) p.push(`${c.name}: ${id} does not go in ${slot}`);
      if (!c.starterItems.includes(id!)) p.push(`${c.name}: wears ${id} without owning it`);
    }
  }
  if (w.characters.filter((c) => c.isOwnerCharacter).length !== 1) p.push("exactly one witch must be the owner's");
  if (w.characters.length < 2 || w.characters.length > 12) p.push("a coven has 2 to 12 witches");

  for (const i of w.items) {
    const wearable = ["outfit", "boots", "hat", "jewellery", "hair_acc", "companion"].includes(i.category);
    if (wearable && !i.slot) p.push(`${i.id}: wearables need a slot`);
    if (i.placeable && i.slot) p.push(`${i.id}: placeables cannot be worn`);
    if (i.price !== undefined && !(i.price > 0)) p.push(`${i.id}: price must be positive`);
  }
  for (const slot of SLOTS) {
    const n = w.items.filter((i) => i.slot === slot).length;
    if (n < 1) p.push(`no wearables for ${slot}`);
  }

  for (const [k, e] of Object.entries(w.sharedEvents)) {
    if (!locIds.has(e.locationId)) p.push(`ceremony ${k}: unknown room ${e.locationId}`);
    if (!itemIds.has(e.lootItemId)) p.push(`ceremony ${k}: reward ${e.lootItemId} does not exist`);
    if (e.minParticipants < 2) p.push(`ceremony ${k}: needs at least two witches`);
  }
  if (!w.sharedEvents.full_moon || !w.sharedEvents.new_moon) p.push("full and new moon ceremonies are missing");
  if (!itemIds.has(w.covenGoalReward.itemId)) p.push("coven goal reward does not exist");
  for (const id of w.gameConfig.daily_loot) if (!itemIds.has(id)) p.push(`daily gift ${id} does not exist`);
  if (w.gameConfig.daily_loot.length === 0) p.push("daily gift pool is empty");
  if (!locIds.has(w.meta.startLocation)) p.push("start room does not exist");

  for (const [k, line] of Object.entries(w.meta.flavour.moods)) for (const prob of flavourProblems(line)) p.push(`flavour.moods.${k}: ${prob}`);
  for (const k of ["joined", "ritualComplete", "dailyTitle", "dailyBody", "welcome"] as const) {
    for (const prob of flavourProblems(w.meta.flavour[k])) p.push(`flavour.${k}: ${prob}`);
  }
  return p;
}
