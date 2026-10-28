import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildSeedSql } from "@/lib/game/seed-sql";
import { BACKDROPS, SLOTS, type ThemePalette } from "@/lib/game/types";
import { buildWorld } from "@/world/build";
import { ACTIVITY_LIBRARY, ORACLE_DECK } from "@/world/library";
import { loadAllPresets, starterConfig } from "@/world/presets";
import { ConfigError, PRESET_IDS, parseConfig } from "@/world/schema";
import { flavourProblems, validateWorld } from "@/world/validate";

const presets = loadAllPresets();
const base = () => JSON.parse(JSON.stringify(starterConfig(presets["hedge-witch"])));
const problemsOf = (raw: unknown): string[] => {
  try {
    parseConfig(raw);
    return [];
  } catch (e) {
    if (e instanceof ConfigError) return e.problems;
    throw e;
  }
};

describe("theme presets", () => {
  it("there are exactly five, all witchy", () => {
    expect(Object.keys(presets).sort()).toEqual([...PRESET_IDS].sort());
  });

  for (const id of PRESET_IDS) {
    describe(id, () => {
      const preset = presets[id];
      const world = buildWorld(parseConfig(starterConfig(preset)), preset);
      const seed = buildSeedSql(world);

      it("builds a valid catalog", () => {
        expect(validateWorld(world)).toEqual([]);
      });
      it("ships 6 rooms, 14 activities, 2 ceremonies plus the full and new moon", () => {
        expect(world.locations).toHaveLength(6);
        expect(world.activities).toHaveLength(14);
        expect(Object.keys(world.sharedEvents)).toHaveLength(4);
        for (const l of world.locations) expect(BACKDROPS).toContain(l.backdrop);
      });
      it("offers 30+ wearables across all seven slots, painted from its own palette", () => {
        const wearables = world.items.filter((i) => i.slot);
        expect(wearables.length).toBeGreaterThanOrEqual(30);
        for (const slot of SLOTS) expect(wearables.some((i) => i.slot === slot), slot).toBe(true);
        const hexes = new Set(preset.wardrobeColours.map((c) => c.hex.toLowerCase()));
        for (const w of wearables.filter((i) => i.slot === "outfit")) expect(hexes.has(w.art.colours[0].toLowerCase())).toBe(true);
      });
      it("has a complete palette of hex colours", () => {
        const keys: (keyof ThemePalette)[] = ["ground", "groundDeep", "paper", "ink", "accent", "alt", "mystic", "coin", "warn", "sky", "skyDeep", "wall", "wallDeep", "floor", "wood", "leaf", "leafDeep", "water", "stone", "glow"];
        for (const k of keys) expect(preset.palette[k], k).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
      it("builds a seed with every room, activity and witch", () => {
        for (const l of world.locations) expect(seed).toContain(`'${l.id}'`);
        for (const a of world.activities) expect(seed).toContain(`'${a.id}'`);
        for (const c of world.characters) expect(seed).toContain(`select game.init_character('${c.id}')`);
        expect(seed.trim().endsWith("commit;")).toBe(true);
      });
      it("keeps its flavour pronoun-neutral", () => {
        for (const line of [...Object.values(preset.flavour.moods), preset.flavour.joined, preset.flavour.welcome]) expect(flavourProblems(line), line).toEqual([]);
      });
    });
  }

  it("the Sea Witch is its own world: no shells, no pearls", () => {
    const text = readFileSync(path.resolve(__dirname, "../../world/presets/sea-witch.json"), "utf8");
    expect(text).not.toMatch(/shell|pearl|mermaid|lagoon/i);
  });

  it("every library flavour line and oracle card is pronoun-neutral", () => {
    for (const a of ACTIVITY_LIBRARY) for (const f of a.flavour) expect(flavourProblems(f), `${a.id}: ${f}`).toEqual([]);
    for (const c of ORACLE_DECK) expect(c.message).not.toMatch(/\b(she|her|he|him|his)\b/i);
  });
});

describe("coven.config.json schema", () => {
  it("accepts every preset's starter config", () => {
    for (const id of PRESET_IDS) expect(problemsOf(starterConfig(presets[id]))).toEqual([]);
  });

  it("rejects a config with no rooms", () => {
    const c = base();
    delete c.rooms;
    expect(problemsOf(c).join(" ")).toMatch(/rooms is required/);
    expect(problemsOf({ ...base(), rooms: [] }).join(" ")).toMatch(/rooms is required/);
  });

  it("rejects a missing room that a ceremony points at", () => {
    const c = base();
    c.rooms = c.rooms.filter((r: { id: string }) => r.id !== "ring");
    expect(problemsOf(c).join(" ")).toMatch(/room "ring" is not one of your room ids/);
  });

  it("rejects too few or too many rooms", () => {
    expect(problemsOf({ ...base(), rooms: base().rooms.slice(0, 3) }).join(" ")).toMatch(/4 to 8 rooms/);
  });

  it("rejects a config with no currency, or a currency that is not a word", () => {
    const c = base();
    delete c.currency;
    expect(problemsOf(c).join(" ")).toMatch(/currency is required/);
    expect(problemsOf({ ...base(), currency: { singular: "acorn" } }).join(" ")).toMatch(/currency\.plural/);
    expect(problemsOf({ ...base(), currency: { singular: "<b>", plural: "x" } }).join(" ")).toMatch(/currency\.singular/);
  });

  it("rejects unknown activities, presets, familiars, time zones and witch counts", () => {
    const c = base();
    c.rooms[0].activities = ["nap", "summon_dragon"];
    expect(problemsOf(c).join(" ")).toMatch(/"summon_dragon" is not in the activity library/);
    expect(problemsOf({ ...base(), theme: "mermaid" }).join(" ")).toMatch(/theme must be one of/);
    expect(problemsOf({ ...base(), familiars: ["cat", "dragon"] }).join(" ")).toMatch(/"dragon" is not a familiar/);
    expect(problemsOf({ ...base(), timezone: "Atlantis/Lost" }).join(" ")).toMatch(/not a real time zone/);
    expect(problemsOf({ ...base(), witches: { count: 13 } }).join(" ")).toMatch(/witches\.count/);
  });

  it("rejects duplicate room ids and rooms with one activity", () => {
    const c = base();
    c.rooms[1].id = c.rooms[0].id;
    c.rooms[2].activities = ["nap"];
    const p = problemsOf(c).join(" ");
    expect(p).toMatch(/already uses the id/);
    expect(p).toMatch(/2 to 6 activities/);
  });
});

describe("the world builder", () => {
  it("carries a founder's own names, flavour, palette and currency all the way to the seed", () => {
    const c = base();
    c.coven.name = "The Bramble Coven";
    c.currency = { singular: "button", plural: "buttons" };
    c.palette = { accent: "#123456" };
    c.rooms[0].activities = [{ id: "nap", name: "Doze in the hammock", flavour: ["{name} dozed and {their} familiar kept watch."] }, "herbal_tea"];
    const w = buildWorld(parseConfig(c), presets["hedge-witch"]);
    expect(validateWorld(w)).toEqual([]);
    const nap = w.activities.find((a) => a.id === "cottage_nap")!;
    expect(nap.name).toBe("Doze in the hammock");
    expect(nap.flavour).toEqual(["{name} dozed and {their} familiar kept watch."]);
    expect(w.meta.palette.accent).toBe("#123456");
    expect(w.achievements.find((a) => a.id === "hoarder")!.description).toBe("Hold 300 buttons at once.");
    const seed = buildSeedSql(w);
    expect(seed).toContain("'The Bramble Coven'");
    expect(seed).toContain('{"singular":"button","plural":"buttons"}');
  });

  it("gives every witch a unique id, even with matching names", () => {
    const c = { ...base(), witches: { count: 4, slots: [{ name: "Ivy" }, { name: "Ivy" }, { name: "Ivy-Rose" }, { name: "Ívy" }] } };
    const w = buildWorld(parseConfig(c), presets["city-witch"]);
    const ids = w.characters.map((x) => x.id);
    expect(new Set(ids).size).toBe(4);
    for (const id of ids) expect(id).toMatch(/^[a-z]{2,20}$/);
    expect(validateWorld(w)).toEqual([]);
  });

  it("applies the default pronouns and marks young witches", () => {
    const c = { ...base(), witches: { count: 3, defaultPronouns: "she", slots: [{}, { pronouns: "they" }, { young: true }] } };
    const w = buildWorld(parseConfig(c), presets["moon-coven"]);
    expect(w.characters.map((x) => x.pronouns.subject)).toEqual(["she", "they", "she"]);
    expect(w.characters.map((x) => x.young)).toEqual([false, false, true]);
  });

  it("refuses flavour that hard-codes a gender", () => {
    const c = base();
    c.flavour = { moods: { happy: "{name} is happy and she knows it." } };
    const w = buildWorld(parseConfig(c), presets["hedge-witch"]);
    expect(validateWorld(w).join(" ")).toMatch(/hard-coded gendered pronoun/);
  });
});
