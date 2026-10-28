import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATALOG, CHARACTERS } from "@/lib/game/catalog";
import { buildSeedSql } from "@/lib/game/seed-sql";
import { levelFor, moodFromStats, moodLine, projectStats, renderFlavour, xpForLevel } from "@/lib/game/logic";
import { PRONOUNS, buildWorld } from "@/world/build";
import { loadPreset } from "@/world/presets";
import { parseConfig } from "@/world/schema";
import { validateWorld } from "@/world/validate";

const ROOT = path.resolve(__dirname, "../..");

describe("the committed world", () => {
  it("passes every integrity check", () => {
    expect(validateWorld(CATALOG)).toEqual([]);
  });

  it("matches coven.config.json (run npm run build:world after editing the config)", () => {
    const config = parseConfig(JSON.parse(readFileSync(path.join(ROOT, "coven.config.json"), "utf8")));
    const fresh = buildWorld(config, loadPreset(config.theme), { chrome: CATALOG.meta.chrome });
    expect(JSON.parse(JSON.stringify(CATALOG))).toEqual(JSON.parse(JSON.stringify(fresh)));
  });

  it("committed supabase/seed.sql matches the catalog", () => {
    expect(readFileSync(path.join(ROOT, "supabase/seed.sql"), "utf8")).toBe(buildSeedSql(CATALOG));
  });

  it("has exactly one owner witch, and she is the first", () => {
    expect(CHARACTERS.filter((c) => c.isOwnerCharacter).map((c) => c.id)).toEqual([CHARACTERS[0].id]);
  });
});

describe("pronouns", () => {
  it("they/them reads naturally, with verb agreement following the pronoun", () => {
    const t = "{name} {has} finished {their} tea and {is} glad. {They} {are} thriving.";
    expect(renderFlavour(t, "Bea", PRONOUNS.they)).toBe("Bea has finished their tea and is glad. They are thriving.");
    expect(renderFlavour(t, "Ada", PRONOUNS.she)).toBe("Ada has finished her tea and is glad. She is thriving.");
    expect(renderFlavour(t, "Cass", PRONOUNS.he)).toBe("Cass has finished his tea and is glad. He is thriving.");
  });

  it("mood lines in every preset respect pronouns", () => {
    for (const id of ["hedge-witch", "moon-coven", "kitchen-witch", "sea-witch", "city-witch"] as const) {
      const moods = loadPreset(id).flavour.moods;
      expect(moodLine("Bea", PRONOUNS.they, "offended", moods), id).toContain("their");
      expect(moodLine("Ada", PRONOUNS.she, "offended", moods), id).toContain("her");
      for (const line of Object.values(moods)) expect(line, id).not.toMatch(/\{(?!name\}|they\}|them\}|their\}|They\}|Their\}|is\}|has\}|are\})/);
    }
  });
});

describe("rules", () => {
  it("moods", () => {
    expect(moodFromStats({ nourishment: 70, energy: 70, joy: 70, magic: 70, social: 70 })).toBe("happy");
    expect(moodFromStats({ nourishment: 20, energy: 70, joy: 70, magic: 70, social: 70 })).toBe("hungry");
    expect(moodFromStats({ nourishment: 10, energy: 10, joy: 10, magic: 10, social: 10 })).toBe("offended");
    expect(moodFromStats({ nourishment: 90, energy: 90, joy: 90, magic: 90, social: 90 })).toBe("magical");
  });
  it("decay never goes below the floor and never kills", () => {
    const s = projectStats({ nourishment: 100, energy: 100, joy: 100, magic: 100, social: 100 }, new Date(0), new Date(), CATALOG.gameConfig);
    for (const v of Object.values(s)) expect(v).toBeGreaterThanOrEqual(CATALOG.gameConfig.decay_floor);
  });
  it("levels", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(40)).toBe(2);
    expect(xpForLevel(levelFor(500))).toBeLessThanOrEqual(500);
  });
});
