"use client";
// The mer-witch's hair, eyes, brows, mouth and mood effects, ported unchanged from the original pocket coven art.
import type { CSSProperties, ReactNode } from "react";
import type { HairStyle, Mood } from "@/lib/game/types";
import { darken, INK, lighten, luminance, mix, OUTLINE, type HairPalette, type SkinPalette } from "./color";
import { type Build, EYE_D, f, fringe, HEART_D, mirrorD, ol, type Pt, scallops, SPARKLE_D, starD, thin } from "./geometry";
import { Grad } from "./Body";

// The original's hair shapes, and which one each of the kit's hair styles uses.
type Shape = "long_waves" | "straight_long" | "beach_waves" | "pixie" | "space_buns" | "pigtails";
export const HAIR_SHAPE: Record<HairStyle, { shape: Shape; curly?: boolean }> = {
  long_waves: { shape: "long_waves" },
  straight_long: { shape: "straight_long" },
  bob: { shape: "beach_waves" },
  curls: { shape: "long_waves", curly: true },
  braid: { shape: "straight_long" },
  pixie: { shape: "pixie" },
  buns: { shape: "space_buns" },
  pigtails: { shape: "pigtails" },
};
export type { Shape as HairShapeId };
export const hairExtra = (shape: Shape, p: HairPalette, u: string) => HAIR[shape].extra?.(p, u);

interface HairShape {
  back?: string;
  backInner?: string;
  cap: string;
  locks?: string[];
  extra?: (p: HairPalette, u: string) => ReactNode;
  strands?: string;
  shine: string;
  earsVisible?: boolean;
}

const LOCK_L_LONG = "M 54 90 C 45 110 52 128 44 146 C 40 156 45 165 52 167 C 50 158 56 150 60 140 C 64 126 60 110 63 94 Z";
const LOCK_L_STRAIGHT = "M 51 88 C 49 106 48 126 48 143 L 62 143 C 62 124 62 106 63 92 Z";
const LOCK_L_WAVE = "M 53 90 C 46 106 52 120 46 134 C 43 142 47 150 53 151 C 52 144 57 138 60 130 C 63 118 60 106 63 94 Z";
const LOCK_L_BOB = "M 51 90 C 47 108 46 124 50 140 Q 56 142 62 136 C 60 122 61 106 63 92 Z";

const HAIR: Record<Shape, HairShape> = {
  long_waves: {
    back: "M 54 66 C 28 92 24 150 32 186 C 26 198 36 212 48 208 C 54 218 70 218 76 208 C 88 214 112 214 124 208 C 130 218 146 218 152 208 C 164 212 174 198 168 186 C 176 150 172 92 146 66 Z",
    backInner: "M 70 120 C 64 160 72 190 80 204 L 120 204 C 128 190 136 160 130 120 Z",
    strands: "M 40 120 C 34 150 44 170 38 190 M 160 120 C 166 150 156 170 162 190 M 52 150 C 50 170 58 186 56 204 M 148 150 C 150 170 142 186 144 204",
    cap: "M 47 118 C 40 70 66 36 100 36 C 134 36 160 70 153 118 L 145 116 C 145 98 142 86 138 78" + fringe([[138, 78], [134, 95], [126, 74], [116, 91], [108, 72], [99, 93], [90, 72], [82, 90], [74, 74], [66, 94], [62, 80]]) + " C 58 88 55 100 55 116 Z",
    locks: [LOCK_L_LONG, mirrorD(LOCK_L_LONG)],
    shine: "M 68 60 Q 100 44 132 60",
  },
  straight_long: {
    back: "M 52 68 C 34 96 34 160 36 216 L 50 214 L 62 217 L 76 214 L 90 217 L 110 217 L 124 214 L 138 217 L 150 214 L 164 216 C 166 160 166 96 148 68 Z",
    backInner: "M 70 120 L 70 212 L 130 212 L 130 120 Z",
    strands: "M 44 110 L 44 210 M 156 110 L 156 210 M 56 140 L 56 212 M 144 140 L 144 212",
    cap: "M 47 120 C 40 70 66 36 100 36 C 134 36 160 70 153 120 L 146 118 C 146 100 143 88 140 80 L 140 90 Q 136 88 133 91 L 131 80 L 129 91 Q 124 88 120 91 L 118 79 L 116 91 Q 110 88 104 91 L 102 79 L 100 91 Q 94 88 88 91 L 86 79 L 84 91 Q 78 88 73 91 L 71 80 L 69 91 Q 64 88 60 90 L 60 80 C 57 88 55 100 55 118 Z",
    locks: [LOCK_L_STRAIGHT, mirrorD(LOCK_L_STRAIGHT)],
    shine: "M 68 60 Q 100 45 132 60",
  },
  beach_waves: {
    back: "M 52 66 C 30 90 30 130 26 160 C 22 172 34 178 40 170 C 44 182 58 184 62 172 C 76 180 124 180 138 172 C 142 184 156 182 160 170 C 166 178 178 172 174 160 C 170 130 170 90 148 66 Z",
    backInner: "M 70 120 C 66 150 72 168 78 174 L 122 174 C 128 168 134 150 130 120 Z",
    strands: "M 38 118 C 32 136 40 150 34 164 M 162 118 C 168 136 160 150 166 164",
    cap: "M 46 116 C 40 68 66 36 100 36 C 134 36 160 68 154 116 L 146 114 C 147 100 144 86 140 80 Q 146 92 142 100 Q 138 84 128 74 Q 134 86 128 94 Q 122 78 110 70 Q 112 80 106 88 Q 98 74 82 70 Q 86 78 80 86 Q 72 74 64 76 C 58 86 55 100 55 114 Z",
    locks: [LOCK_L_WAVE, mirrorD(LOCK_L_WAVE)],
    shine: "M 70 58 Q 100 44 130 58",
  },
  pixie: {
    back: "M 50 104 C 44 58 156 58 150 104 C 150 124 142 132 132 134 L 68 134 C 58 132 50 124 50 104 Z",
    cap: "M 50 110 C 42 64 66 36 100 36 C 134 36 158 64 150 110 Q 146 104 145 98 Q 144 106 140 110 C 142 98 140 88 136 80" + fringe([[136, 80], [131, 92], [124, 76], [114, 89], [106, 74], [97, 88], [88, 74], [79, 87], [72, 77], [64, 90], [63, 82]]) + " C 60 88 58 98 60 110 Q 56 106 55 98 Q 54 106 50 110 Z",
    shine: "M 68 60 Q 100 44 132 60",
    earsVisible: true,
  },
  space_buns: {
    back: "M 48 70 C 32 96 34 130 40 146 Q 52 150 64 144 L 136 144 Q 148 150 160 146 C 166 130 168 96 152 70 Z",
    cap: "M 47 118 C 40 70 66 36 100 36 C 134 36 160 70 153 118 L 146 116 C 146 100 143 88 139 80" + fringe([[139, 80], [134, 92], [126, 77], [118, 90], [110, 76], [101, 91], [92, 76], [84, 90], [76, 77], [67, 92], [61, 82]]) + " C 57 90 55 102 55 116 Z",
    locks: [LOCK_L_BOB, mirrorD(LOCK_L_BOB)],
    extra: (p, u) => (
      <g>
        {[62, 138].map((x) => (
          <g key={x}>
            <circle cx={x} cy={42} r={17} fill={`url(#${u}-hair)`} stroke={p.line} strokeWidth={1.8} />
            <path d={`M ${x - 10} ${40} Q ${x} ${28} ${x + 10} ${38} M ${x - 11} ${47} Q ${x} ${36} ${x + 12} ${46} M ${x - 6} ${53} Q ${x + 2} ${46} ${x + 10} ${52}`} stroke={p.shade} strokeWidth={1.2} fill="none" />
            <path d={`M ${x - 9} ${34} Q ${x - 3} ${28} ${x + 4} ${29}`} stroke={p.shine} strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.85} />
          </g>
        ))}
      </g>
    ),
    shine: "M 68 60 Q 100 44 132 60",
  },
  pigtails: {
    // Two bunches tied high at the sides, drawn behind the head.
    back: "M 56 78 C 32 84 22 116 26 146 C 28 164 38 176 46 172 C 41 162 47 152 45 138 C 43 118 50 100 62 90 Z" + " " + mirrorD("M 56 78 C 32 84 22 116 26 146 C 28 164 38 176 46 172 C 41 162 47 152 45 138 C 43 118 50 100 62 90 Z"),
    strands: "M 36 110 C 30 128 36 146 34 160 M 164 110 C 170 128 164 146 166 160",
    cap: "M 47 118 C 40 70 66 36 100 36 C 134 36 160 70 153 118 L 145 116 C 145 98 142 86 138 78" + fringe([[138, 78], [134, 95], [126, 74], [116, 91], [108, 72], [99, 93], [90, 72], [82, 90], [74, 74], [66, 94], [62, 80]]) + " C 58 88 55 100 55 116 Z",
    extra: () => (
      <g>
        {[56, 144].map((x) => (
          <g key={x}>
            <circle cx={x} cy={80} r={6} fill="#ff7fbf" stroke={OUTLINE} strokeWidth={1.4} />
            <circle cx={x - 1.8} cy={78} r={1.6} fill="#fff" opacity={0.85} />
          </g>
        ))}
      </g>
    ),
    shine: "M 68 60 Q 100 44 132 60",
  },
};

type Curl = [number, number, number];
const SHORT_STYLES = new Set<Shape>(["pixie"]);

function curlSet(style: Shape): { back: Curl[]; lock: Curl[]; bottom: number } | null {
  if (SHORT_STYLES.has(style) || style === "space_buns") return null;
  if (style === "beach_waves") {
    const half: Curl[] = [[50, 72, 16], [40, 90, 16], [35, 109, 17], [34, 128, 17], [37, 147, 16], [44, 164, 15], [58, 176, 13], [74, 181, 12], [90, 183, 11]];
    return { back: [...half, ...half.map(([x, y, r]) => [200 - x, y, r] as Curl)], lock: [[55, 96, 7], [51, 108, 7.5], [50, 121, 7.5], [52, 133, 7]], bottom: 184 };
  }
  const half: Curl[] = [[50, 70, 19], [38, 90, 19], [32, 112, 20], [29, 135, 20], [30, 158, 20], [34, 180, 19], [41, 199, 18], [56, 212, 16], [74, 218, 15], [92, 220, 14]];
  return { back: [...half, ...half.map(([x, y, r]) => [200 - x, y, r] as Curl)], lock: [[55, 96, 7], [51, 108, 7.5], [49, 121, 8], [49, 134, 8], [50, 147, 7.5], [53, 159, 6.5]], bottom: 220 };
}

function Curls({ curls, p, u, fillCenter }: { curls: Curl[]; p: HairPalette; u: string; fillCenter?: number }) {
  return (
    <g>
      {curls.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r + 1.8} fill={p.line} />
      ))}
      {fillCenter && <path d={`M 52 70 L 148 70 L 150 ${fillCenter - 8} L 50 ${fillCenter - 8} Z`} fill={p.deep} />}
      {curls.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={`url(#${u}-curl)`} />
          <path d={`M ${f(x - r * 0.45)} ${f(y + r * 0.1)} Q ${f(x - r * 0.2)} ${f(y - r * 0.55)} ${f(x + r * 0.35)} ${f(y - r * 0.3)} Q ${f(x + r * 0.55)} ${f(y + r * 0.25)} ${f(x + r * 0.05)} ${f(y + r * 0.4)} Q ${f(x - r * 0.25)} ${f(y + r * 0.3)} ${f(x - r * 0.1)} ${f(y + r * 0.05)}`} stroke={luminance(p.base) < 0.06 ? p.light : p.shade} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d={`M ${f(x - r * 0.6)} ${f(y - r * 0.35)} Q ${f(x - r * 0.3)} ${f(y - r * 0.75)} ${f(x + r * 0.15)} ${f(y - r * 0.72)}`} stroke={p.shine} strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.9} />
        </g>
      ))}
    </g>
  );
}

export function HairBack({ style, p, u, curly }: { style: Shape; p: HairPalette; u: string; curly?: boolean }) {
  const h = HAIR[style] ?? HAIR.long_waves;
  const cs = curly ? curlSet(style) : null;
  if (cs) return <Curls curls={cs.back} p={p} u={u} fillCenter={cs.bottom} />;
  if (!h.back) return null;
  return (
    <g>
      <path d={h.back} fill={`url(#${u}-hairb)`} stroke={p.line} strokeWidth={1.8} strokeLinejoin="round" />
      {h.backInner && <path d={h.backInner} fill={p.deep} opacity={0.55} />}
      {h.strands && <path d={h.strands} stroke={p.shade} strokeWidth={1.3} fill="none" strokeLinecap="round" opacity={0.8} />}
      {h.strands && <path d={h.strands} stroke={p.shine} strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.5} transform="translate(3 -4)" />}
    </g>
  );
}

export function HairFront({ style, p, u, sp, curly }: { style: Shape; p: HairPalette; u: string; sp: SkinPalette; curly?: boolean }) {
  const h = HAIR[style] ?? HAIR.long_waves;
  const cs = curly ? curlSet(style) : null;
  return (
    <g>
      {/* soft hair shadow on the forehead */}
      <path d={h.cap} transform="translate(0 3.5)" fill={sp.shade} opacity={0.5} clipPath={`url(#${u}-face)`} />
      {style === "space_buns" && h.extra?.(p, u)}
      <path d={h.cap} fill={`url(#${u}-hair)`} stroke={p.line} strokeWidth={1.8} strokeLinejoin="round" />
      {cs ? (
        <Curls curls={[...cs.lock, ...cs.lock.map(([x, y, r]) => [200 - x, y, r] as Curl)]} p={p} u={u} />
      ) : (
        h.locks?.map((d, i) => <path key={i} d={d} fill={`url(#${u}-hair)`} stroke={p.line} strokeWidth={1.6} strokeLinejoin="round" />)
      )}
      {style !== "space_buns" && h.extra?.(p, u)}
      <path d={h.shine} stroke={p.shine} strokeWidth={4} strokeLinecap="round" fill="none" strokeDasharray="13 5 8 6 18 5" opacity={0.9} />
      <path d={h.shine} stroke="#fff" strokeWidth={1.4} strokeLinecap="round" fill="none" strokeDasharray="4 30 3 40" opacity={0.85} transform="translate(0 -1)" />
    </g>
  );
}


export type EyeKind = "open" | "sparkle" | "star" | "half" | "closedDown" | "closedUp" | "teary";

export function Eye({ cx, cy, side, kind, u, iris, soft, sp }: { cx: number; cy: number; side: 1 | -1; kind: EyeKind; u: string; iris: string; soft: boolean; sp: SkinPalette }) {
  const lidW = soft ? 2.6 : 3.2;
  if (kind === "closedDown" || kind === "closedUp") {
    const d = kind === "closedDown" ? "M -11 1 Q 0 9 12 1" : "M -11 5 Q 0 -6 12 4";
    const lash = kind === "closedDown" ? "M 11 2 Q 14.5 4 17 3" : "M 11.5 4 Q 15 3 17.5 0";
    return (
      <g transform={`translate(${cx} ${cy}) scale(${side} 1)`}>
        <path d={d} stroke={INK} strokeWidth={lidW} fill="none" strokeLinecap="round" />
        {!soft && <path d={lash} stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
      </g>
    );
  }
  const pupil = kind === "star" ? (
    <path d={starD(0, 2.5, 6.2, 2.6)} fill={darken(iris, 0.7)} />
  ) : (
    <ellipse cx={0} cy={3} rx={kind === "teary" ? 5 : 4.4} ry={kind === "teary" ? 6.4 : 5.8} fill={darken(iris, 0.68)} />
  );
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) scale(${side} 1)`}>
        <path d={EYE_D} fill="#fff" />
        <g clipPath={`url(#${u}-eye)`}>
          <path d="M -14 -16 L 14 -16 L 14 -8 Q 0 -4 -14 -8 Z" fill="#e7dcf5" />
          <ellipse cx={0} cy={2} rx={9.4} ry={11.8} fill={`url(#${u}-iris)`} />
          <ellipse cx={0} cy={2} rx={9.4} ry={11.8} fill="none" stroke={darken(iris, 0.55)} strokeWidth={1} />
          {pupil}
          <path d="M -6.5 8 Q 0 13.5 6.5 8 Q 0 10.8 -6.5 8 Z" fill={lighten(iris, 0.65)} opacity={0.9} />
          {kind === "half" && (
            <>
              <rect x={-15} y={-17} width={30} height={15.5} fill={sp.base} />
            </>
          )}
          {kind === "teary" && <path d="M -10 9 Q 0 15 10 9 L 10 16 L -10 16 Z" fill="#bfefff" opacity={0.7} />}
        </g>
        {kind === "half" ? (
          <path d="M -13 -1.6 Q 0 -3 13.6 -2.4" stroke={INK} strokeWidth={lidW} fill="none" strokeLinecap="round" />
        ) : (
          <path d="M -13.2 -2 Q -12 -16.5 0 -16 Q 10.5 -16 13.8 -5.5" stroke={INK} strokeWidth={lidW} fill="none" strokeLinecap="round" />
        )}
        {!soft && kind !== "half" && <path d="M 12 -7 Q 15.5 -9 17.5 -13 M 13.2 -3.6 Q 17 -3.8 19 -7" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
        {soft && kind !== "half" && <path d="M 12.4 -6 Q 15 -7 16 -9.5" stroke={INK} strokeWidth={1.4} fill="none" strokeLinecap="round" />}
        <path d="M 3 13.2 Q 7.5 12 10.2 8.5" stroke={INK} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.55} />
      </g>
      {kind === "sparkle" ? (
        <>
          <path d={SPARKLE_D} transform={`translate(${cx - 3.6} ${cy - 3.5}) scale(0.95)`} fill="#fff" />
          <path d={SPARKLE_D} transform={`translate(${cx + 4} ${cy + 6}) scale(0.45)`} fill="#fff" />
        </>
      ) : kind === "half" ? (
        <circle cx={cx - 3} cy={cy + 2} r={2} fill="#fff" />
      ) : (
        <>
          <ellipse cx={cx - 3.8} cy={cy - 3.6} rx={kind === "teary" ? 4.4 : 3.8} ry={kind === "teary" ? 4.8 : 4.2} fill="#fff" />
          <circle cx={cx + 4} cy={cy + 6} r={kind === "teary" ? 2.2 : 1.7} fill="#fff" />
          <circle cx={cx + 5} cy={cy - 5} r={0.9} fill="#fff" opacity={0.9} />
        </>
      )}
    </g>
  );
}

export function Brows({ mood, p, andro, sleepy }: { mood: Mood; p: HairPalette; andro: boolean; sleepy: boolean }) {
  const col = mix(p.deep, INK, 0.35);
  let d = andro ? "M -9 0 Q 0 -2.4 9 -0.6" : "M -8.5 1 Q 0 -3 9 0";
  if (mood === "hungry") d = "M -8.5 -2.8 Q 0 -2.4 9 1.8";
  if (mood === "offended") d = "M -8.5 -1 Q 0 -6.5 9 -3";
  if (mood === "bored" || sleepy) d = "M -8.5 1.5 Q 0 0.5 9 1.5";
  if (mood === "thriving" || mood === "magical") d = andro ? "M -9 -1 Q 0 -3.6 9 -1.2" : "M -8.5 0 Q 0 -4.4 9 -1";
  return (
    <g stroke={col} strokeWidth={andro ? 2.6 : 1.9} fill="none" strokeLinecap="round" opacity={0.92}>
      <path d={d} transform="translate(121 85)" />
      <path d={d} transform="translate(79 85) scale(-1 1)" />
    </g>
  );
}

export function Mouth({ mood, sp }: { mood: Mood; sp: SkinPalette }) {
  const lip = "#b8406f";
  switch (mood) {
    case "thriving":
      return (
        <g>
          <path d="M 90.5 123.5 Q 100 125.5 109.5 123.5 Q 108.5 136.5 100 137.5 Q 91.5 136.5 90.5 123.5 Z" fill="#a8305e" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M 94 133.2 Q 100 129.5 106 133.2 Q 100 137.6 94 133.2 Z" fill="#ff8fb1" />
          <path d="M 92 124.6 Q 100 126.4 108 124.6 L 107.6 126.4 Q 100 128 92.4 126.4 Z" fill="#fff" />
        </g>
      );
    case "happy":
      return (
        <g>
          <path d="M 93.5 125 Q 100 126.5 106.5 125 Q 105 132 100 132.4 Q 95 132 93.5 125 Z" fill="#b8406f" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
          <path d="M 96.5 130.4 Q 100 128.6 103.5 130.4 Q 100 132.2 96.5 130.4 Z" fill="#ff8fb1" />
        </g>
      );
    case "sleepy":
      return <ellipse cx={100} cy={129} rx={2.4} ry={2.8} fill={lip} stroke={INK} strokeWidth={1.1} />;
    case "hungry":
      return (
        <g>
          <path d="M 91.5 125 q 2.8 -2 5.6 0 q 2.8 2 5.6 0 q 2.8 -2 5.6 0 L 108.3 127 Q 100 138 91.5 127 Z" fill="#a8305e" stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
          <path d="M 95 132 Q 100 129.5 105 132 Q 100 135 95 132 Z" fill="#ff8fb1" />
          <path d="M 107.6 128.5 Q 106.4 132.5 107.8 134 Q 109.6 132.4 107.6 128.5 Z" fill="#c9f2ff" stroke="#7fc6e0" strokeWidth={0.7} />
        </g>
      );
    case "bored":
      return <path d="M 94.5 128.8 Q 100 127.6 106 128.4" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />;
    case "magical":
      return <path d="M 92.5 126 Q 96.3 130.5 100 126.6 Q 103.7 130.5 107.5 126" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case "offended":
      return (
        <g>
          <path d="M 96 130.5 Q 100 126 104 130.2 Q 100 131.6 96 130.5 Z" fill={lip} stroke={INK} strokeWidth={1.3} strokeLinejoin="round" />
          <path d="M 98 128.6 Q 99.6 128 101 128.5" stroke="#ff9fbf" strokeWidth={0.8} />
        </g>
      );
    default:
      return <path d="M 95 127 Q 100 131 105 127" stroke={INK} strokeWidth={1.5} fill="none" strokeLinecap="round" />;
  }
  void sp;
}

/* ------------------------------------------------------------------ */
/* Mood effects                                                        */
/* ------------------------------------------------------------------ */


export function MoodFx({ mood, b }: { mood: Mood; b: Build }) {
  switch (mood) {
    case "thriving":
      return (
        <g>
          {[[156, 62, 1.3, 0], [168, 86, 0.9, 0.8], [40, 70, 1.1, 1.5]].map(([x, y, s, dl], i) => (
            <g key={i} className="pcw-float" style={{ animationDelay: `${dl}s` }}>
              <path d={HEART_D} transform={`translate(${x} ${y}) scale(${s})`} fill="#ff6fa8" stroke={OUTLINE} strokeWidth={0.8} />
              <circle cx={x - 1.6 * s} cy={y - 2.4 * s} r={0.9 * s} fill="#fff" opacity={0.85} />
            </g>
          ))}
          <path d={SPARKLE_D} transform="translate(30 104) scale(0.7)" fill="#f4d68e" className="pcw-twinkle" />
          <path d={SPARKLE_D} transform="translate(170 116) scale(0.55)" fill="#fff" stroke="#f4d68e" strokeWidth={0.6} />
        </g>
      );
    case "sleepy":
      return (
        <g className="pcw-z" fill="none" stroke="#8f6bf0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M 156 84 h 8 l -8 9 h 8" />
          <path d="M 168 64 h 11 l -11 12 h 11" strokeWidth={2.4} />
          <path d="M 182 46 h 6 l -6 7 h 6" strokeWidth={1.6} />
        </g>
      );
    case "hungry":
      return (
        <g stroke="#e8734f" strokeWidth={1.5} fill="none" strokeLinecap="round" className="pcw-twinkle">
          <path d={`M ${100 + b.wa + 14} ${b.waistY - 12} q 3 3 0 6 M ${100 + b.wa + 18} ${b.waistY - 14} q 4 5 0 10`} />
          <path d={`M ${100 - b.wa - 14} ${b.waistY - 12} q -3 3 0 6 M ${100 - b.wa - 18} ${b.waistY - 14} q -4 5 0 10`} />
        </g>
      );
    case "bored":
      return (
        <g className="pcw-puff">
          <g fill="#f3eefc" stroke="#b8a9d9" strokeWidth={1}>
            <circle cx={118} cy={134} r={3.4} />
            <circle cx={124} cy={131} r={4.4} />
            <circle cx={131} cy={133} r={3.6} />
          </g>
        </g>
      );
    case "magical":
      return (
        <g className="pcw-orbit" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" } as CSSProperties}>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            const x = 100 + Math.cos(a) * 70;
            const y = 98 + Math.sin(a) * 58;
            return i % 2 === 0 ? (
              <path key={i} d={SPARKLE_D} transform={`translate(${f(x)} ${f(y)}) scale(0.9)`} fill="#f4d68e" stroke="#fff" strokeWidth={0.6} />
            ) : (
              <path key={i} d={starD(x, y, 3.6, 1.6)} fill="#c9b0ff" stroke="#fff" strokeWidth={0.5} />
            );
          })}
        </g>
      );
    case "offended":
      return (
        <g transform="translate(140 64)" stroke="#ef4f74" strokeWidth={2.2} fill="none" strokeLinecap="round">
          <path d="M -6 -2 Q -2 -2 -2 -6 M 2 -6 Q 2 -2 6 -2 M 6 2 Q 2 2 2 6 M -2 6 Q -2 2 -6 2" />
        </g>
      );
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/* Offended shell                                                      */
/* ------------------------------------------------------------------ */

export function ShellBack({ u }: { u: string }) {
  const cx = 100, cy = 236, r = 98, n = 9;
  const pts: Pt[] = Array.from({ length: n + 1 }, (_, i) => {
    const a = Math.PI + (i / n) * Math.PI;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const a = Math.PI + ((i - 0.5) / n) * Math.PI;
    d += ` Q ${f(cx + (r + 10) * Math.cos(a))} ${f(cy + (r + 10) * Math.sin(a))} ${f(pts[i][0])} ${f(pts[i][1])}`;
  }
  d += " Z";
  return (
    <g>
      <defs>
        <radialGradient id={`${u}-shb`} cx="0.5" cy="1" r="1">
          <stop offset="0" stopColor="#ffe9f3" />
          <stop offset="0.6" stopColor="#ffb3d5" />
          <stop offset="1" stopColor="#f58cbc" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#${u}-shb)`} {...ol} />
      {pts.slice(1, -1).map(([x, y], i) => (
        <path key={i} d={`M ${cx} ${cy} L ${f(x)} ${f(y)}`} stroke="#e37fb0" strokeWidth={1.4} opacity={0.7} />
      ))}
      <path d={`M 30 200 Q 60 150 100 146`} stroke="#fff" strokeWidth={3} fill="none" opacity={0.5} strokeLinecap="round" />
    </g>
  );
}

export function ShellFront({ u }: { u: string }) {
  const top = 208;
  return (
    <g>
      <defs>
        <Grad id={`${u}-shf`} stops={[[0, "#ffd3e7"], [0.5, "#ffa6cf"], [1, "#ef7db2"]]} />
      </defs>
      <path d={`M 16 ${top + 4}${scallops(16, 184, top + 4, 10, -7)} L 178 246 Q 100 266 22 246 Z`} fill={`url(#${u}-shf)`} {...ol} />
      {Array.from({ length: 9 }, (_, i) => 16 + ((i + 1) * 168) / 10).map((x, i) => (
        <path key={i} d={`M ${f(x)} ${top + 4} Q ${f(100 + (x - 100) * 0.8)} 236 ${f(100 + (x - 100) * 0.72)} 254`} stroke="#e47aae" strokeWidth={1.3} fill="none" opacity={0.75} />
      ))}
      <path d={`M 30 ${top + 6} Q 100 ${top - 4} 170 ${top + 6}`} stroke="#fff" strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
      <circle cx={28} cy={top + 10} r={3.4} fill="#fffaf6" {...thin} />
      <circle cx={172} cy={top + 10} r={3.4} fill="#fffaf6" {...thin} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

export const CSS = `
@media (prefers-reduced-motion: no-preference) {
  .pcw-anim .pcw-bob { animation: pcwBob 3.4s ease-in-out infinite; }
  .pcw-anim .pcw-blink { animation: pcwBlink 5.2s infinite; transform-box: fill-box; transform-origin: 50% 50%; }
  .pcw-anim .pcw-sway { animation: pcwSway 4.2s ease-in-out infinite; }
  .pcw-anim .pcw-fin { animation: pcwFin 2.8s ease-in-out infinite; }
  .pcw-anim .pcw-pet { animation: pcwPet 2.9s ease-in-out infinite; }
  .pcw-anim .pcw-wing { animation: pcwWing 1.6s ease-in-out infinite; transform-box: fill-box; transform-origin: 0% 60%; }
  .pcw-anim .pcw-float-soft { animation: pcwBob 2.6s ease-in-out infinite; }
  .pcw-anim .pcw-float { animation: pcwFloat 3.2s ease-in-out infinite; }
  .pcw-anim .pcw-orbit { animation: pcwOrbit 14s linear infinite; }
  .pcw-anim .pcw-dance { animation: pcwDance 0.9s ease-in-out infinite; }
  .pcw-anim .pcw-shimmer { animation: pcwShimmer 3.8s ease-in-out infinite; }
  .pcw-anim .pcw-z { animation: pcwZ 3s ease-in-out infinite; }
  .pcw-anim .pcw-puff { animation: pcwPuff 3.6s ease-out infinite; }
  .pcw-anim .pcw-twinkle { animation: pcwTwinkle 1.8s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 50%; }
}
@keyframes pcwBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes pcwBlink { 0%,90%,100% { transform: scaleY(1); } 93% { transform: scaleY(0.08); } 96% { transform: scaleY(1); } }
@keyframes pcwSway { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2.5deg); } }
@keyframes pcwFin { 0%,100% { transform: rotate(-7deg); } 50% { transform: rotate(8deg); } }
@keyframes pcwWing { 0%,100% { transform: rotate(0deg) scaleX(1); } 50% { transform: rotate(-6deg) scaleX(0.9); } }
@keyframes pcwPet { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-6px) rotate(3deg); } }
@keyframes pcwFloat { 0% { transform: translateY(4px); opacity: 0; } 25% { opacity: 1; } 100% { transform: translateY(-12px); opacity: 0; } }
@keyframes pcwOrbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pcwDance { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg) translateY(-3px); } }
@keyframes pcwShimmer { 0% { transform: translateX(-30px); } 60%,100% { transform: translateX(60px); } }
@keyframes pcwZ { 0%,100% { transform: translate(0,0); opacity: 0.6; } 50% { transform: translate(3px,-5px); opacity: 1; } }
@keyframes pcwPuff { 0% { transform: translate(0,0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(10px,-6px); opacity: 0; } }
@keyframes pcwTwinkle { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.6); opacity: 0.6; } }
`;

