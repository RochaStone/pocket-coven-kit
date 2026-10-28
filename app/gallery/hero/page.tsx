import { Permanent_Marker } from "next/font/google";
import { WithWorld, RoomShowcase } from "../showcase";
import { presetWorld } from "../worlds";
import { HeroLid } from "./lid";

const marker = Permanent_Marker({ subsets: ["latin"], weight: "400" });

// The README hero: a cream OS-9 window titled pocket-coven.exe, with the compact open onto a Hedge Witch room.
// Rocha Coded tokens: plum ground, cream type, Fraunces 900 wordmark, candy pink scrawl, gold details.
export default function Hero() {
  const world = presetWorld("hedge-witch");
  const brewing = world.giftTreats[0]?.name.toLowerCase() ?? "something warm";
  return (
    <main className="grid min-h-dvh place-items-center" style={{ background: "#50163C" }}>
      <div id="shot" className="relative w-[1280px] px-16 pb-14 pt-10" style={{ background: "#50163C" }}>
        <div className="mb-6 flex flex-col items-start">
          <h1 className="leading-none" style={{ fontFamily: "var(--font-fraunces)", fontWeight: 900, fontSize: 92, whiteSpace: "nowrap", color: "#FFF7F4", letterSpacing: "-0.02em" }}>
            POCKET COVEN KIT
          </h1>
          <p className={`${marker.className} -mt-2 ml-auto mr-10 -rotate-3 text-[38px]`} style={{ color: "#FE9DCA" }}>build your founder world</p>
        </div>
        <div className="overflow-hidden rounded-[6px]" style={{ background: "#FFF7F4", border: "2px solid #3B1230", boxShadow: "8px 8px 0 #682047" }}>
          <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#682047" }}>
            {[0, 1, 2].map((i) => <span key={i} className="h-3.5 w-3.5 rounded-full" style={{ background: "#E9B949", border: "1px solid #3B1230" }} />)}
            <span className="font-pixel flex-1 text-center text-[13px]" style={{ color: "#FFF7F4" }}>pocket-coven.exe</span>
            <span className="w-14" />
          </div>
          <div className="grid grid-cols-[1fr_260px] gap-0">
            <div className="relative p-5 pt-3">
              <WithWorld world={world}>
                <HeroLid />
              </WithWorld>
              <div className="rounded-[18px] p-2" style={{ border: "5px solid #E9B949", background: "#FFE3F1" }}>
                <RoomShowcase world={world} size={150} />
              </div>
            </div>
            <aside className="flex flex-col gap-3 border-l-2 p-4 font-mono text-[13px]" style={{ borderColor: "#3B1230", color: "#3B1230", background: "#FFE3F1" }}>
              <div className="rounded border-2 p-2" style={{ borderColor: "#3B1230", background: "#FFF7F4" }}>
                <p className="font-pixel text-[11px]">about this coven</p>
                <p className="mt-1" style={{ fontFamily: "var(--font-fraunces)", fontSize: 18, fontWeight: 600 }}>{world.meta.name}</p>
                <p className="mt-1 text-[12px]">{world.meta.tagline}</p>
              </div>
              <p>mood: witchy ✧</p>
              <p>currently brewing: {brewing}</p>
              <p>familiars: {world.items.filter((i) => i.slot === "companion").map((i) => i.name.toLowerCase()).join(", ")}</p>
              <p>currency: {world.meta.currency.plural}</p>
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
