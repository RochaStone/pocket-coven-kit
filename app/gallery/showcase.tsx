"use client";
// Shared pieces for the gallery and the README renders. No database needed: everything is drawn from a World.
import { ArtProvider } from "@/components/art/ArtContext";
import { Scene } from "@/components/art/Backdrop";
import { Compact } from "@/components/art/Compact";
import { MapView } from "@/components/art/MapView";
import { Witch } from "@/components/art/Witch";
import type { Motif, World } from "@/lib/game/types";

// One room of a world (painted or drawn) with its first three witches (or the cast you pass) and their familiars standing in it.
export function RoomShowcase({ world, roomIndex = 0, size = 150, cast }: { world: World; roomIndex?: number; size?: number; cast?: World["characters"] }) {
  const room = world.locations[roomIndex] ?? world.locations[0];
  const trio = cast ?? world.characters.slice(0, 3);
  const spots = world.activities.filter((a) => a.locationId === room.id).map((a) => ({ id: a.id, label: a.name, x: a.spot.x, y: a.spot.y }));
  return (
    <ArtProvider world={world}>
      <Scene kind={room.backdrop} painting={room.painting} hotspots={spots}>
        <div className="pointer-events-none absolute inset-x-0 bottom-[3%] flex items-end justify-center -space-x-8">
          {trio.map((c, i) => (
            <Witch key={c.id} look={c.look} equipped={c.equipped} mood={i === 1 ? "thriving" : i === 2 ? "magical" : "happy"} size={i === 1 ? size * 1.1 : size} animate={false} title={c.name} />
          ))}
        </div>
      </Scene>
    </ArtProvider>
  );
}

export function WithWorld({ world, motif, children }: { world: World; motif?: Motif; children: React.ReactNode }) {
  return (
    <ArtProvider world={world} motif={motif}>
      {children}
    </ArtProvider>
  );
}

export function MotifCompact({ world, motif, rooms = 4 }: { world: World; motif: Motif; rooms?: number }) {
  return (
    <ArtProvider world={world} motif={motif}>
      <Compact open onToggle={() => undefined} motif={motif}>
        <MapView locations={world.locations.slice(0, rooms)} />
      </Compact>
    </ArtProvider>
  );
}
