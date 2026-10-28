import { buildWorld } from "@/world/build";
import { PRESET_DATA } from "@/world/preset-data";
import { starterConfig } from "@/world/presets";
import { parseConfig, PRESET_IDS, type PresetId } from "@/world/schema";

export const presetWorld = (id: PresetId) => {
  const preset = PRESET_DATA[id];
  return buildWorld(parseConfig(starterConfig(preset)), preset);
};
export const isPreset = (id: string): id is PresetId => (PRESET_IDS as readonly string[]).includes(id);
export { PRESET_IDS };
