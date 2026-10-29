// The starter witch: a fresh install's first witch is the mer-witch, drawn with the original mer-witch figure
// (components/art/mer, ported line for line), and every piece of her stays editable through coven.config.json.
import { createHash } from "node:crypto";
import { createElement, type FC } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArtProvider } from "@/components/art/ArtContext";
import { MiniWitch, Witch } from "@/components/art/Witch";
import { CHARACTERS } from "@/lib/game/catalog";
import type { World } from "@/lib/game/types";
import { buildWorld } from "@/world/build";
import { paintedStarterConfig } from "@/world/painted";
import { loadAllPresets, starterConfig } from "@/world/presets";
import { ConfigError, PRESET_IDS, parseConfig } from "@/world/schema";
import { validateWorld } from "@/world/validate";

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
const styleOf = (w: World, id?: string) => w.items.find((i) => i.id === id)?.art.style;
const Provider = ArtProvider as unknown as FC<{ world: World }>;
const draw = (w: World, i = 0, mood: "happy" | "magical" | "thriving" | "sleepy" = "happy", companion = true) => {
  const c = w.characters[i];
  const equipped = companion ? c.equipped : { ...c.equipped, companion: undefined };
  return renderToStaticMarkup(createElement(Provider, { world: w }, createElement(Witch, { look: c.look, equipped, mood, size: 1000, animate: false })));
};
// Every shape she is drawn with, ids and labels set aside: a fingerprint of the drawing itself.
const fingerprint = (svg: string) => {
  const s = svg.replace(/<style>[\s\S]*?<\/style>|<title>[\s\S]*?<\/title>/g, "").replace(/(id|clip-path|fill|stroke)="(url\(#)?pc[^")]*?(-[a-z0-9]+)?\)?"/g, (_m, a: string, _u: string, tail?: string) => `${a}="ID${tail ?? ""}"`);
  const shapes = [...s.matchAll(/<(path|circle|ellipse|rect|stop)\b([^>]*)>/g)].map((m) => m[1] + m[2]).sort();
  return createHash("sha256").update(shapes.join("\n")).digest("hex").slice(0, 16);
};
const SIGNATURE = { outfit: "mer_tail", hat: "crown", necklace: "pearls", earrings: "fins", hair_acc: "shell_clip" } as const;

describe("the starter witch", () => {
  it("is the mer-witch, the owner's witch, in a fresh install", () => {
    const me = CHARACTERS[0];
    expect(me.name).toBe("the mer-witch");
    expect(me.isOwnerCharacter).toBe(true);
    expect(me.look).toMatchObject({ hairColor: "#ff8fc8", hairStyle: "long_waves", eyeColor: "#8a4fe0", skin: "#f9d6c3" });
  });

  it("wears the tail, crown, pearls, fin ears and shell clip, and owns each piece", () => {
    const w = build(painted());
    expect(validateWorld(w)).toEqual([]);
    const me = w.characters[0];
    for (const [slot, style] of Object.entries(SIGNATURE)) {
      const id = me.equipped[slot as keyof typeof SIGNATURE];
      expect(styleOf(w, id), slot).toBe(style);
      expect(me.starterItems).toContain(id);
    }
  });

  it("is drawn with the original mer-witch figure: tail, crown, pearls, fin ears, shell clip", () => {
    const html = draw(build(painted()));
    expect(html).toContain('data-figure="mer"');
    expect(html).toContain('viewBox="0 0 200 260"');
    expect(html).toContain('fill="#f2cd78"'); // the crown's gold
    expect(html).toContain('fill="#ffd9ea"'); // the shell clip
    expect(html).toContain('fill="#ffc4e6"'); // fin ears
    expect((html.match(/fill="#fffaf6"/g) ?? []).length).toBeGreaterThanOrEqual(11); // a strand of pearls
    expect(html).toContain('stop-color="#7fe3e0"'); // the tail fading to aqua
    expect(html).not.toContain('fill="#3a3040"'); // no legs under the tail
  });

  // Fingerprints of her drawing in four moods. They were taken after checking, shape by shape, that the kit draws
  // exactly what the original draws (the only difference: four gradient stops the original defines and never uses),
  // that the same fingerprint comes from the original SVG, and that a render overlays the original PNGs to within
  // 0.2% of pixels (the original's own SVG overlays them to the same 0.2%). If one changes, she no longer matches.
  const PRINTS = { happy: "1f96b9593c234bb1", magical: "5ab8771a55c5a745", thriving: "b4443acd59d9458d", sleepy: "0d63043818574fd2" } as const;
  for (const mood of Object.keys(PRINTS) as (keyof typeof PRINTS)[]) {
    it(`draws exactly as the original when ${mood}`, () => {
      expect(fingerprint(draw(build(painted()), 0, mood, false))).toBe(PRINTS[mood]);
    });
  }

  it("each mood carries its own face: sparkles, stars, hearts, closed eyes and Z's", () => {
    const w = build(painted());
    expect(draw(w, 0, "magical")).toContain("pcw-orbit");
    expect(draw(w, 0, "thriving")).toContain("pcw-float");
    expect(draw(w, 0, "sleepy")).toContain("pcw-z");
  });

  it("her mini portrait for the map and chat is the same figure, cropped", () => {
    const w = build(painted());
    const c = w.characters[0];
    const html = renderToStaticMarkup(createElement(Provider, { world: w }, createElement(MiniWitch, { look: c.look, equipped: c.equipped, mood: "happy", size: 48 })));
    expect(html).toContain('data-figure="mer"');
    expect(html).toContain('viewBox="24 14 152 152"');
  });

  it("the other witches start as ordinary witches", () => {
    const w = build(painted());
    for (const c of w.characters.slice(1)) expect(styleOf(w, c.equipped.outfit)).not.toBe("mer_tail");
    expect(draw(w, 1)).toContain('fill="#3a3040"');
  });

  it("the signature pieces join the wardrobe for everyone, and never appear in the drawn presets", () => {
    const w = build(painted());
    for (const style of Object.values(SIGNATURE)) expect(w.items.some((i) => i.art.style === style), style).toBe(true);
    for (const id of PRESET_IDS) {
      const p = build(starterConfig(presets[id]));
      for (const style of Object.values(SIGNATURE)) expect(p.items.some((i) => i.art.style === style), `${id} ${style}`).toBe(false);
    }
  });
});

describe("making her your own", () => {
  it("renames her, recolours her tail and swaps her crown for a pointed hat", () => {
    const c = painted();
    const me = c.witches.slots[0];
    me.name = "Coral";
    me.look.hairColor = "#2a1f1a";
    me.wear.outfit = { style: "mer_tail", colours: ["#3FB8B0", "#B9B3F5"], name: "Lagoon Tail" };
    me.wear.hat = "pointed";
    const w = build(c);
    expect(validateWorld(w)).toEqual([]);
    const witch = w.characters[0];
    expect(witch.name).toBe("Coral");
    expect(witch.look.hairColor).toBe("#2a1f1a");
    const tail = w.items.find((i) => i.id === witch.equipped.outfit)!;
    expect(tail.name).toBe("Lagoon Tail");
    expect(tail.art.colours).toEqual(["#3FB8B0", "#B9B3F5"]);
    expect(styleOf(w, witch.equipped.hat)).toBe("pointed");
    const html = draw(w);
    expect(html).toContain('stop-color="#B9B3F5"');
    expect(html).toContain('data-figure="mer"');
  });

  it("keeps her figure with other hair styles and kit pieces, and gives her legs again in a dress", () => {
    const c = painted();
    c.witches.slots[0].look.hairStyle = "buns";
    c.witches.slots[0].wear.hat = "pointed";
    c.witches.slots[0].wear.necklace = "moon_pendant";
    const w = build(c);
    expect(validateWorld(w)).toEqual([]);
    const html = draw(w);
    expect(html).toContain('data-figure="mer"');
    expect(html).not.toContain('fill="#f2cd78"'); // the crown is off
    c.witches.slots[0].wear.outfit = "gown";
    const dressed = draw(build(c));
    expect(dressed).not.toContain('data-figure="mer"');
    expect(dressed).toContain('fill="#3a3040"');
  });

  it("lets any witch in any world wear a signature piece", () => {
    const c = starterConfig(presets["hedge-witch"]) as Record<string, unknown>;
    c.witches = { count: 3, slots: [{ name: "Bramble", wear: { hat: "crown", earrings: { style: "fins", colours: ["#5f7a43", "#ffffff"] } } }] };
    const w = build(c);
    expect(validateWorld(w)).toEqual([]);
    expect(styleOf(w, w.characters[0].equipped.hat)).toBe("crown");
  });

  it("explains a wrong look or a piece that does not exist", () => {
    const c = painted();
    c.witches.slots[0].look.hairColor = "pink";
    c.witches.slots[0].look.hairStyle = "mohawk";
    c.witches.slots[0].wear.hat = "tiara";
    c.witches.slots[0].wear.cape = "cloak";
    c.witches.slots[0].wear.outfit = { style: "mer_tail", colours: ["#fff"] };
    const p = problemsOf(c);
    expect(p).toMatch(/look\.hairColor must be a hex colour/);
    expect(p).toMatch(/look\.hairStyle must be one of/);
    expect(p).toMatch(/wear\.hat: choose one of .*crown/);
    expect(p).toMatch(/"cape" is not a slot/);
    expect(p).toMatch(/wear\.outfit\.colours must be two hex colours/);
  });
});
