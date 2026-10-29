// The painted world: the theme switch, a painting for every room, hotspot checks, the hotspot placer,
// the art budget, and a scan of every shipped file for private names.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createElement, type FC } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArtProvider } from "@/components/art/ArtContext";
import { Scene } from "@/components/art/Backdrop";
import { MapView } from "@/components/art/MapView";
import { LOCATIONS, WORLD } from "@/lib/game/catalog";
import type { World } from "@/lib/game/types";
import { buildWorld } from "@/world/build";
import { MAP_SPOTS, PAINTED_MAP, PAINTINGS, paintedStarterConfig, pictureUrl } from "@/world/painted";
import { loadAllPresets, starterConfig } from "@/world/presets";
import { ConfigError, PRESET_IDS, parseConfig } from "@/world/schema";
import { validateWorld } from "@/world/validate";

const ROOT = path.resolve(__dirname, "../..");
const presets = loadAllPresets();
const painted = () => JSON.parse(JSON.stringify(paintedStarterConfig()));
const build = (raw: unknown) => {
  const c = parseConfig(raw);
  return buildWorld(c, presets[c.theme]);
};
const problemsOf = (raw: unknown): string => {
  try {
    parseConfig(raw);
    return "";
  } catch (e) {
    if (e instanceof ConfigError) return e.problems.join(" ");
    throw e;
  }
};
// ArtProvider types its children as a prop; createElement passes them as the third argument.
const Provider = ArtProvider as unknown as FC<{ world: World }>;
const mapHtml = (w: World) => renderToStaticMarkup(createElement(Provider, { world: w }, createElement(MapView, { locations: w.locations })));

describe("the painted theme", () => {
  it("is what a fresh install starts with", () => {
    const shipped = JSON.parse(readFileSync(path.join(ROOT, "coven.config.json"), "utf8"));
    expect(shipped.art.theme).toBe("painted");
    expect(WORLD.art.theme).toBe("painted");
    expect(WORLD.art.map).toBe(`/world/painted/${PAINTED_MAP}.jpg`);
    for (const l of LOCATIONS) expect(l.painting, l.id).toMatch(/^\/world\/painted\/[a-z_-]+\.jpg$/);
  });

  it("builds a valid world with a painting and a map spot for every room", () => {
    const w = build(painted());
    expect(validateWorld(w)).toEqual([]);
    expect(w.locations).toHaveLength(8);
    for (const l of w.locations) {
      expect(l.painting, l.id).toBeTruthy();
      expect(w.meta.art.hotspots[l.id], l.id).toBeDefined();
    }
    expect(new Set(w.locations.map((l) => l.painting)).size).toBe(8);
  });

  it("switches to the flat drawn world with one key, and back", () => {
    const c = painted();
    c.art.theme = "flat";
    const flat = build(c);
    expect(validateWorld(flat)).toEqual([]);
    expect(flat.meta.art.theme).toBe("flat");
    for (const l of flat.locations) expect(l.painting).toBeUndefined();
    const flatMap = mapHtml(flat);
    expect(flatMap).not.toContain("<img");
    expect(flatMap).toContain("<svg");

    const paintedMap = mapHtml(build(painted()));
    expect(paintedMap).toContain('data-art="painted"');
    expect(paintedMap).toContain(`src="/world/painted/${PAINTED_MAP}.jpg"`);
    expect(paintedMap.match(/class="map-pin /g)).toHaveLength(8);
  });

  it("keeps the five presets and configs with no art block flat, as before", () => {
    for (const id of PRESET_IDS) expect(build(starterConfig(presets[id])).meta.art.theme, id).toBe("flat");
  });

  it("an art block with no theme means painted, with spots for every room", () => {
    const c = painted();
    c.art = {};
    const w = build(c);
    expect(w.meta.art.theme).toBe("painted");
    expect(w.meta.art.hotspots.deck).toEqual(MAP_SPOTS.moon_deck);
  });

  it("gives rooms without a painting one in order, and rooms off the map a spot of their own", () => {
    const c = painted();
    delete c.art.hotspots;
    for (const r of c.rooms) delete r.painting;
    c.rooms[1].painting = "studio";
    const w = build(c);
    expect(validateWorld(w)).toEqual([]);
    expect(w.locations[0].painting).toBe("/world/painted/palace.jpg");
    expect(w.locations[1].painting).toBe("/world/painted/studio.jpg");
    const spots = Object.values(w.meta.art.hotspots).map((s) => `${s.x},${s.y}`);
    expect(new Set(spots).size).toBe(spots.length);
  });

  it("lets a room use the founder's own picture from public/world/mine/", () => {
    const c = painted();
    c.rooms[0].painting = "mine/my-garden.jpg";
    c.art.map = "mine/my-map.png";
    const w = build(c);
    expect(w.locations[0].painting).toBe("/world/mine/my-garden.jpg");
    expect(w.meta.art.map).toBe("/world/mine/my-map.png");
  });
});

describe("a painted backdrop for every room", () => {
  const w = build(painted());
  for (const l of w.locations) {
    it(`${l.name} renders its painting, and the picture is in public/`, () => {
      const html = renderToStaticMarkup(createElement(Scene, { kind: l.backdrop, painting: l.painting, hotspots: [{ id: "a", label: "Brew", x: 50, y: 50 }] }));
      expect(html).toContain('data-art="painted"');
      expect(html).toContain(`src="${l.painting}"`);
      expect(html).toContain("aspect-[3/4]");
      expect(html).toContain("Brew");
      expect(existsSync(path.join(ROOT, "public", l.painting!))).toBe(true);
    });
  }

  it("every bundled painting and the map are in public/world/painted/", () => {
    for (const id of [...PAINTINGS, PAINTED_MAP]) expect(existsSync(path.join(ROOT, "public", pictureUrl(id))), id).toBe(true);
  });

  it("a flat room still draws its scene", () => {
    const html = renderToStaticMarkup(createElement(Scene, { kind: "cottage_room" }));
    expect(html).toContain('data-art="flat"');
    expect(html).not.toContain("<img");
  });
});

describe("hotspot and picture checks", () => {
  it("accepts the starter hotspots and percent positions", () => {
    expect(problemsOf(painted())).toBe("");
    const c = painted();
    c.art.hotspots.reef = { x: 0, y: 100 };
    expect(problemsOf(c)).toBe("");
  });

  it("rejects positions off the map, unknown rooms and the wrong shape", () => {
    const c = painted();
    c.art.hotspots.reef = { x: 120, y: 10 };
    c.art.hotspots.attic = { x: 10, y: 10 };
    const p = problemsOf(c);
    expect(p).toMatch(/art\.hotspots\.reef must be/);
    expect(p).toMatch(/"attic" is not one of your room ids/);
    expect(problemsOf({ ...painted(), art: { hotspots: [1, 2] } })).toMatch(/art\.hotspots must be an object/);
    expect(problemsOf({ ...painted(), art: { theme: "glitter" } })).toMatch(/art\.theme must be "painted" or "flat"/);
  });

  it("only takes bundled paintings or files in public/world/mine/", () => {
    for (const bad of ["../secret.jpg", "mine/../x.jpg", "https://example.com/a.jpg", "mine/a b.jpg", "mine/a.gif", "/world/painted/palace.jpg"]) {
      const c = painted();
      c.rooms[0].painting = bad;
      expect(problemsOf(c), bad).toMatch(/painting must be one of/);
      const m = painted();
      m.art.map = bad;
      expect(problemsOf(m), bad).toMatch(/art\.map must be/);
    }
  });
});

describe("the hotspot placer (scripts/place-hotspots.html)", () => {
  const html = readFileSync(path.join(ROOT, "scripts/place-hotspots.html"), "utf8");
  const logic = html.match(/<script id="hotspot-logic">([\s\S]*?)<\/script>/)?.[1] ?? "";
  const ctx: Record<string, unknown> = {};
  vm.runInNewContext(logic, ctx);
  const withHotspots = ctx.withHotspots as (c: unknown, s: Record<string, { x: number; y: number }>, m?: string) => Record<string, unknown>;
  const spotAt = ctx.spotAt as (x: number, y: number, w: number, h: number) => { x: number; y: number };

  it("is one file with no outside scripts, styles or uploads", () => {
    expect(logic.length).toBeGreaterThan(100);
    expect(html).not.toMatch(/<script[^>]+src=|<link[^>]+stylesheet|fetch\(|XMLHttpRequest|innerHTML/);
  });

  it("turns a click into a percent position on the map", () => {
    expect(spotAt(220, 584, 880, 1168)).toEqual({ x: 25, y: 50 });
    expect(spotAt(-5, 2000, 880, 1168)).toEqual({ x: 0, y: 100 });
  });

  it("saves a coven file that passes the kit's checks and builds", () => {
    const out = withHotspots(painted(), { bedchamber: { x: 30, y: 39.9 }, terrace: { x: 70, y: 25 } }, "my-map.jpg");
    expect(problemsOf(out)).toBe("");
    const art = (out as { art: { theme: string; map: string; hotspots: Record<string, unknown> } }).art;
    expect(art.theme).toBe("painted");
    expect(art.map).toBe("mine/my-map.jpg");
    expect(Object.keys(art.hotspots)).toEqual(["bedchamber", "terrace"]);
    expect(validateWorld(build(out))).toEqual([]);
  });

  it("asks for a plain file name for a map picture", () => {
    expect(() => withHotspots(painted(), {}, "my map (1).jpg")).toThrow(/Rename your map picture/);
  });
});

describe("what ships", () => {
  const listed = execFileSync("git", ["ls-files", "-co", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter((f) => f && existsSync(path.join(ROOT, f)) && !f.startsWith("dist/"));
  const hashes = new Set(
    readFileSync(path.join(ROOT, "tests/forbidden-content.txt"), "utf8")
      .split("\n")
      .filter((l) => l.startsWith("sha256:"))
      .map((l) => l.slice(7).trim()),
  );
  const sha = (s: string) => createHash("sha256").update(s.toLowerCase()).digest("hex");
  // The author's own name signs the README and the licences; every other hashed name or place must never ship.
  for (const author of ["rocha", "rochelle"]) hashes.delete(sha(author));

  it("no private name or place appears in any shipped file, its name, or its picture data", () => {
    expect(listed.length).toBeGreaterThan(100);
    const leaks: string[] = [];
    for (const f of listed) {
      const text = readFileSync(path.join(ROOT, f)).toString("latin1");
      for (const tok of new Set([...(f.match(/\p{L}+/gu) ?? []), ...(text.match(/\p{L}+/gu) ?? [])])) if (hashes.has(sha(tok))) leaks.push(f);
    }
    expect([...new Set(leaks)]).toEqual([]);
  });

  it("the default world copy never names her world", () => {
    const words = /\b(merwitch|rocheverse|rocha)\b/i;
    for (const f of ["coven.config.json", "lib/game/catalog.ts", "supabase/seed.sql", "world/painted.ts"]) expect(readFileSync(path.join(ROOT, f), "utf8"), f).not.toMatch(words);
  });
});

describe("the art budget", () => {
  // Reads a JPEG's size from its frame header and notes any metadata block (EXIF, XMP, comments).
  const jpeg = (buf: Buffer) => {
    let i = 2;
    let meta = false;
    while (i < buf.length) {
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker === 0xe1 || marker === 0xfe) meta = true;
      if (marker >= 0xc0 && marker <= 0xc2) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), meta };
      i += 2 + len;
    }
    throw new Error("no frame header");
  };
  const files = [...PAINTINGS, PAINTED_MAP].map((id) => path.join(ROOT, "public", pictureUrl(id)));

  it("each painting is a clean JPEG, 1600 px or less on the long side, 320 KB or less", () => {
    for (const f of files) {
      const buf = readFileSync(f);
      expect(buf.subarray(0, 2).toString("hex"), f).toBe("ffd8");
      const { w, h, meta } = jpeg(buf);
      expect(Math.max(w, h), f).toBeLessThanOrEqual(1600);
      expect(meta, `${f} carries metadata`).toBe(false);
      expect(buf.length, f).toBeLessThanOrEqual(320 * 1024);
    }
  });

  it("the whole painted set stays under 4 MB", () => {
    const total = files.reduce((n, f) => n + statSync(f).size, 0);
    expect(total).toBeLessThanOrEqual(4 * 1024 * 1024);
  });
});
