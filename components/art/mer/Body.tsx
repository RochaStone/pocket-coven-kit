"use client";
// The mer-witch's body and signature pieces, ported from the original pocket coven art.
// Every piece takes its colours from the wardrobe item; with the default colours it draws exactly as the original.
import type { CSSProperties } from "react";
import { darken, mix, OUTLINE, type SkinPalette } from "./color";
import { armPts, type Build, ol, type Pt, scallops, skirtD, SPARKLE_D, thin } from "./geometry";

// Default colours of each signature piece (the original's). A wardrobe item in these colours draws pixel for pixel.
export const MER_DEFAULTS = {
  mer_tail: ["#ff9fd0", "#7fe3e0"],
  crown: ["#f2cd78", "#ff8fc8"],
  pearls: ["#fffaf6", "#b98aa8"],
  shell_clip: ["#ffd9ea", "#ff9fcb"],
  fins: ["#ffc4e6", "#fff7f4"],
} as const;

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
// Re-tints one of the original's fixed colours toward a founder's own main colour (unchanged when hers is the default).
const tintWith = (main: string, def: string) => (hex: string) => (same(main, def) ? hex : mix(hex, main, 0.6));

export function Grad({ id, stops, x2 = 0, y2 = 1 }: { id: string; stops: [number, string, number?][]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c, op], i) => (
        <stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />
      ))}
    </linearGradient>
  );
}

export function Glitter({ pts, color = "#fff", s = 1 }: { pts: Pt[]; color?: string; s?: number }) {
  return (
    <g fill={color}>
      {pts.map(([x, y], i) => (
        <path key={i} d={SPARKLE_D} transform={`translate(${x} ${y}) scale(${(i % 3 === 0 ? 0.42 : 0.28) * s})`} />
      ))}
    </g>
  );
}

// The babydoll top worn with the tail: a scalloped peplum (lower) and the bodice with its bow (upper).
export function MerTop({ b, u, main }: { b: Build; u: string; main: string }) {
  const t = tintWith(main, MER_DEFAULTS.mer_tail[0]);
  const emp = b.sY + 15;
  const hemY = b.waistY + 5;
  const hemW = b.wa + 9;
  return {
    lower: (
      <g>
        <defs>
          <Grad id={`${u}-bd`} stops={[[0, t("#ffaed6")], [0.6, t("#ff94c6")], [1, t("#f075b0")]]} />
        </defs>
        <path d={skirtD(emp, b.sh - 4, hemY + 2, hemW + 1, 5, 4)} fill="#fff6fb" {...ol} />
        <path d={skirtD(emp, b.sh - 4, hemY, hemW, 5, 3.5)} fill={`url(#${u}-bd)`} {...ol} />
        <path d={`M ${100 - 6} ${emp + 4} L ${100 - 10} ${hemY - 2} M ${100 + 6} ${emp + 4} L ${100 + 10} ${hemY - 2} M 100 ${emp + 4} L 100 ${hemY - 1}`} stroke={t("#e46aa6")} strokeWidth={1} fill="none" opacity={0.6} />
        <Glitter pts={[[100 - hemW + 9, hemY - 7], [92, emp + 14], [108, emp + 10], [100 + hemW - 8, hemY - 9], [100, hemY - 6]]} />
      </g>
    ),
    upper: (
      <g>
        <path d={`M ${100 - b.sh + 3} ${b.sY + 3} Q 100 ${b.sY + 13} ${100 + b.sh - 3} ${b.sY + 3} L ${100 + b.sh - 3} ${emp} L ${100 - b.sh + 3} ${emp} Z`} fill={t("#ffb0d6")} {...ol} />
        <path d={`M ${100 - b.sh + 4} ${b.sY + 4} Q 100 ${b.sY + 14} ${100 + b.sh - 4} ${b.sY + 4}`} fill="none" stroke="#fff6fb" strokeWidth={2.2} strokeDasharray="0.1 3.2" strokeLinecap="round" />
        <rect x={100 - b.sh + 2.5} y={emp - 2.2} width={(b.sh - 2.5) * 2} height={4.4} rx={2} fill="#fff1f8" {...thin} />
        <g transform={`translate(100 ${emp})`}>
          <path d="M0 0 C -4 -5 -10 -4 -9 0 C -10 4 -4 5 0 0 Z M0 0 C 4 -5 10 -4 9 0 C 10 4 4 5 0 0 Z" fill={t("#ff7fbf")} {...thin} />
          <path d="M -1 1 L -4 8 M 1 1 L 4 8" stroke={t("#ff7fbf")} strokeWidth={2} strokeLinecap="round" />
          <circle r={1.8} fill="#ffe3f1" {...thin} />
        </g>
      </g>
    ),
    sleeveFill: t("#ffa8d2"),
    sleeveTrim: "#fff4fa",
  };
}

// An arm with a puff sleeve (or bare, when sleeveFill is empty).
export function Arm({ b, sp, sleeveFill, sleeveTrim }: { b: Build; sp: SkinPalette; sleeveFill?: string; sleeveTrim?: string }) {
  const { S, E, H } = armPts(b);
  const armD = `M ${S[0]} ${S[1]} Q ${E[0] - 1} ${E[1] - 7} ${E[0]} ${E[1]} Q ${E[0] + 2.5} ${E[1] + 7} ${H[0]} ${H[1]}`;
  return (
    <g>
      <path d={armD} stroke={sp.line} strokeWidth={b.armW + 3} strokeLinecap="round" fill="none" />
      <path d={armD} stroke={sp.base} strokeWidth={b.armW} strokeLinecap="round" fill="none" />
      <path d={`M ${S[0] - 1.5} ${S[1] + 4} Q ${E[0] - 3.5} ${E[1] - 4} ${E[0] - 2} ${E[1] + 2}`} stroke={sp.light} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.6} />
      {sleeveFill && (
        <g>
          <ellipse cx={S[0] + 2.5} cy={S[1] + 3.5} rx={8.6} ry={8} fill={sleeveFill} {...ol} />
          <path d={`M ${S[0] - 4} ${S[1] + 8} Q ${S[0] + 3} ${S[1] + 13.5} ${S[0] + 10} ${S[1] + 7}`} fill="none" stroke={sleeveTrim ?? "#fff"} strokeWidth={2.2} strokeLinecap="round" />
          <ellipse cx={S[0] + 0.5} cy={S[1] + 0.5} rx={3} ry={2} fill="#fff" opacity={0.55} />
        </g>
      )}
      <circle cx={H[0] + 0.5} cy={H[1] + 1} r={b.armW / 2 + 1.2} fill={sp.base} stroke={sp.line} strokeWidth={1.4} />
    </g>
  );
}

const FIN_LOBE = "M -3 -2 C -10 4 -20 13 -17 21 C -10 23 -3 17 1 9 C 4 17 14 24 25 20 C 26 12 15 2 5 -3 Z";

// The tail: main colour at the waist fading to the trim colour, scale pattern, shimmer, and a lobed fin.
export function Tail({ b, u, main, trim, sway = true }: { b: Build; u: string; main: string; trim: string; sway?: boolean }) {
  const isDefault = same(main, MER_DEFAULTS.mer_tail[0]) && same(trim, MER_DEFAULTS.mer_tail[1]);
  const g: [string, string, string] = isDefault ? ["#ffb3dc", "#ff9fd0", "#7fe3e0"] : [mix(main, "#ffffff", 0.18), main, trim];
  const fin: [string, string] = isDefault ? ["#a9f0ea", "#c9b6ff"] : [mix(trim, "#ffffff", 0.35), mix(trim, "#c9b6ff", 0.6)];
  const jY = b.footY - 17;
  const jx = 107;
  const L = 100 - b.wa - 1.5, R = 100 + b.wa + 1.5, top = b.waistY - 5;
  const d = `M ${L} ${top} C ${100 - b.hip - 6} ${b.waistY + 14}, ${100 - b.hip + 1} ${b.waistY + 36}, ${jx - 5} ${jY} L ${jx + 4} ${jY - 2} C ${jx + 10} ${b.waistY + 30}, ${100 + b.hip + 5} ${b.waistY + 14}, ${R} ${top} Z`;
  const id2 = `${u}-t14`;
  return (
    <g>
      <defs>
        <Grad id={`${id2}g`} stops={[[0, g[0]], [0.45, g[1]], [1, g[2]]]} />
        <Grad id={`${id2}f`} x2={1} y2={1} stops={[[0, fin[0]], [1, fin[1]]]} />
        <pattern id={`${id2}p`} width={7} height={10} patternUnits="userSpaceOnUse">
          <path d="M 0 5 Q 3.5 0 7 5 M -3.5 10 Q 0 5 3.5 10 M 3.5 10 Q 7 5 10.5 10" fill="none" stroke="#ffffff" strokeWidth={0.8} opacity={0.75} />
        </pattern>
        <clipPath id={`${id2}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g className={sway ? "pcw-fin" : undefined} style={{ transformBox: "fill-box", transformOrigin: "30% 0%" } as CSSProperties}>
        <g transform={`translate(${jx} ${jY})`}>
          <path d={FIN_LOBE} fill={`url(#${id2}f)`} {...ol} />
          <path d={FIN_LOBE} fill="none" stroke="#fff" strokeWidth={0.8} opacity={0.6} transform="scale(0.7) translate(1 1)" />
          <path d="M 1 2 L -12 16 M 2 3 L 0 19 M 3 2 L 14 18" stroke={darken(fin[1], 0.15)} strokeWidth={0.8} opacity={0.55} fill="none" />
        </g>
      </g>
      <path d={d} fill={`url(#${id2}g)`} {...ol} />
      <g clipPath={`url(#${id2}c)`}>
        <rect x={60} y={top} width={80} height={jY - top + 4} fill={`url(#${id2}p)`} />
        <path d={`M ${L + 4} ${top + 6} C ${100 - b.hip - 1} ${b.waistY + 16}, ${100 - b.hip + 4} ${b.waistY + 32}, ${jx - 4} ${jY - 4}`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.45} strokeLinecap="round" />
        <g className={sway ? "pcw-shimmer" : undefined}>
          <path d={`M 70 ${jY + 8} L 82 ${jY + 8} L 104 ${top - 6} L 92 ${top - 6} Z`} fill="#fff" opacity={0.28} />
        </g>
      </g>
      <path d={`M ${L - 1} ${top + 2}${scallops(L - 1, R + 1, top + 2, 6, 4.5)}`} fill={fin[0]} stroke={OUTLINE} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  );
}

// Drawn with the origin at the crown of the head (100, 40 in avatar space).
export function Crown({ gold, gem }: { gold: string; gem: string }) {
  return (
    <g transform="translate(0 6)">
      <path d="M -22 4 L -24 -10 L -14 -3 L -7 -16 L 0 -5 L 7 -16 L 14 -3 L 24 -10 L 22 4 Q 0 9 -22 4 Z" fill={gold} {...ol} />
      <path d="M -21 1 Q 0 6 21 1" stroke="#fff3cf" strokeWidth={1.2} fill="none" />
      {[[-24, -11], [-7, -17], [7, -17], [24, -11]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={3} fill="#fffaf4" {...thin} />
          <circle cx={x - 1} cy={y - 1} r={1} fill="#fff" />
        </g>
      ))}
      <circle cx={0} cy={-8} r={4.4} fill="#fffaf4" {...thin} />
      <circle cx={-1.4} cy={-9.4} r={1.4} fill="#fff" />
      <path d="M 0 -2 L 3 1.5 L 0 5 L -3 1.5 Z" fill={gem} {...thin} />
      {[-15, 15].map((x) => (
        <circle key={x} cx={x} cy={2.5} r={1.6} fill="#c9f2f0" {...thin} />
      ))}
    </g>
  );
}

// Drawn with the origin at the base of the neck.
export function Pearls({ pearl, line }: { pearl: string; line: string }) {
  const pts = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10;
    const x = -11 + 22 * t;
    return [x, -1 + 10 * (1 - (x / 11) ** 2)] as Pt;
  });
  return (
    <g>
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={2.2} fill={pearl} stroke={line} strokeWidth={0.6} />
          <circle cx={x - 0.7} cy={y - 0.7} r={0.7} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

export function ShellClip({ shell, rib }: { shell: string; rib: string }) {
  return (
    <g transform="rotate(20)">
      <path d="M 0 8 L -11 -3 Q -8 -11 0 -12 Q 8 -11 11 -3 Z" fill={shell} {...ol} />
      <path d="M 0 8 L -6 -9 M 0 8 L 0 -11 M 0 8 L 6 -9 M 0 8 L -10 -3 M 0 8 L 10 -3" stroke={rib} strokeWidth={0.9} />
      <path d="M -5 -9 Q 0 -11 5 -9" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx={0} cy={8} r={2.6} fill="#fffaf6" {...thin} />
    </g>
  );
}

// One ear: a fin when she wears fins, otherwise a plain ear (drawn on the right; mirror for the left).
export function Ear({ fin, sp }: { fin?: string; sp: SkinPalette }) {
  if (fin) return <path d="M 141 100 Q 154 90 158 96 Q 155 100 157 106 Q 151 110 141 112 Z" fill={fin} stroke={OUTLINE} strokeWidth={1.4} strokeLinejoin="round" />;
  return (
    <g>
      <ellipse cx={143} cy={104} rx={6} ry={8} fill={sp.base} stroke={sp.line} strokeWidth={1.4} />
      <path d="M 144 100 Q 147 104 144 108" stroke={sp.shade} strokeWidth={1.2} fill="none" />
    </g>
  );
}

