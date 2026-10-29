import { buildWorld } from "@/world/build";
import { paintedStarterConfig } from "@/world/painted";
import { PRESET_DATA } from "@/world/preset-data";
import { starterConfig } from "@/world/presets";
import { parseConfig, PRESET_IDS, type PresetId } from "@/world/schema";

export const presetWorld = (id: PresetId) => {
  const preset = PRESET_DATA[id];
  return buildWorld(parseConfig(starterConfig(preset)), preset);
};
export const isPreset = (id: string): id is PresetId => (PRESET_IDS as readonly string[]).includes(id);
export { PRESET_IDS };

// The painted world a fresh install starts with, built in memory (no config file needed).
export const paintedWorld = () => {
  const config = parseConfig(paintedStarterConfig());
  return buildWorld(config, PRESET_DATA[config.theme]);
};
