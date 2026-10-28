import { notFound } from "next/navigation";
import { PRESET_DATA } from "@/world/preset-data";
import { RoomShowcase } from "../../showcase";
import { isPreset, presetWorld } from "../../worlds";

// One room of a preset, rendered for the README thumbnails: /gallery/presets/hedge-witch
export default async function PresetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isPreset(id)) notFound();
  const world = presetWorld(id);
  const p = world.meta.palette;
  return (
    <main className="grid min-h-dvh place-items-center p-6" style={{ background: p.groundDeep }}>
      <div id="shot" className="w-[560px] p-4" style={{ background: p.ground, borderRadius: 18 }}>
        <RoomShowcase world={world} />
        <p className="mt-3 text-center font-mono text-sm" style={{ color: p.paper }}>
          {PRESET_DATA[id].label} · {world.locations[0].name}
        </p>
      </div>
    </main>
  );
}
