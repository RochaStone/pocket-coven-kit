// npm run build:world  [path/to/coven.config.json]
// Reads coven.config.json, builds the world from its theme preset, checks it, then writes
// lib/game/catalog.ts and supabase/seed.sql. Nothing is written if anything is wrong.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildWorld } from "../world/build.ts";
import { catalogSource } from "../world/emit.ts";
import { loadPreset } from "../world/presets.ts";
import { ConfigError, parseConfig } from "../world/schema.ts";
import { chromeFromStyle, resolveStyle } from "../world/style.ts";
import { validateWorld } from "../world/validate.ts";
import { buildSeedSql } from "../lib/game/seed-sql.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.resolve(process.argv[2] ?? path.join(ROOT, "coven.config.json"));

function fail(msg: string): never {
  process.stderr.write(`\n${msg}\n\n`);
  process.exit(1);
}

if (!existsSync(configPath)) fail(`No config at ${path.relative(ROOT, configPath)}. Start one with: npm run new:world hedge-witch`);

let raw: unknown;
try {
  raw = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  fail(`${path.basename(configPath)} is not valid JSON: ${(e as Error).message}`);
}

try {
  const config = parseConfig(raw);
  const style = resolveStyle(process.cwd());
  const world = buildWorld(config, loadPreset(config.theme), { chrome: chromeFromStyle(style) });
  const problems = validateWorld(world);
  if (problems.length) fail(`The world did not pass its checks:\n- ${problems.join("\n- ")}`);
  writeFileSync(path.join(ROOT, "lib/game/catalog.ts"), catalogSource(world, path.basename(configPath)));
  writeFileSync(path.join(ROOT, "supabase/seed.sql"), buildSeedSql(world));
  const out = [
    `Built "${world.meta.name}" (${config.theme}).`,
    `  ${world.locations.length} rooms, ${world.activities.length} activities, ${Object.keys(world.sharedEvents).length} ceremonies`,
    `  ${world.characters.length} witches: ${world.characters.map((c) => c.name).join(", ")}`,
    `  ${world.items.length} items, currency: ${world.meta.currency.plural}`,
    `  compact chrome from ${path.relative(ROOT, style.source) || style.source}`,
    "Wrote lib/game/catalog.ts and supabase/seed.sql.",
  ];
  process.stdout.write(out.join("\n") + "\n");
} catch (e) {
  if (e instanceof ConfigError) fail(e.message);
  throw e;
}
