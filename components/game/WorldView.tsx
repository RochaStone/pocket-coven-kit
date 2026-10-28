"use client";
import { useEffect, useMemo, useState } from "react";
import { Compact } from "@/components/art/Compact";
import { MapView } from "@/components/art/MapView";
import { MiniWitch } from "@/components/art/Witch";
import { LOCATIONS, WORLD } from "@/lib/game/catalog";
import { moodFromStats } from "@/lib/game/logic";
import { play } from "@/lib/sound";
import { useGame } from "./GameContext";
import { GiftsWaiting } from "./Gifts";
import { CovenGoalCard, OracleDraw } from "./Rituals";
import { Tutorial } from "./Tutorial";

// Small avatars of every witch at her last known room (online or not).
export function useOccupants() {
  const { coven, state } = useGame();
  return useMemo(() => {
    const out: Record<string, React.ReactNode[]> = {};
    for (const r of Object.values(coven.roster)) {
      if (!r.claimed || !r.status?.location_id) continue;
      const loc = LOCATIONS.find((l) => l.id === r.status!.location_id);
      if (!loc) continue;
      const isMe = r.id === state.character.id;
      const online = coven.online.has(r.id) || isMe;
      const look = isMe ? state.character.look : r.look;
      const eq = isMe ? state.equipment : r.equipment;
      const mood = isMe ? state.mood : r.stats ? moodFromStats(r.stats) : "happy";
      (out[loc.id] ??= []).push(
        <span key={r.id} className={`inline-block rounded-full ${online ? "" : "opacity-60 grayscale-[40%]"}`} title={`${r.name}${online ? "" : " (away)"}`}>
          <MiniWitch look={look} equipped={eq} mood={mood} size={34} title={r.name} />
        </span>,
      );
    }
    return out;
  }, [coven.roster, coven.online, state]);
}

export function WorldView() {
  const { go, setGiftsOpen } = useGame();
  const [open, setOpen] = useState(false);
  const occupants = useOccupants();
  useEffect(() => {
    // The compact opens itself on arrival; tapping the lid closes it again.
    const t = setTimeout(() => setOpen(true), 450);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center gap-3 px-3 pb-4">
      <div className="w-full pt-1 text-center">
        <h1 className="title-display on-ground text-2xl leading-tight">{WORLD.name}</h1>
        <p className="on-ground text-xs opacity-80">{WORLD.tagline}</p>
      </div>
      <Compact open={open} onToggle={() => { play("open"); setOpen((o) => !o); }}>
        <MapView onSelect={(id) => go({ kind: "location", id })} occupants={occupants} />
      </Compact>
      {open && (
        <>
          <GiftsWaiting onOpen={() => setGiftsOpen(true)} />
          <Tutorial />
          <OracleDraw />
          <CovenGoalCard />
        </>
      )}
    </div>
  );
}
