// The fixed world the database tests run against, independent of whatever coven.config.json says.
import { readFileSync } from "node:fs";
import path from "node:path";
import { buildWorld } from "@/world/build.ts";
import { loadPreset } from "@/world/presets.ts";
import { parseConfig } from "@/world/schema.ts";

const config = parseConfig(JSON.parse(readFileSync(path.join(__dirname, "test-world.json"), "utf8")));
export const TEST_WORLD = buildWorld(config, loadPreset(config.theme));
export const item = (id: string) => {
  const it = TEST_WORLD.items.find((i) => i.id === id);
  if (!it) throw new Error(`no item ${id}`);
  return it;
};
export const witch = (id: string) => TEST_WORLD.characters.find((c) => c.id === id)!;
