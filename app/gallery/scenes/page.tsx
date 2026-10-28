"use client";
// Every backdrop, painted in your world's palette, plus the compact in all three motifs.
import { BACKDROP_LABEL, Scene } from "@/components/art/Backdrop";
import { Compact } from "@/components/art/Compact";
import { MapView } from "@/components/art/MapView";
import { RoomBackdrop, WALL_LABEL } from "@/components/art/RoomBackdrop";
import { WORLD } from "@/lib/game/catalog";
import { BACKDROPS, FLOORS, MOTIFS, WALLPAPERS } from "@/lib/game/types";

export default function Scenes() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="title-display on-ground text-4xl">{WORLD.name}: rooms and chrome</h1>
      <h2 className="title-display on-ground mb-3 mt-8 text-2xl">All 18 backdrops</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BACKDROPS.map((b) => (
          <figure key={b}>
            <Scene kind={b} />
            <figcaption className="on-ground mt-1 text-center text-xs">{BACKDROP_LABEL[b]}</figcaption>
          </figure>
        ))}
      </div>
      <h2 className="title-display on-ground mb-3 mt-8 text-2xl">The compact, three ways</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {MOTIFS.map((m) => (
          <Compact key={m} open onToggle={() => undefined} motif={m}>
            <MapView />
          </Compact>
        ))}
      </div>
      <h2 className="title-display on-ground mb-3 mt-8 text-2xl">Room styles</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {WALLPAPERS.map((w, i) => (
          <figure key={w}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <RoomBackdrop wallpaper={w} floor={FLOORS[i % FLOORS.length]} />
            </div>
            <figcaption className="on-ground text-center text-xs">{WALL_LABEL[w]}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
