"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ItemIcon } from "@/components/art/ItemIcon";
import { ACCESSORY_LABEL, COLOURWAYS, Familiar } from "@/components/art/Familiar";
import { Witch } from "@/components/art/Witch";
import { api } from "@/lib/game/api";
import { ITEMS, WORLD } from "@/lib/game/catalog";
import { FAMILIAR_ACCESSORIES, FAMILIAR_COLOURWAYS, HAIR_STYLES, type Equipped, type FamiliarSpecies, type Slot } from "@/lib/game/types";
import { useGame } from "./GameContext";
import { CoinIcon } from "./Icons";

const TABS: { id: string; label: string; slots: Slot[] }[] = [
  { id: "outfit", label: "Robes", slots: ["outfit"] },
  { id: "boots", label: "Boots", slots: ["boots"] },
  { id: "hat", label: "Hats", slots: ["hat"] },
  { id: "jewellery", label: "Jewels", slots: ["necklace", "earrings"] },
  { id: "hair_acc", label: "Hair", slots: ["hair_acc"] },
  { id: "companion", label: "Familiars", slots: ["companion"] },
  { id: "look", label: "Look", slots: [] },
  { id: "profile", label: "Profile", slots: [] },
];

const HAIR_SWATCHES = ["#2a1f1a", "#6b4428", "#b5652e", "#e3c07a", "#d9d4cf", "#4a2a4f", "#1f2a44", "#8a3a2e", "#5f7a43", "#c9b8d8"];
const SKIN_SWATCHES = ["#f6dcc8", "#f1cfb4", "#e9b993", "#d6a27c", "#c98f68", "#a8714d", "#7d4f33", "#5a3826", "#43291c"];
const EYE_SWATCHES = ["#5a3a22", "#3f6a50", "#3b5a8f", "#6b4a2e", "#4a3a6a", "#2f5a5a", "#7a6a2a", "#2a2a2a"];
const HAIR_LABEL: Record<string, string> = {
  long_waves: "Long waves", bob: "Bob", straight_long: "Sleek long", curls: "Curls",
  braid: "Braid", pixie: "Pixie", buns: "Two buns", pigtails: "Pigtails",
};

export function Wardrobe() {
  const { state, setState, fail, toast, announceAchievements } = useGame();
  const [tab, setTab] = useState("outfit");
  const [tryOn, setTryOn] = useState<{ slot: Slot; itemId: string } | null>(null);
  const [flash, setFlash] = useState(0);
  const [working, setWorking] = useState(false);
  const owned = new Set(state.inventory.map((i) => i.item_id));
  const preview: Equipped = tryOn ? { ...state.equipment, [tryOn.slot]: tryOn.itemId } : state.equipment;
  const current = TABS.find((t) => t.id === tab)!;

  const run = async (fn: () => Promise<void>) => {
    setWorking(true);
    try {
      await fn();
    } catch (e) {
      fail(e);
    } finally {
      setWorking(false);
    }
  };

  const equip = (slot: Slot, itemId: string | null) =>
    run(async () => {
      const r = await api.equip(slot, itemId);
      setState(r.state);
      setTryOn(null);
      setFlash((f) => f + 1);
      announceAchievements(r.achievements);
    });

  const buy = (slot: Slot, itemId: string) =>
    run(async () => {
      const r = await api.buy(itemId);
      setState(r.state);
      announceAchievements(r.achievements);
      const e = await api.equip(slot, itemId);
      setState(e.state);
      setTryOn(null);
      setFlash((f) => f + 1);
      toast({ tone: "gold", text: `${ITEMS.find((i) => i.id === itemId)?.name} is yours. Wearing it immediately, obviously.` });
    });

  return (
    <div className="flex flex-col gap-3 px-3 pb-4">
      <section className="panel relative overflow-hidden" style={{ background: `radial-gradient(90% 80% at 50% 30%, ${WORLD.palette.paper} 0%, ${WORLD.palette.wall} 100%)` }}>
        <div className="relative flex flex-col items-center pt-3">
          <AnimatePresence>
            <motion.div key={flash} initial={{ scale: flash ? 0.9 : 1, rotate: flash ? -3 : 0 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}>
              <Witch look={state.character.look} equipped={preview} mood={tryOn ? "magical" : state.mood} size={230} petName={preview.companion ? state.character.pet_names?.[preview.companion] : undefined} />
            </motion.div>
          </AnimatePresence>
          {tryOn && (
            <div className="mb-3 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow">
              Trying on {ITEMS.find((i) => i.id === tryOn.itemId)?.name}
              <button className="text-accent-500" onClick={() => setTryOn(null)}>
                Undo
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3 pb-1" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold ring-2 ${tab === t.id ? "bg-accent-400 text-white ring-accent-400" : "bg-white/85 ring-accent-100"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {current.slots.length > 0 &&
        current.slots.map((slot) => (
          <section key={slot}>
            {current.slots.length > 1 && <h3 className="mb-1 px-1 text-xs font-bold uppercase tracking-wider text-ink/50">{slot === "necklace" ? "Necklaces" : "Earrings"}</h3>}
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {state.equipment[slot] && slot !== "outfit" && (
                <button onClick={() => equip(slot, null)} disabled={working} className="panel flex flex-col items-center justify-center gap-1 p-2 text-xs font-bold text-ink/60">
                  <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-accent-200">None</span>
                  Take off
                </button>
              )}
              {ITEMS.filter((i) => i.slot === slot && (owned.has(i.id) || (i.price && (!i.season || i.season.includes(state.month))))).map((i) => {
                const has = owned.has(i.id);
                const on = state.equipment[slot] === i.id;
                const trying = tryOn?.itemId === i.id;
                return (
                  <div key={i.id} className={`panel flex flex-col items-center p-2 text-center ${on ? "selected" : ""}`}>
                    <button className="flex flex-col items-center" onClick={() => (has ? equip(slot, i.id) : setTryOn({ slot, itemId: i.id }))} disabled={working} aria-label={has ? `Wear ${i.name}` : `Try on ${i.name}`}>
                      <ItemIcon itemId={i.id} size={60} />
                      <span className="mt-0.5 text-[11px] font-bold leading-tight">{i.name}</span>
                    </button>
                    {on ? (
                      <span className="mt-1 rounded-full bg-accent-100 px-2 text-[10px] font-bold text-accent-500">Wearing</span>
                    ) : has ? (
                      <span className="mt-1 text-[10px] font-semibold text-ink/50">Owned</span>
                    ) : trying ? (
                      <button className="btn coin mt-1 !px-2 !py-0.5 text-[11px]" disabled={working || state.coins < (i.price ?? 0)} onClick={() => buy(slot, i.id)}>
                        Buy {i.price}
                      </button>
                    ) : (
                      <span className="mt-1 flex items-center gap-0.5 text-[11px] font-bold text-coin-600">
                        <CoinIcon size={13} /> {i.price}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

      {tab === "companion" && <FamiliarStyler />}
      {tab === "companion" && state.equipment.companion && <PetNamer key={state.equipment.companion} itemId={state.equipment.companion} />}
      {tab === "look" && <LookEditor />}
      {tab === "profile" && <ProfileEditor />}
    </div>
  );
}

// The familiar's colourway and accessory live on the witch's look, so every familiar she owns wears them.
function FamiliarStyler() {
  const { state, setState, fail } = useGame();
  const look = state.character.look;
  const fam = ITEMS.find((i) => i.id === state.equipment.companion);
  const species = (fam?.art.style ?? "cat") as FamiliarSpecies;
  const save = async (patch: Record<string, unknown>) => {
    try {
      setState(await api.setLook(patch));
    } catch (e) {
      fail(e);
    }
  };
  if (!fam) return <p className="panel p-3 text-sm">Choose a familiar above, then dress it here.</p>;
  return (
    <section className="panel space-y-3 p-4">
      <div>
        <p className="mb-1 text-xs font-bold text-ink/60">Colour</p>
        <div className="flex flex-wrap gap-1.5">
          {FAMILIAR_COLOURWAYS.map((c) => (
            <button key={c} onClick={() => save({ familiarColour: c })} className={`flex flex-col items-center rounded-2xl p-1 ring-2 ${(look.familiarColour ?? "ink") === c ? "ring-accent-400" : "ring-transparent"}`} aria-label={`${COLOURWAYS[c].label} ${fam.name}`}>
              <Familiar species={species} colourway={c} accessory={look.familiarAcc ?? "none"} accent={WORLD.palette.accent} size={52} />
              <span className="text-[10px] font-bold">{COLOURWAYS[c].label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-bold text-ink/60">Accessory</p>
        <div className="flex flex-wrap gap-1.5">
          {FAMILIAR_ACCESSORIES.map((a) => (
            <button key={a} onClick={() => save({ familiarAcc: a })} className={`rounded-full px-3 py-1 text-xs font-bold ring-2 ${(look.familiarAcc ?? "none") === a ? "bg-mystic-500 text-white ring-mystic-500" : "bg-white ring-mystic-100"}`}>
              {ACCESSORY_LABEL[a]}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function PetNamer({ itemId }: { itemId: string }) {
  const { state, setState, fail, toast } = useGame();
  const saved = state.character.pet_names?.[itemId] ?? "";
  const [name, setName] = useState(saved);
  const pet = ITEMS.find((i) => i.id === itemId)?.name ?? "familiar";
  const save = async () => {
    try {
      setState(await api.namePet(itemId, name));
      toast({ tone: "flavour", text: name.trim() ? `Say hello to ${name.trim()}.` : `Your ${pet} is nameless again. Mysterious.` });
    } catch (e) {
      fail(e);
    }
  };
  return (
    <section className="panel space-y-2 p-4">
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink/60">Name your {pet}</span>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 16))} maxLength={16} placeholder="A very good name" className="w-full rounded-2xl border-2 border-accent-100 bg-white p-2 text-[16px]" />
      </label>
      <button className="btn" onClick={save} disabled={name.trim() === saved}>
        {saved ? "Rename" : "Name"}
      </button>
    </section>
  );
}

function Swatches({ colors, value, onPick, label }: { colors: string[]; value: string; onPick: (c: string) => void; label: string }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold text-ink/60">{label}</p>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button key={c} onClick={() => onPick(c)} aria-label={`${label} ${c}`} className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ${value.toLowerCase() === c ? "ring-accent-400" : "ring-white"}`} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function LookEditor() {
  const { state, setState, fail } = useGame();
  const look = state.character.look;
  const save = async (patch: Record<string, unknown>) => {
    try {
      setState(await api.setLook(patch));
    } catch (e) {
      fail(e);
    }
  };
  return (
    <section className="panel space-y-4 p-4">
      <div>
        <p className="mb-1 text-xs font-bold text-ink/60">Hairstyle</p>
        <div className="flex flex-wrap gap-1.5">
          {HAIR_STYLES.map((h) => (
            <button key={h} onClick={() => save({ hairStyle: h })} className={`rounded-full px-3 py-1 text-xs font-bold ring-2 ${look.hairStyle === h ? "bg-mystic-500 text-white ring-mystic-500" : "bg-white ring-mystic-100"}`}>
              {HAIR_LABEL[h]}
            </button>
          ))}
        </div>
      </div>
      <Swatches label="Hair colour" colors={HAIR_SWATCHES} value={look.hairColor} onPick={(c) => save({ hairColor: c })} />
      <Swatches label="Skin" colors={SKIN_SWATCHES} value={look.skin} onPick={(c) => save({ skin: c })} />
      <Swatches label="Eyes" colors={EYE_SWATCHES} value={look.eyeColor} onPick={(c) => save({ eyeColor: c })} />
      <label className="flex items-center gap-2 text-sm font-bold">
        <input type="checkbox" checked={Boolean(look.freckles)} onChange={(e) => save({ freckles: e.target.checked })} className="h-5 w-5 accent-[var(--pc-accent)]" />
        Freckles
      </label>
    </section>
  );
}

const PRONOUN_SETS = [
  { subject: "she", object: "her", possessive: "her", plural: false },
  { subject: "they", object: "them", possessive: "their", plural: true },
  { subject: "he", object: "him", possessive: "his", plural: false },
];

function ProfileEditor() {
  const { state, setState, fail, toast } = useGame();
  const c = state.character;
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const [personality, setPersonality] = useState(c.personality);
  const [pronouns, setPronouns] = useState(c.pronouns);
  const save = async () => {
    try {
      if (name.trim() && name.trim() !== c.name) await api.rename(name);
      setState(await api.updateProfile(description, personality, pronouns));
      toast({ tone: "flavour", text: "Profile saved. The coven will see it." });
    } catch (e) {
      fail(e);
    }
  };
  return (
    <section className="panel space-y-3 p-4">
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink/60">Your witch name</span>
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} maxLength={24} className="w-full rounded-2xl border-2 border-accent-100 bg-white p-2 text-[16px]" />
      </label>
      <div>
        <p className="mb-1 text-xs font-bold text-ink/60">Pronouns</p>
        <div className="flex flex-wrap gap-1.5">
          {PRONOUN_SETS.map((p) => (
            <button key={p.subject} onClick={() => setPronouns(p)} className={`rounded-full px-3 py-1 text-xs font-bold ring-2 ${pronouns.subject === p.subject ? "bg-alt-500 text-white ring-alt-500" : "bg-white ring-alt-100"}`}>
              {p.subject}/{p.object}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink/60">Personality</span>
        <textarea value={personality} onChange={(e) => setPersonality(e.target.value.slice(0, 500))} rows={3} className="w-full rounded-2xl border-2 border-accent-100 bg-white p-2 text-[16px]" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold text-ink/60">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value.slice(0, 500))} rows={3} className="w-full rounded-2xl border-2 border-accent-100 bg-white p-2 text-[16px]" />
      </label>
      <button className="btn" onClick={save}>
        Save profile
      </button>
    </section>
  );
}
