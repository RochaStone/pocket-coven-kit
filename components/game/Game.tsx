"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { ItemIcon } from "@/components/art/ItemIcon";
import { TreasureBurst } from "@/components/art/Bits";
import { api } from "@/lib/game/api";
import { currencyLabel, itemById, locationById, WORLD } from "@/lib/game/catalog";
import { renderFlavour } from "@/lib/game/logic";
import type { MyState } from "@/lib/game/state";
import { CovenView } from "./CovenView";
import { GameProvider, useGame, type View } from "./GameContext";
import { GiftComposer, GiftInbox } from "./Gifts";
import { Dock, Hud, Toasts, TreasureModal } from "./Hud";
import { CoinIcon } from "./Icons";
import { LocationView } from "./LocationView";
import { RoomView } from "./RoomView";
import { Wardrobe } from "./Wardrobe";
import { WorldView } from "./WorldView";

export default function Game({ initial, go }: { initial: MyState; go?: string }) {
  const initialView: View | undefined = !go || go === "gifts" ? undefined : locationById(go) ? { kind: "location", id: go } : undefined;
  return (
    <GameProvider initial={initial} initialView={initialView}>
      <GiftsOnArrival open={go === "gifts"} />
      <Frame />
    </GameProvider>
  );
}

function Frame() {
  const { view } = useGame();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);
  const key = view.kind === "location" ? `loc-${view.id}` : view.kind === "room" ? `room-${view.host ?? "me"}` : view.kind;
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-[560px] flex-col">
      <div className="sticky top-0 z-30">
        <Hud />
      </div>
      <main className="flex-1 pt-3">
        <AnimatePresence mode="wait">
          <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
            {view.kind === "world" && <WorldView />}
            {view.kind === "location" && <LocationView id={view.id} />}
            {view.kind === "wardrobe" && <Wardrobe />}
            {view.kind === "room" && <RoomView host={view.host} />}
            {view.kind === "coven" && <CovenView />}
          </motion.div>
        </AnimatePresence>
      </main>
      <div className="sticky bottom-0 z-30">
        <Dock />
      </div>
      <Toasts />
      <TreasureModal />
      <DailyReward />
      <GiftSheets />
    </div>
  );
}

function GiftsOnArrival({ open }: { open: boolean }) {
  const { setGiftsOpen } = useGame();
  useEffect(() => {
    if (open) setGiftsOpen(true);
  }, [open, setGiftsOpen]);
  return null;
}

function GiftSheets() {
  const { giftsOpen, setGiftsOpen, composeTo, setComposeTo } = useGame();
  return (
    <AnimatePresence>
      {giftsOpen && <GiftInbox key="inbox" onClose={() => setGiftsOpen(false)} />}
      {composeTo && <GiftComposer key="compose" to={composeTo} onClose={() => setComposeTo(null)} />}
    </AnimatePresence>
  );
}

function DailyReward() {
  const { state, setState, fail, announceAchievements } = useGame();
  const [dismissed, setDismissed] = useState(false);
  const [result, setResult] = useState<{ coins: number; loot: string[] } | null>(null);
  const [working, setWorking] = useState(false);
  const show = (state.daily_available && !dismissed) || result !== null;
  const claim = async () => {
    setWorking(true);
    try {
      const r = await api.claimDaily();
      setState(r.state);
      if (r.ok) {
        setResult({ coins: r.coins_delta ?? 0, loot: r.loot ?? [] });
        announceAchievements(r.achievements);
      } else setDismissed(true);
    } catch (e) {
      fail(e);
      setDismissed(true);
    } finally {
      setWorking(false);
    }
  };
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="scrim fixed inset-0 z-50 grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="panel w-full max-w-sm p-6 text-center" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
            {result ? (
              <TreasureBurst show>
                <p className="title-display text-2xl text-accent-500">{WORLD.flavour.dailyTitle}</p>
                <div className="my-4 flex items-center justify-center gap-4">
                  <div className="flex flex-col items-center">
                    <CoinIcon size={56} />
                    <span className="font-bold">+{currencyLabel(result.coins)}</span>
                  </div>
                  {result.loot.map((id) => (
                    <div key={id} className="flex flex-col items-center">
                      <ItemIcon itemId={id} size={64} />
                      <span className="text-sm font-bold">{itemById(id)?.name}</span>
                    </div>
                  ))}
                </div>
                <button className="btn" onClick={() => { setResult(null); setDismissed(true); }}>
                  Into my basket
                </button>
              </TreasureBurst>
            ) : (
              <>
                <p className="title-display text-2xl text-accent-500">{renderFlavour(WORLD.flavour.welcome, state.character.name, state.character.pronouns)}</p>
                <p className="mt-2 text-sm text-ink/75">{WORLD.flavour.dailyBody}</p>
                <button className="btn coin mt-5" disabled={working} onClick={claim}>
                  Collect today&apos;s gift
                </button>
                <button className="mt-3 block w-full text-xs font-bold text-ink/60" onClick={() => setDismissed(true)}>
                  Later
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
