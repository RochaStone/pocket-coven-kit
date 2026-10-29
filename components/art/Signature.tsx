"use client";
// Signature wardrobe pieces: a mer-witch tail, a gold crown, a pearl strand, fin ears and a shell clip.
// They join a world only when a witch's config wears them (witches.slots[].wear), so drawn worlds stay as they are.
// Same coordinate box as Witch.tsx (head centred at 100,92; waist about y 168; feet about y 230).
import { useId } from "react";
import { darken, lighten, mix } from "./colour";

// A puff-sleeved top over a tail that fades from the main colour (M) to the trim colour (T), ending in a fin.
export function MerTail({ M, T, skin }: { M: string; T: string; skin: string }) {
  const grad = useId().replace(/:/g, "");
  const line = darken(M, 0.45);
  const skinLine = darken(skin, 0.4);
  const fin = mix(T, "#b9b3f5", 0.35);
  const s = { stroke: line, strokeWidth: 2, strokeLinejoin: "round" as const };
  return (
    <g>
      <defs>
        <linearGradient id={grad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={lighten(M, 0.1)} />
          <stop offset="0.55" stopColor={mix(M, T, 0.55)} />
          <stop offset="1" stopColor={T} />
        </linearGradient>
      </defs>
      {/* the tail and its fin */}
      <path d="M100 218 C88 220 74 230 70 244 C84 241 94 236 100 229 C106 236 116 241 130 244 C126 230 112 220 100 218 Z" fill={fin} {...s} />
      <path d="M100 222 L100 240 M100 224 L86 238 M100 224 L114 238" stroke={lighten(fin, 0.45)} strokeWidth={1.2} fill="none" />
      <path d="M76 164 Q100 170 124 164 C127 188 117 208 106 222 L94 222 C83 208 73 188 76 164 Z" fill={`url(#${grad})`} {...s} />
      {[182, 194, 206].map((y, row) => (
        <path key={y} d={Array.from({ length: 5 - row }, (_, i) => `M${80 + row * 4 + i * 8} ${y} q4 4 8 0`).join(" ")} stroke="#fff" strokeWidth={1.4} fill="none" opacity={0.75} />
      ))}
      {/* bare arms under puff sleeves */}
      <path d="M76 134 C64 142 60 160 62 172 L72 172 C72 158 76 146 82 140 Z" fill={skin} stroke={skinLine} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M124 134 C136 142 140 160 138 172 L128 172 C128 158 124 146 118 140 Z" fill={skin} stroke={skinLine} strokeWidth={1.6} strokeLinejoin="round" />
      {/* the top: skin at the middle, a pink band, scalloped edge at the waist */}
      <path d="M80 132 Q100 128 120 132 L122 166 Q100 170 78 166 Z" fill={skin} stroke={skinLine} strokeWidth={1.6} />
      <path d="M80 132 Q100 128 120 132 L121 150 Q100 154 79 150 Z" fill={M} {...s} />
      <path d={Array.from({ length: 6 }, (_, i) => `M${77 + i * 8} 166 q4 6 8 0`).join(" ")} fill={lighten(M, 0.15)} stroke={line} strokeWidth={1.4} />
      <ellipse cx={77} cy={137} rx={11} ry={8} fill={M} {...s} />
      <ellipse cx={123} cy={137} rx={11} ry={8} fill={M} {...s} />
      <path d="M68 142 Q77 147 86 142 M114 142 Q123 147 132 142" stroke={lighten(M, 0.7)} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

// A gold crown with pearl tips and a gem at the front.
export function Crown({ gold, gem }: { gold: string; gem: string }) {
  const line = darken(gold, 0.5);
  return (
    <g>
      <path d="M70 58 L66 30 L84 44 L100 24 L116 44 L134 30 L130 58 Z" fill={gold} stroke={line} strokeWidth={2} strokeLinejoin="round" />
      <path d="M70 52 Q100 57 130 52 L130 58 Q100 63 70 58 Z" fill={lighten(gold, 0.3)} stroke={line} strokeWidth={1.2} />
      {[[66, 28], [84, 42], [100, 21], [116, 42], [134, 28]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={4} fill="#fff7f4" stroke={line} strokeWidth={1.4} />)}
      <path d="M100 39 L105 47 L100 55 L95 47 Z" fill={gem} stroke={line} strokeWidth={1.2} />
      <circle cx={82} cy={53} r={2.2} fill={lighten(gem, 0.5)} stroke={line} strokeWidth={0.8} />
      <circle cx={118} cy={53} r={2.2} fill={lighten(gem, 0.5)} stroke={line} strokeWidth={0.8} />
    </g>
  );
}

// A strand of pearls with a little bow at the middle.
export function Pearls({ pearl, bow }: { pearl: string; bow: string }) {
  const line = darken(pearl, 0.45);
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    return [(1 - t) ** 2 * 84 + 2 * (1 - t) * t * 100 + t * t * 116, (1 - t) ** 2 * 128 + 2 * (1 - t) * t * 148 + t * t * 128];
  });
  return (
    <g>
      {pts.map(([x, y]) => <circle key={x} cx={x} cy={y} r={3.2} fill={pearl} stroke={line} strokeWidth={1} />)}
      <path d="M100 146 L91 141 L91 151 Z M100 146 L109 141 L109 151 Z" fill={bow} stroke={darken(bow, 0.4)} strokeWidth={1} strokeLinejoin="round" />
      <circle cx={100} cy={146} r={2.4} fill={pearl} stroke={line} strokeWidth={0.8} />
    </g>
  );
}

// Fin ears over each ear, in the main colour with paler ribs.
export function FinEars({ M }: { M: string }) {
  const line = darken(M, 0.45);
  const one = (
    <g>
      <path d="M60 91 C48 84 40 90 44 99 C40 108 48 114 60 108 Z" fill={M} stroke={line} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M58 99 L46 93 M58 99 L45 99 M58 99 L46 105" stroke={lighten(M, 0.5)} strokeWidth={1.2} />
    </g>
  );
  return (
    <g>
      {one}
      <g transform="translate(200 0) scale(-1 1)">{one}</g>
    </g>
  );
}

// A scallop shell clip with a pearl at its hinge (drawn inside the hair accessory's spot).
export function ShellClip({ M, pearl }: { M: string; pearl: string }) {
  const line = darken(M, 0.45);
  return (
    <g transform="rotate(18)">
      <path d="M0 9 L-13 -3 Q-9 -15 0 -16 Q9 -15 13 -3 Z" fill={M} stroke={line} strokeWidth={1.4} strokeLinejoin="round" />
      <path d="M0 9 L-9 -10 M0 9 L-3 -15 M0 9 L3 -15 M0 9 L9 -10" stroke={lighten(M, 0.55)} strokeWidth={1.2} />
      <circle cx={0} cy={9} r={2.8} fill={pearl} stroke={line} strokeWidth={0.8} />
    </g>
  );
}

