// Nothing from the original game may leak into what this kit generates or ships.
// tests/forbidden-content.txt lists the terms: plain lines match as whole words (ignoring case);
// "sha256:" lines are hashes of names and private ids, compared against every word in the output.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildSeedSql } from "@/lib/game/seed-sql";
import { buildWorld } from "@/world/build";
import { catalogSource } from "@/world/emit";
import { loadAllPresets, starterConfig } from "@/world/presets";
import { PRESET_IDS, parseConfig } from "@/world/schema";

const ROOT = path.resolve(__dirname, "../..");
const lines = readFileSync(path.join(ROOT, "tests/forbidden-content.txt"), "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));
const hashes = new Set(lines.filter((l) => l.startsWith("sha256:")).map((l) => l.slice(7)));
const plain = lines.filter((l) => !l.startsWith("sha256:"));
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const plainRes = plain.map((t) => ({ t, re: new RegExp(`(^|[^\\p{L}])${esc(t)}($|[^\\p{L}])`, "iu") }));
const sha = (s: string) => createHash("sha256").update(s.toLowerCase()).digest("hex");

function leaks(text: string, withHashes: boolean): string[] {
  const out = plainRes.filter(({ re }) => re.test(text)).map(({ t }) => t);
  if (withHashes) {
    const tokens = new Set([...(text.match(/[\p{L}']+/gu) ?? []), ...(text.match(/[A-Za-z0-9_.-]{4,}/g) ?? [])]);
    for (const tok of tokens) if (hashes.has(sha(tok)) || hashes.has(sha(tok.replace(/^[.'-]+|[.'-]+$/g, "")))) out.push("a hashed name or id");
  }
  return out;
}

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}

describe("forbidden content", () => {
  it("the list is loaded", () => {
    expect(plain.length).toBeGreaterThan(20);
    expect(hashes.size).toBeGreaterThan(5);
  });

  const presets = loadAllPresets();
  for (const id of PRESET_IDS) {
    it(`the ${id} preset generates nothing forbidden`, () => {
      const world = buildWorld(parseConfig(starterConfig(presets[id])), presets[id]);
      const text = catalogSource(world, "coven.config.json") + "\n" + buildSeedSql(world);
      expect(leaks(text, true)).toEqual([]);
    });
  }

  it("the committed catalog, seed, presets and library are clean", () => {
    for (const f of ["lib/game/catalog.ts", "supabase/seed.sql", "coven.config.json", "examples/demo.coven.config.json", "world/library.ts", ...PRESET_IDS.map((p) => `world/presets/${p}.json`)]) {
      expect(leaks(readFileSync(path.join(ROOT, f), "utf8"), true), f).toEqual([]);
    }
  });

  it("the app, art, engine and scripts never name her world", () => {
    const files = ["app", "components", "lib", "supabase", "scripts", "world"].flatMap((d) => walk(path.join(ROOT, d), [".ts", ".tsx", ".sql", ".mjs", ".css", ".json", ".html", ".toml"]));
    expect(files.length).toBeGreaterThan(20);
    for (const f of files) expect(leaks(readFileSync(f, "utf8"), false), path.relative(ROOT, f)).toEqual([]);
  });
});
