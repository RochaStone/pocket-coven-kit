"use client";
// Everything in your world, drawn, with no database needed. Open /gallery after `npm run dev`.
import { useState } from "react";
import { ACCESSORY_LABEL, COLOURWAYS, Familiar } from "@/components/art/Familiar";
import { ItemIcon } from "@/components/art/ItemIcon";
import { ActivityProp, GiftBox, MoonPhase, OracleCard, Sticker } from "@/components/art/Bits";
import { Witch, MiniWitch } from "@/components/art/Witch";
import { CHARACTERS, GIFT_TREATS, ITEMS, ORACLE_CARDS, WORLD } from "@/lib/game/catalog";
import { ANIMATIONS, FAMILIAR_ACCESSORIES, FAMILIAR_COLOURWAYS, FAMILIAR_SPECIES, MOODS, STICKERS } from "@/lib/game/types";

const H2 = ({ children }: { children: React.ReactNode }) => <h2 className="title-display on-ground mb-3 mt-8 text-2xl">{children}</h2>;

export default function Gallery() {
  const [acc, setAcc] = useState<(typeof FAMILIAR_ACCESSORIES)[number]>("hat");
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="title-display on-ground text-4xl">{WORLD.name}: the gallery</h1>
      <p className="on-ground opacity-80">Every witch, familiar and item in your world. <a className="underline" href="/gallery/scenes">See the rooms</a>.</p>

      <H2>Your witches</H2>
      <div className="flex flex-wrap gap-3">
        {CHARACTERS.map((c) => (
          <div key={c.id} className="panel flex flex-col items-center p-3">
            <Witch look={c.look} equipped={c.equipped} mood="happy" size={150} title={c.name} />
            <b>{c.name}</b>
            <span className="text-xs opacity-70">{c.title} · {c.pronouns.subject}/{c.pronouns.object}</span>
          </div>
        ))}
      </div>

      <H2>Moods</H2>
      <div className="panel flex flex-wrap gap-2 p-3">
        {MOODS.map((m) => (
          <div key={m} className="flex flex-col items-center text-xs">
            <MiniWitch look={CHARACTERS[0].look} equipped={CHARACTERS[0].equipped} mood={m} size={84} />
            {m}
          </div>
        ))}
      </div>

      <H2>Familiars: 8 species, 6 colourways, 4 accessories</H2>
      <div className="mb-2 flex gap-2">
        {FAMILIAR_ACCESSORIES.map((a) => <button key={a} className={`btn ${a === acc ? "" : "ghost"} !py-1 text-xs`} onClick={() => setAcc(a)}>{ACCESSORY_LABEL[a]}</button>)}
      </div>
      <div className="panel overflow-x-auto p-3">
        <table>
          <tbody>
            {FAMILIAR_SPECIES.map((s) => (
              <tr key={s}>
                <td className="pr-2 text-xs font-bold">{s}</td>
                {FAMILIAR_COLOURWAYS.map((c) => <td key={c}><Familiar species={s} colourway={c} accessory={acc} accent={WORLD.palette.accent} size={72} title={`${COLOURWAYS[c].label} ${s}`} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <H2>Wardrobe and shop</H2>
      <div className="panel grid grid-cols-4 gap-2 p-3 sm:grid-cols-8">
        {[...ITEMS.map((i) => ({ id: i.id, name: i.name })), ...GIFT_TREATS.map((t) => ({ id: t.id, name: t.name }))].map((i) => (
          <div key={i.id} className="flex flex-col items-center text-center text-[10px]">
            <ItemIcon itemId={i.id} size={56} />
            {i.name}
          </div>
        ))}
      </div>

      <H2>Oracle, moon, stickers, props</H2>
      <div className="panel flex flex-wrap items-end gap-3 p-3">
        {ORACLE_CARDS.slice(0, 6).map((c) => <OracleCard key={c.id} symbol={c.symbol} name={c.name} size={90} />)}
        {[0, 0.25, 0.5, 0.75].map((p) => <MoonPhase key={p} phase={p} size={56} />)}
        {STICKERS.map((s) => <Sticker key={s} sticker={s} size={48} />)}
        <GiftBox size={64} />
        {ANIMATIONS.map((a) => <ActivityProp key={a} animation={a} size={44} />)}
      </div>
    </main>
  );
}
