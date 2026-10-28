// The five presets as bundled data, for the app (the browser and Next server cannot read world/presets/ from disk).
import city from "./presets/city-witch.json";
import hedge from "./presets/hedge-witch.json";
import kitchen from "./presets/kitchen-witch.json";
import moon from "./presets/moon-coven.json";
import sea from "./presets/sea-witch.json";
import type { Preset } from "./presets.ts";
import type { PresetId } from "./schema.ts";

export const PRESET_DATA = {
  "hedge-witch": hedge,
  "moon-coven": moon,
  "kitchen-witch": kitchen,
  "sea-witch": sea,
  "city-witch": city,
} as unknown as Record<PresetId, Preset>;
