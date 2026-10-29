import { Permanent_Marker } from "next/font/google";
import { MapView } from "@/components/art/MapView";
import { MiniWitch } from "@/components/art/Witch";
import { WithWorld, RoomShowcase } from "../showcase";
import { paintedWorld } from "../worlds";

const marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });

// The README hero, 1600 x 900: a cream OS-9 window titled pocket-coven.exe holding the painted map with its room labels,
// one painted room with a witch and her familiar standing in it, and the blog sidebar.
// Rocha Coded tokens: plum ground, cream type, Fraunces 900 wordmark, candy pink scrawl, gold details.
export default function Hero() {
  const world = paintedWorld();
  const [me, friend, third] = world.characters;
  const mini = (c: typeof me) => <MiniWitch key={c.id} look={c.look} equipped={c.equipped} mood="happy" size={34} title={c.name} />;
  const occupants = { spring: [mini(friend)], terrace: [mini(third)] };
  const room = world.locations.findIndex((l) => l.id === "bedchamber");
  return (
    <main className="grid min-h-dvh place-items-center" style={{ background: "#50163C" }}>
      <div id="shot" className="relative flex h-[900px] w-[1600px] flex-col px-14 pb-10 pt-8" style={{ background: "#50163C" }}>
        <div className="mb-4 flex items-end gap-8">
          <h1 className="leading-none" style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: 84, whiteSpace: "nowrap", color: "#FFF7F4", letterSpacing: "-0.02em" }}>
            POCKET COVEN KIT
          </h1>
          <p className={`${marker.className} -rotate-3 pb-2 text-[36px]`} style={{ color: "#FE9DCA" }}>build your founder world</p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[6px]" style={{ background: "#FFF7F4", border: "2px solid #3B1230", boxShadow: "8px 8px 0 #682047" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#682047" }}>
            {[0, 1, 2].map((i) => <span key={i} className="h-3.5 w-3.5 rounded-full" style={{ background: "#E9B949", border: "1px solid #3B1230" }} />)}
            <span className="font-pixel flex-1 text-center text-[13px]" style={{ color: "#FFF7F4" }}>pocket-coven.exe</span>
            <span className="w-14" />
          </div>
          <div className="flex min-h-0 flex-1 gap-5 p-5" style={{ background: "#FFE3F1" }}>
            <figure className="flex h-full flex-col items-center">
              <div className="h-full overflow-hidden rounded-[16px]" style={{ border: "4px solid #E9B949", aspectRatio: "880 / 1168" }}>
                <WithWorld world={world}>
                  <MapView locations={world.locations} occupants={occupants} />
                </WithWorld>
              </div>
            </figure>
            <figure className="flex h-full flex-col">
              <div className="h-full overflow-hidden rounded-[16px]" style={{ border: "4px solid #E9B949", aspectRatio: "3 / 4" }}>
                <RoomShowcase world={world} roomIndex={room} size={200} cast={[me]} />
              </div>
            </figure>
            <aside className="flex min-w-0 flex-1 flex-col gap-3 font-mono text-[14px]" style={{ color: "#3B1230" }}>
              <div className="rounded border-2 p-3" style={{ borderColor: "#3B1230", background: "#FFF7F4" }}>
                <p className="font-pixel text-[11px]">about this coven</p>
                <p className="mt-1" style={{ fontFamily: "var(--font-fraunces)", fontSize: 22, fontWeight: 700 }}>{world.meta.name}</p>
                <p className="mt-1 text-[13px]">{world.meta.tagline}</p>
              </div>
              <p>mood: witchy ✧</p>
              <p>now in: {world.locations[room].name.toLowerCase()}</p>
              <p>rooms: {world.locations.length}, all painted</p>
              <p>familiars: {world.items.filter((i) => i.slot === "companion").map((i) => i.name.toLowerCase()).join(", ")}</p>
              <p>currency: {world.meta.currency.plural}</p>
              <div className="rounded border-2 p-3" style={{ borderColor: "#3B1230", background: "#FFF7F4" }}>
                <p className="font-pixel text-[11px]">the rooms</p>
                <ul className="mt-1 grid grid-cols-2 gap-x-3 text-[13px] leading-6">
                  {world.locations.map((l) => <li key={l.id}>✧ {l.name}</li>)}
                </ul>
              </div>
              <div className="mt-auto rounded border-2 p-2 text-center" style={{ borderColor: "#3B1230", background: "#FFF7F4" }}>
                <p className="font-pixel text-[11px]">you are visitor no.</p>
                <p className="font-pixel text-xl tracking-widest" style={{ color: "#C2246E" }}>000,777</p>
              </div>
              <p className="text-center">✧ sign my guestbook ✧</p>
              <p className="text-center text-[11px] opacity-70">last updated: today</p>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
