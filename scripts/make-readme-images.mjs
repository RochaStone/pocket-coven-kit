#!/usr/bin/env node
// Renders every README image from the kit itself: the pocket-coven.exe hero (painted map and room, 1600 x 900), the motif triptych,
// one room per theme preset, and the tiny pixel badges and dividers. Needs a production build running
// (scripts/make-readme-images.sh starts one) and Google Chrome or Chromium installed.
//   node scripts/make-readme-images.mjs [base-url]
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] ?? "http://localhost:3917").replace(/\/$/, "");
const OUT = path.join(ROOT, "docs/img");
mkdirSync(path.join(OUT, "presets"), { recursive: true });

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
].filter(Boolean);
const executablePath = CHROME_PATHS.find((p) => existsSync(p));

const browser = await chromium.launch({ executablePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
// The hero is drawn at its final size (1600 x 900), so it renders at 1x.
const heroPage = await browser.newPage({ viewport: { width: 1700, height: 1000 }, deviceScaleFactor: 1, reducedMotion: "reduce" });

async function shot(route, file, on = page) {
  await on.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await on.evaluate(() => document.fonts.ready);
  await on.locator("#shot").screenshot({ path: path.join(OUT, file), animations: "disabled" });
  process.stdout.write(`  docs/img/${file}\n`);
}

await shot("/gallery/hero", "hero.png", heroPage);
await shot("/gallery/triptych", "triptych.png");
for (const id of ["hedge-witch", "moon-coven", "kitchen-witch", "sea-witch", "city-witch"]) await shot(`/gallery/presets/${id}`, `presets/${id}.png`);
await browser.close();

// Pixel step badges (01 to 05) and a gold pixel divider, as tiny hand-built SVGs.
const DIGITS = {
  0: ["111", "101", "101", "101", "111"], 1: ["010", "110", "010", "010", "111"], 2: ["111", "001", "111", "100", "111"],
  3: ["111", "001", "111", "001", "111"], 4: ["101", "101", "111", "001", "001"], 5: ["111", "100", "111", "001", "111"],
};
const px = (rows, ox, oy, s, fill) => rows.flatMap((r, y) => [...r].map((c, x) => (c === "1" ? `<rect x="${ox + x * s}" y="${oy + y * s}" width="${s}" height="${s}" fill="${fill}"/>` : ""))).join("");
for (let n = 1; n <= 5; n++) {
  const d = String(n).padStart(2, "0");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="28" viewBox="0 0 44 28"><rect width="44" height="28" fill="#50163C"/><rect x="2" y="2" width="40" height="24" fill="none" stroke="#E9B949" stroke-width="2"/>${px(DIGITS[d[0]], 10, 7, 3, "#FFF7F4")}${px(DIGITS[d[1]], 23, 7, 3, "#FFF7F4")}</svg>`;
  writeFileSync(path.join(OUT, `step-${d}.svg`), svg);
}
const dots = Array.from({ length: 60 }, (_, i) => `<rect x="${i * 8}" y="${i % 2 ? 2 : 0}" width="4" height="2" fill="#E9B949"/>`).join("");
writeFileSync(path.join(OUT, "divider.svg"), `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="4" viewBox="0 0 480 4">${dots}</svg>`);
const heart = ["01010", "11111", "11111", "01110", "00100"];
writeFileSync(path.join(OUT, "heart.svg"), `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15">${px(heart, 0, 0, 3, "#E9B949")}</svg>`);
process.stdout.write("  docs/img/step-01..05.svg, divider.svg, heart.svg\nDone.\n");
