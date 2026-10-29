// The starter witch: a fresh install's first witch is the mer-witch, drawn by the kit's own Witch component,
// and every piece of her stays editable through coven.config.json.
import { createElement, type FC } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArtProvider } from "@/components/art/ArtContext";
import { Witch } from "@/components/art/Witch";
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
const draw = (w: World, i = 0) => {
  const c = w.characters[i];
  return renderToStaticMarkup(createElement(Provider, { world: w }, createElement(Witch, { look: c.look, equipped: c.equipped, mood: "happy", animate: false })));
};
const SIGNATURE = { outfit: "mer_tail", hat: "crown", necklace: "pearls", earrings: "fins", hair_acc: "shell_clip" } as const;

describe("the starter witch", () => {
  it("is the mer-witch, the owner's witch, in a fresh install", () => {
    const me = CHARACTERS[0];
    expect(me.name).toBe("the mer-witch");
    expect(me.isOwnerCharacter).toBe(true);
    expect(me.look).toMatchObject({ hairColor: "#F48CC4", hairStyle: "long_waves", eyeColor: "#7B4FD6", skin: "#F6D5C0" });
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

  it("is drawn by the kit's own Witch: a tail in place of legs and boots, a crown, pearls, fins and a shell", () => {
    const html = draw(build(painted()));
    expect(html).toContain("<linearGradient");
    expect(html).not.toContain('fill="#3a3040"'); // the legs under every other outfit
    expect(html).toContain('fill="#F0C86A"'); // the crown's gold
    expect(html).toContain('fill="#F48CC4"'); // her hair
    expect((html.match(/fill="#FFF7F4"/g) ?? []).length).toBeGreaterThan(8); // a strand of pearls
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
    expect(draw(w)).toContain('stop-color="#B9B3F5"');
  });

  it("can give her legs again by wearing a dress", () => {
    const c = painted();
    c.witches.slots[0].wear.outfit = "gown";
    const html = draw(build(c));
    expect(html).toContain('fill="#3a3040"');
    expect(html).not.toContain("<linearGradient");
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
