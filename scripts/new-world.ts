// npm run new:world <painted|preset> [--force]
// Writes a starter coven.config.json: the painted world (what a fresh install starts with) or one of the five flat presets. Refuses to overwrite an existing config without --force.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { paintedStarterConfig } from "../world/painted.ts";
import { loadPreset, starterConfig } from "../world/presets.ts";
import { PRESET_IDS, type PresetId } from "../world/schema.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const preset = args.find((a) => !a.startsWith("--")) as PresetId | "painted" | undefined;
const force = args.includes("--force");
const out = path.join(ROOT, "coven.config.json");

if (!preset || (preset !== "painted" && !PRESET_IDS.includes(preset))) {
  process.stderr.write(`Choose a world: painted, ${PRESET_IDS.join(", ")}\n  npm run new:world painted\n`);
  process.exit(1);
}
if (existsSync(out) && !force) {
  process.stderr.write("coven.config.json already exists. Add --force to replace it.\n");
  process.exit(1);
}
const config = preset === "painted" ? paintedStarterConfig() : starterConfig(loadPreset(preset));
writeFileSync(out, JSON.stringify(config, null, 2) + "\n");
process.stdout.write(`Wrote coven.config.json from the ${preset} world. Edit it, then run: npm run build:world\n`);
