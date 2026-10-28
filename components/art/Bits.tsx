"use client";
// Small pieces of art: chat stickers, the moon, gift boxes, celebration twinkles and activity props.
// Twinkles appear only in celebration moments (treasure, ceremonies, a new familiar), never as everyday decoration.
import type { ReactNode } from "react";
import { useArt } from "./ArtContext";
import type { AnimationKey, Sticker as StickerId } from "@/lib/game/types";
import { darken, INK, lighten, starPath } from "./colour";

const P = () => useArt().palette;

export function Sticker({ sticker, size = 64 }: { sticker: StickerId; size?: number }) {
  const p = P();
  const body: Record<StickerId, ReactNode> = {
    heart: <path d="M32 54 C10 40 6 24 16 16 C24 10 30 14 32 20 C34 14 40 10 48 16 C58 24 54 40 32 54 Z" fill={p.accent} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />,
    sparkle: <g><path d={starPath(30, 32, 22, 0.28, 4)} fill={p.coin} stroke={INK} strokeWidth={2} /><path d={starPath(50, 14, 7, 0.3, 4)} fill={p.coin} /></g>,
    crescent: <path d="M40 10 A22 22 0 1 0 40 54 A17 17 0 1 1 40 10 Z" fill={lighten(p.glow, 0.3)} stroke={INK} strokeWidth={2.2} />,
    cauldron: <g><path d="M10 26 L54 26 C56 48 46 56 32 56 C18 56 8 48 10 26 Z" fill="#2e2836" stroke={INK} strokeWidth={2} /><ellipse cx={32} cy={26} rx={22} ry={5} fill={p.alt} /><circle cx={24} cy={16} r={4} fill={lighten(p.alt, 0.4)} /><circle cx={38} cy={10} r={3} fill={lighten(p.alt, 0.4)} /></g>,
    gasp: <g><circle cx={32} cy={32} r={24} fill={lighten(p.coin, 0.5)} stroke={INK} strokeWidth={2.2} /><circle cx={24} cy={26} r={3} fill={INK} /><circle cx={40} cy={26} r={3} fill={INK} /><ellipse cx={32} cy={42} rx={6} ry={8} fill={INK} /></g>,
    starfall: <g>{[[16, 14, 7], [36, 24, 9], [22, 40, 6], [46, 46, 8]].map(([x, y, r]) => <path key={`${x}${y}`} d={starPath(x, y, r)} fill={p.coin} stroke={INK} strokeWidth={1.4} />)}</g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={sticker}>
      {body[sticker]}
    </svg>
  );
}

// phase: 0 new, 0.5 full.
export function MoonPhase({ phase, size = 80 }: { phase: number; size?: number }) {
  const p = P();
  const lit = lighten(p.glow, 0.55);
  const dark = darken(p.skyDeep, 0.1);
  const f = Math.cos(phase * 2 * Math.PI); // 1 new, -1 full
  const waxing = phase < 0.5;
  const rx = Math.abs(f) * 30;
  const litOnRight = waxing;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="The moon tonight">
      <circle cx={32} cy={32} r={30} fill={dark} stroke={INK} strokeWidth={1.4} />
      <path d={`M32 2 A30 30 0 0 ${litOnRight ? 1 : 0} 32 62 A${rx} 30 0 0 ${(f > 0) === litOnRight ? 0 : 1} 32 2 Z`} fill={lit} />
    </svg>
  );
}

export function GiftBox({ open = false, size = 96 }: { open?: boolean; size?: number }) {
  const p = P();
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="A wrapped gift">
      <rect x={12} y={28} width={40} height={30} rx={3} fill={p.accent} stroke={INK} strokeWidth={2} />
      <rect x={29} y={28} width={6} height={30} fill={p.coin} />
      <g style={{ transform: open ? "translate(0, -12px) rotate(-12deg)" : "none", transformOrigin: "12px 24px", transition: "transform 0.5s" }}>
        <rect x={9} y={20} width={46} height={10} rx={2} fill={darken(p.accent, 0.12)} stroke={INK} strokeWidth={2} />
        <rect x={29} y={20} width={6} height={10} fill={p.coin} />
        <path d="M32 20 C22 8 14 14 22 20 Z M32 20 C42 8 50 14 42 20 Z" fill={p.coin} stroke={INK} strokeWidth={1.6} />
      </g>
    </svg>
  );
}

export function Twinkles({ count = 10, className = "" }: { count?: number; className?: string }) {
  const coin = P().coin;
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} width={14} height={14} viewBox="0 0 14 14" className="anim-twinkle absolute" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 5) * 0.4}s` }}>
          <path d={starPath(7, 7, 6, 0.3, 4)} fill={coin} />
        </svg>
      ))}
    </div>
  );
}

export function TreasureBurst({ show, children }: { show: boolean; children?: ReactNode }) {
  return (
    <div className="relative">
      {show && <Twinkles count={12} />}
      {children}
    </div>
  );
}

export function JoinRipple() {
  const p = P();
  return <span aria-hidden className="join-ripple absolute bottom-2 left-1/2 h-6 w-16 -translate-x-1/2 rounded-full border-2" style={{ borderColor: p.alt }} />;
}

// A little prop that pops up beside the witch while she does something.
export function ActivityProp({ animation, size = 72 }: { animation: AnimationKey; size?: number }) {
  const p = P();
  const glyph: Partial<Record<AnimationKey, ReactNode>> = {
    eat: <g><path d="M8 30 L56 30 C56 46 46 54 32 54 C18 54 8 46 8 30 Z" fill={p.accent} stroke={INK} strokeWidth={2} /><ellipse cx={32} cy={30} rx={24} ry={4} fill="#d98a4a" /></g>,
    drink: <g><path d="M14 22 L46 22 L42 52 L18 52 Z" fill={p.alt} stroke={INK} strokeWidth={2} /><path d="M46 28 C56 28 56 42 44 44" stroke={INK} strokeWidth={3} fill="none" /><path d="M28 6 q4 6 0 12 M36 8 q4 6 0 10" stroke="#c9b9a9" strokeWidth={2} fill="none" /></g>,
    sleep: <g fill={INK}><text x={14} y={44} fontSize={22} fontWeight={700}>z</text><text x={30} y={30} fontSize={16} fontWeight={700}>z</text><text x={42} y={18} fontSize={12} fontWeight={700}>z</text></g>,
    bathe: <g>{[[20, 40, 10], [38, 28, 8], [44, 46, 6], [24, 18, 5]].map(([x, y, r]) => <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#fff" stroke={p.water} strokeWidth={2} />)}</g>,
    cuddle: <path d="M32 54 C10 40 6 24 16 16 C24 10 30 14 32 20 C34 14 40 10 48 16 C58 24 54 40 32 54 Z" fill={p.accent} stroke={INK} strokeWidth={2} />,
    play: <g><circle cx={32} cy={34} r={18} fill={p.coin} stroke={INK} strokeWidth={2} /><path d="M14 34 H50 M32 16 V52" stroke={INK} strokeWidth={1.4} /></g>,
    dance: <g fill={INK}><path d="M20 44 a6 5 0 1 0 6 -4 V14 l16 -4 V36" stroke={INK} strokeWidth={3} fill="none" /><circle cx={42} cy={40} r={5} /><circle cx={20} cy={46} r={5} /></g>,
    sing: <g fill={INK}><path d="M24 44 V16 l18 -6 V40" stroke={INK} strokeWidth={3} fill="none" /><circle cx={20} cy={46} r={6} /><circle cx={38} cy={42} r={6} /></g>,
    spell: <g><path d="M12 52 L40 24" stroke={p.wood} strokeWidth={4} strokeLinecap="round" />{[[44, 18, 8], [54, 32, 5], [30, 10, 4]].map(([x, y, r]) => <path key={`${x}${y}`} d={starPath(x, y, r, 0.35, 4)} fill={p.coin} />)}</g>,
    brew: <g><path d="M10 26 L54 26 C56 48 46 56 32 56 C18 56 8 48 10 26 Z" fill="#2e2836" stroke={INK} strokeWidth={2} /><ellipse cx={32} cy={26} rx={22} ry={5} fill={p.mystic} /><circle cx={26} cy={14} r={4} fill={lighten(p.mystic, 0.4)} /></g>,
    swim: <g stroke={p.water} strokeWidth={4} fill="none" strokeLinecap="round"><path d="M6 30 q8 -8 16 0 t16 0 t16 0" /><path d="M6 44 q8 -8 16 0 t16 0 t16 0" /></g>,
    explore: <g><path d="M12 24 L52 24 L48 54 L16 54 Z" fill={p.wood} stroke={INK} strokeWidth={2} /><path d="M20 24 C20 8 44 8 44 24" stroke={INK} strokeWidth={3} fill="none" /><circle cx={26} cy={22} r={5} fill={p.accent} /><circle cx={38} cy={20} r={5} fill={p.leaf} /></g>,
    stargaze: <g>{[[18, 18, 7], [40, 14, 5], [32, 38, 9], [52, 40, 5]].map(([x, y, r]) => <path key={`${x}${y}`} d={starPath(x, y, r)} fill={p.coin} stroke={INK} strokeWidth={1} />)}</g>,
    work: <g><circle cx={32} cy={36} r={18} fill={p.coin} stroke={INK} strokeWidth={2} /><path d={starPath(32, 36, 8)} fill={lighten(p.coin, 0.4)} /></g>,
    dig: <g><path d="M44 8 L28 40" stroke={p.wood} strokeWidth={4} strokeLinecap="round" /><path d="M22 34 L36 42 L28 56 L14 48 Z" fill="#9aa0a6" stroke={INK} strokeWidth={2} /></g>,
    read: <g><path d="M8 18 Q20 12 32 18 V52 Q20 46 8 52 Z" fill="#f6f0e1" stroke={INK} strokeWidth={2} /><path d="M56 18 Q44 12 32 18 V52 Q44 46 56 52 Z" fill="#f6f0e1" stroke={INK} strokeWidth={2} /><path d="M14 26 h12 M14 32 h12 M38 26 h12 M38 32 h12" stroke={darken("#f6f0e1", 0.4)} strokeWidth={1.4} /></g>,
    garden: <g><path d="M10 34 L40 34 L48 26 L50 30 L42 40 L14 44 Z" fill={p.alt} stroke={INK} strokeWidth={2} />{[[52, 40], [56, 48], [48, 50]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={2} fill={p.water} />)}</g>,
    stretch: <path d="M8 46 Q32 10 56 46" stroke={p.accent} strokeWidth={5} fill="none" strokeLinecap="round" />,
    toast: <g>{[18, 40].map((x, i) => <g key={x} transform={`rotate(${i ? 12 : -12} ${x} 40)`}><path d={`M${x - 8} 16 L${x + 8} 16 L${x + 6} 34 Q${x} 40 ${x - 6} 34 Z`} fill={lighten(p.glow, 0.3)} stroke={INK} strokeWidth={2} /><path d={`M${x} 38 V52 M${x - 6} 52 H${x + 6}`} stroke={INK} strokeWidth={2} /></g>)}</g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {glyph[animation] ?? glyph.spell}
    </svg>
  );
}

export function OracleSymbol({ symbol, size = 80 }: { symbol: string; size?: number }) {
  const p = P();
  const gold = p.coin;
  const line = { stroke: gold, strokeWidth: 2.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const s: Record<string, ReactNode> = {
    moon: <path d="M40 12 A22 22 0 1 0 40 52 A16 16 0 1 1 40 12 Z" {...line} />,
    sun: <g><circle cx={32} cy={32} r={10} {...line} />{Array.from({ length: 8 }, (_, i) => <path key={i} d="M32 14 V8" {...line} transform={`rotate(${i * 45} 32 32)`} />)}</g>,
    star: <path d={starPath(32, 32, 22)} {...line} />,
    key: <g><circle cx={22} cy={22} r={8} {...line} /><path d="M28 28 L52 52 M44 44 L50 38 M48 48 L54 42" {...line} /></g>,
    candle: <g><path d="M24 24 H40 V56 H24 Z" {...line} /><path d="M32 8 q-6 8 0 12 q6 -4 0 -12" {...line} /></g>,
    cauldron: <g><path d="M12 24 H52 C54 46 44 54 32 54 C20 54 10 46 12 24 Z" {...line} /><path d="M24 14 a3 3 0 1 0 0.1 0 M36 8 a2 2 0 1 0 0.1 0" {...line} /></g>,
    broom: <g><path d="M48 8 L26 40" {...line} /><path d="M24 36 L34 42 L22 58 L8 52 Z" {...line} /></g>,
    owl: <g><path d="M16 50 C12 26 22 12 32 12 C42 12 52 26 48 50 Z" {...line} /><circle cx={25} cy={28} r={5} {...line} /><circle cx={39} cy={28} r={5} {...line} /><path d="M30 36 L32 40 L34 36" {...line} /></g>,
    mushroom: <g><path d="M10 32 C10 12 54 12 54 32 Z" {...line} /><path d="M26 32 L24 54 H40 L38 32" {...line} /></g>,
    crystal: <path d="M32 6 L44 22 L40 58 H24 L20 22 Z M20 22 H44 M32 6 V58" {...line} />,
    feather: <g><path d="M48 8 C20 14 12 40 16 56 C34 50 52 30 48 8 Z" {...line} /><path d="M46 10 L16 56" {...line} /></g>,
    door: <g><path d="M18 58 V22 A14 14 0 0 1 46 22 V58 Z" {...line} /><circle cx={40} cy={40} r={1.6} fill={gold} /></g>,
    tree: <g><path d="M32 58 V30 M32 40 L20 28 M32 36 L44 24" {...line} /><circle cx={32} cy={22} r={14} {...line} /></g>,
    river: <g><path d="M6 24 q10 -8 20 0 t20 0 t20 0 M6 36 q10 -8 20 0 t20 0 t20 0 M6 48 q10 -8 20 0 t20 0 t20 0" {...line} /></g>,
    lantern: <g><path d="M24 18 H40 L44 26 V48 H20 V26 Z M32 8 V18 M20 52 H44" {...line} /><path d="M32 30 q-4 6 0 10 q4 -4 0 -10" {...line} /></g>,
    spindle: <g><path d="M32 6 V58" {...line} /><ellipse cx={32} cy={36} rx={14} ry={10} {...line} /><path d="M20 30 Q32 40 44 30 M20 40 Q32 30 44 42" {...line} /></g>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      {s[symbol] ?? s.star}
    </svg>
  );
}

export function OracleCard({ symbol, name, revealed = true, size = 180 }: { symbol: string; name?: string; revealed?: boolean; size?: number }) {
  const p = P();
  const h = size * 1.55;
  return (
    <div className="oracle-card relative grid place-items-center overflow-hidden rounded-[14px]" style={{ width: size, height: h, background: p.groundDeep, border: `2px solid ${p.coin}` }}>
      <div className="absolute inset-2 rounded-[10px]" style={{ border: `1px solid ${p.coin}` }} aria-hidden />
      {revealed ? (
        <div className="flex flex-col items-center gap-2">
          <OracleSymbol symbol={symbol} size={size * 0.5} />
          {name && size > 80 && <span className="font-display text-sm" style={{ color: lighten(p.coin, 0.4) }}>{name}</span>}
        </div>
      ) : (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 64 64" aria-hidden>
          <path d="M40 12 A22 22 0 1 0 40 52 A16 16 0 1 1 40 12 Z" fill="none" stroke={p.coin} strokeWidth={2} />
          {[[48, 18], [52, 34], [44, 48]].map(([x, y]) => <path key={x} d={starPath(x, y, 3)} fill={p.coin} />)}
        </svg>
      )}
    </div>
  );
}
