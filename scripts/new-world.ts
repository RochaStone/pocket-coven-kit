// npm run new:world <preset> [--force]
// Writes a starter coven.config.json from one of the five presets. Refuses to overwrite an existing config without --force.
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPreset, starterConfig } from "../world/presets.ts";
import { PRESET_IDS, type PresetId } from "../world/schema.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const preset = args.find((a) => !a.startsWith("--")) as PresetId | undefined;
const force = args.includes("--force");
const out = path.join(ROOT, "coven.config.json");

if (!preset || !PRESET_IDS.includes(preset)) {
  process.stderr.write(`Choose a preset: ${PRESET_IDS.join(", ")}\n  npm run new:world hedge-witch\n`);
  process.exit(1);
}
if (existsSync(out) && !force) {
  process.stderr.write("coven.config.json already exists. Add --force to replace it.\n");
  process.exit(1);
}
writeFileSync(out, JSON.stringify(starterConfig(loadPreset(preset)), null, 2) + "\n");
process.stdout.write(`Wrote coven.config.json from the ${preset} preset. Edit it, then run: npm run build:world\n`);
