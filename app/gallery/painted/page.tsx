import { CATALOG } from "@/lib/game/catalog";
import { MotifCompact, RoomShowcase } from "../showcase";
import { paintedWorld } from "../worlds";

// Your painted world: the map in its compact, and one room with your first two witches in it (side by side on wide screens). /gallery/painted (no database needed).
// Shows your built world when it is painted, otherwise the painted world a fresh install starts with.
// The Playwright screenshots of the painted theme come from here.
export default function Painted() {
  const world = CATALOG.meta.art?.theme === "painted" ? CATALOG : paintedWorld();
  const room = Math.max(0, Math.min(2, world.locations.length - 1));
  return (
    <main id="shot" className="mx-auto flex max-w-[560px] flex-col gap-6 px-3 py-6 lg:max-w-[1120px] lg:flex-row lg:items-start" style={{ background: "var(--pc-ground)" }}>
      <section id="painted-map" className="lg:flex-1">
        <MotifCompact world={world} motif={world.meta.motif} rooms={world.locations.length} />
      </section>
      <section id="painted-room" className="lg:flex-1">
        <h1 className="title-display on-ground mb-2 text-xl">{world.locations[room].name}</h1>
        <RoomShowcase world={world} roomIndex={room} size={140} cast={world.characters.slice(0, 2)} />
      </section>
    </main>
  );
}
