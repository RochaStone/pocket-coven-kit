"use client";
import { useState } from "react";
import { ACTIVITIES, LOCATIONS, WORLD } from "@/lib/game/catalog";
import { renderFlavour } from "@/lib/game/logic";
import { useGame } from "./GameContext";

const KEY = "pocket-coven-kit:tutorial";

type Flags = { chat?: boolean; dismissed?: boolean };

function readFlags(): Flags {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function markTutorial(flag: keyof Flags) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readFlags(), [flag]: true }));
  } catch {
    // Storage unavailable (private mode): the quest card simply stays visible.
  }
}

// First-visit quest card. Progress comes from server state where possible.
export function Tutorial() {
  const { state, go } = useGame();
  // Only rendered client-side (after the compact opens), so reading storage at init is safe.
  const [flags, setFlags] = useState<Flags>(readFlags);
  const start = LOCATIONS[0];
  const treasureRoom = LOCATIONS.find((l) => ACTIVITIES.some((a) => a.locationId === l.id && a.loot?.length)) ?? start;
  const steps = [
    { done: true, text: "Open the compact", go: null },
    { done: state.achievements.includes("first_care"), text: `Do something lovely in ${start.name}`, go: () => go({ kind: "location", id: start.id }) },
    { done: state.achievements.includes("first_treasure"), text: `Look for treasure in ${treasureRoom.name}`, go: () => go({ kind: "location", id: treasureRoom.id }) },
    { done: Boolean(flags.chat), text: "Say hello in the coven chat", go: () => go({ kind: "coven" }) },
  ];

  if (flags.dismissed || steps.every((s) => s.done)) return null;
  const next = steps.findIndex((s) => !s.done);
  return (
    <section className="panel w-full max-w-[520px] px-4 py-3">
      <div className="flex items-center justify-between">
        <h2 className="title-display text-xl text-accent-500">{renderFlavour(WORLD.flavour.welcome, state.character.name, state.character.pronouns)}</h2>
        <button
          className="text-xs font-bold text-ink/50"
          onClick={() => {
            markTutorial("dismissed");
            setFlags(readFlags());
          }}
        >
          Hide
        </button>
      </div>
      <ol className="mt-1.5 space-y-1.5">
        {steps.map((s, i) => (
          <li key={s.text} className={`flex items-center gap-2 text-sm ${s.done ? "text-ink/45 line-through" : i === next ? "font-bold" : ""}`}>
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${s.done ? "bg-alt-300 text-white" : "bg-accent-100 text-accent-500"}`}>{i + 1}</span>
            <span className="flex-1">{s.text}</span>
            {!s.done && i === next && s.go && (
              <button className="btn alt !px-3 !py-1 text-xs" onClick={s.go}>
                Go
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
