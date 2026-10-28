"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { api } from "@/lib/game/api";
import { ItemIcon } from "@/components/art/ItemIcon";
import { TreasureBurst } from "@/components/art/Bits";
import { currencyLabel, itemById } from "@/lib/game/catalog";
import { MOOD_LABEL, xpForLevel } from "@/lib/game/logic";
import { STATS, type StatKey } from "@/lib/game/types";
import { useGame, type View } from "./GameContext";
import { NavIcon, CoinIcon, StatIcon } from "./Icons";
import { SoundToggle } from "./SoundToggle";

const STAT_LABEL: Record<StatKey, string> = { nourishment: "Nourishment", energy: "Energy", joy: "Joy", magic: "Magic", social: "Social" };
const STAT_COLOR: Record<StatKey, string> = {
  nourishment: "var(--stat-nourishment)",
  energy: "var(--stat-energy)",
  joy: "var(--stat-joy)",
  magic: "var(--stat-magic)",
  social: "var(--stat-social)",
};

export function StatBar({ stat, value, compact }: { stat: StatKey; value: number; compact?: boolean }) {
  const low = value < 30;
  return (
    <div className="flex items-center gap-1.5" title={`${STAT_LABEL[stat]} ${Math.round(value)}`}>
      <StatIcon stat={stat} size={compact ? 15 : 18} />
      <div className={`relative flex-1 overflow-hidden rounded-full bg-white/80 ring-1 ring-ink/15 ${compact ? "h-2" : "h-2.5"}`}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: STAT_COLOR[stat] }}
          initial={false}
          animate={{ width: `${Math.max(3, value)}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
              </div>
      {!compact && (
        <span className={`w-7 text-right text-[11px] font-semibold tabular-nums ${low ? "text-warn-500" : "text-ink/70"}`}>{Math.round(value)}</span>
      )}
    </div>
  );
}

// A family login (a grown-up and a young witch) owns more than one witch and can hop between them.
function FamilySwitch() {
  const { state, fail } = useGame();
  const [working, setWorking] = useState(false);
  const others = (state.family ?? []).filter((f) => f.id !== state.character.id);
  if (others.length === 0) return null;
  const go = async (id: string) => {
    setWorking(true);
    try {
      await api.switchCharacter(id);
      window.location.reload();
    } catch (e) {
      fail(e);
      setWorking(false);
    }
  };
  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {others.map((o) => (
        <button key={o.id} onClick={() => go(o.id)} disabled={working} className="rounded-full bg-accent-100 px-2.5 py-0.5 text-[11px] font-bold text-accent-500 ring-1 ring-accent-200">
          {working ? "Switching..." : `Play as ${o.name}`}
        </button>
      ))}
    </div>
  );
}

export function Hud() {
  const { state } = useGame();
  const lvlFloor = xpForLevel(state.stats.level);
  const lvlNext = xpForLevel(state.stats.level + 1);
  const pct = Math.min(100, ((state.xp - lvlFloor) / Math.max(1, lvlNext - lvlFloor)) * 100);
  return (
    <header className="panel mx-3 mt-[max(env(safe-area-inset-top),10px)] px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="truncate font-display text-lg font-semibold leading-tight text-accent-500">{state.character.name}</span>
            <span className="truncate text-[11px] font-semibold text-ink/60">{state.character.title}</span>
          </div>
          <FamilySwitch />
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-semibold">
            <span className="rounded-full bg-mystic-100 px-2 py-0.5 text-mystic-500">{MOOD_LABEL[state.mood]}</span>
            <span className="text-ink/60">Lv {state.stats.level}</span>
            <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white ring-1 ring-ink/15">
              <div className="h-full rounded-full bg-mystic-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
        <SoundToggle className="!h-8 !w-8" />
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-paper px-3 py-1 ring-2 ring-coin-400/60" aria-label={currencyLabel(state.coins)}>
          <CoinIcon size={20} />
          <motion.span key={state.coins} initial={{ scale: 1.35 }} animate={{ scale: 1 }} className="font-display text-base font-semibold tabular-nums text-coin-600">
            {state.coins}
          </motion.span>
        </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {STATS.map((s) => (
          <StatBar key={s} stat={s} value={Number(state.stats[s])} compact />
        ))}
      </div>
    </header>
  );
}

const DOCK: { view: View; label: string; icon: "world" | "wardrobe" | "room" | "coven" }[] = [
  { view: { kind: "world" }, label: "World", icon: "world" },
  { view: { kind: "wardrobe" }, label: "Wardrobe", icon: "wardrobe" },
  { view: { kind: "room" }, label: "Room", icon: "room" },
  { view: { kind: "coven" }, label: "Coven", icon: "coven" },
];

export function Dock() {
  const { view, go, state, coven } = useGame();
  const onlineCount = Math.max(0, coven.online.size - 1);
  const active = (v: View) =>
    v.kind === view.kind || (v.kind === "world" && view.kind === "location") || (v.kind === "room" && view.kind === "room");
  return (
    <nav className="panel mx-3 mb-[max(env(safe-area-inset-bottom),10px)] flex items-stretch justify-around px-1 py-1.5" aria-label="Main">
      {DOCK.map((d) => (
        <button
          key={d.label}
          onClick={() => go(d.view)}
          className={`relative flex min-w-[64px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-bold transition ${active(d.view) ? "bg-accent-100 text-accent-500" : "text-ink/70"}`}
          aria-current={active(d.view) ? "page" : undefined}
          aria-label={d.icon === "coven" && onlineCount > 0 ? `${d.label}, ${onlineCount} online` : d.label}
        >
          <NavIcon name={d.icon} size={26} />
          {d.label}
          {d.icon === "coven" && onlineCount > 0 && (
            <span aria-hidden className="absolute right-2 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-alt-500 px-1 text-[10px] text-white">{onlineCount}</span>
          )}
        </button>
      ))}
      {state.is_admin && (
        <a href="/admin" className="flex min-w-[56px] flex-col items-center gap-0.5 rounded-2xl px-2 py-1 text-[11px] font-bold text-ink/70">
          <NavIcon name="admin" size={26} />
          Owner
        </a>
      )}
    </nav>
  );
}

const CHIP_LABEL: Record<string, string> = { nourishment: "food", energy: "energy", joy: "joy", magic: "magic", social: "social", coins: "", xp: "xp" };

export function Toasts() {
  const { toasts, dismiss } = useGame();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[calc(max(env(safe-area-inset-top),10px)+118px)] z-40 mx-auto flex max-w-[520px] flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto w-full rounded-2xl px-3.5 py-2 text-[13px] font-semibold shadow-lg ring-2 ${
              t.tone === "error"
                ? "bg-paper text-warn-500 ring-warn-500"
                : t.tone === "gold"
                  ? "bg-paper text-ink ring-coin-400"
                  : t.tone === "alt"
                    ? "bg-alt-100 text-ink ring-alt-300"
                    : "bg-white/95 text-ink ring-accent-200"
            }`}
            onClick={() => !t.action && dismiss(t.id)}
            role="status"
          >
            <p className="leading-snug">{t.text}</p>
            {t.chips && t.chips.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {t.chips.map((c) => (
                  <span key={c.stat} className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${c.delta > 0 ? "bg-alt-100 text-alt-500" : "bg-accent-100 text-accent-500"}`}>
                    {c.delta > 0 ? "+" : ""}
                    {c.stat === "coins" ? currencyLabel(c.delta) : `${c.delta} ${CHIP_LABEL[c.stat]}`}
                  </span>
                ))}
              </div>
            )}
            {t.action && (
              <div className="mt-2 flex gap-2">
                <button className="btn alt !py-1.5 text-xs" onClick={() => { t.action!.run(); dismiss(t.id); }}>
                  {t.action.label}
                </button>
                <button className="btn ghost !py-1.5 text-xs" onClick={() => dismiss(t.id)}>
                  Later
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function TreasureModal() {
  const { treasure, showTreasure } = useGame();
  return (
    <AnimatePresence>
      {treasure && treasure.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center scrim p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => showTreasure(null)}
        >
          <div className="panel w-full max-w-sm p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="title-display text-2xl text-accent-500">Treasure discovered</p>
            <TreasureBurst show>
              <div className="flex justify-center gap-3 py-2">
                {treasure.map((id, i) => (
                  <div key={id + i} className="flex flex-col items-center">
                    <ItemIcon itemId={id} size={84} />
                    <span className="mt-1 text-sm font-bold">{itemById(id)?.name ?? id}</span>
                    <span className="text-xs text-ink/60">{itemById(id)?.description}</span>
                  </div>
                ))}
              </div>
            </TreasureBurst>
            <button className="btn coin mt-4" onClick={() => showTreasure(null)}>
              Into the treasure chest
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
