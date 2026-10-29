import { CATALOG } from "@/lib/game/catalog";
import { MotifCompact, RoomShowcase } from "../showcase";
import { paintedWorld } from "../worlds";

// Your painted world: the map in its compact, and one room with two witches in it. /gallery/painted (no database needed).
// Shows your built world when it is painted, otherwise the painted world a fresh install starts with.
// The Playwright screenshots of the painted theme come from here.
export default function Painted() {
  const world = CATALOG.meta.art?.theme === "painted" ? CATALOG : paintedWorld();
  const room = Math.max(0, Math.min(2, world.locations.length - 1));
  return (
    <main className="mx-auto flex max-w-[560px] flex-col gap-6 px-3 py-6">
      <section id="painted-map">
        <MotifCompact world={world} motif={world.meta.motif} rooms={world.locations.length} />
      </section>
      <section id="painted-room">
        <h1 className="title-display on-ground mb-2 text-xl">{world.locations[room].name}</h1>
        <RoomShowcase world={world} roomIndex={room} size={140} cast={world.characters.slice(0, 2)} />
      </section>
    </main>
  );
}
