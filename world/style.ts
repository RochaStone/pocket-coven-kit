// Reads the shared Rocha Coded style.json. In this kit it styles only the README hero and the compact chrome
// (the case the world opens out of). The game's own colours come from the theme preset.
// Fallback order: ./style.json, then ~/.rocha-coded/style.json, then examples/style.rocha-coded.json.
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Chrome } from "../lib/game/types.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const BUNDLED_STYLE = path.join(ROOT, "examples/style.rocha-coded.json");

interface StyleFile {
  palette?: Record<string, string>;
  fonts?: Record<string, string>;
}

export interface ResolvedStyle {
  source: string;
  palette: Record<string, string>;
  fonts: Record<string, string>;
}

const HEX = /^#[0-9a-fA-F]{6}$/;

function read(file: string): StyleFile {
  return JSON.parse(readFileSync(file, "utf8")) as StyleFile;
}

export function resolveStyle(cwd = ROOT): ResolvedStyle {
  const candidates = [path.join(cwd, "style.json"), path.join(os.homedir(), ".rocha-coded", "style.json")];
  const bundled = read(BUNDLED_STYLE);
  const found = candidates.find((f) => existsSync(f));
  if (!found) return { source: BUNDLED_STYLE, palette: bundled.palette ?? {}, fonts: bundled.fonts ?? {} };
  const mine = read(found);
  // Inheritance rule: only palette and fonts may fall back to the bundled example, key by key.
  const palette = { ...bundled.palette };
  for (const [k, v] of Object.entries(mine.palette ?? {})) if (typeof v === "string" && HEX.test(v)) palette[k] = v;
  const fonts = { ...bundled.fonts, ...(mine.fonts ?? {}) };
  return { source: found, palette, fonts };
}

export function chromeFromStyle(s: Pick<ResolvedStyle, "palette" | "fonts">): Chrome {
  const p = s.palette;
  return {
    case: p.hero ?? p.plum ?? "#50163C",
    rim: p.gold ?? "#E9B949",
    lining: p.paper ?? "#FFF7F4",
    accent: p.accent ?? "#FE9DCA",
    ink: p.ink ?? "#3B1230",
    font: s.fonts.masthead ?? "Fraunces",
  };
}

// Used by tests and by tools that do not want to touch the file system.
export const DEFAULT_CHROME: Chrome = chromeFromStyle({
  palette: { hero: "#50163C", gold: "#E9B949", paper: "#FFF7F4", accent: "#FE9DCA", ink: "#3B1230" },
  fonts: { masthead: "Fraunces" },
});
