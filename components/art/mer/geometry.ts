// Geometry for the mer-witch figure, ported unchanged from the original pocket coven art.
// Avatar space is 200 x 260; the head is centred near (100, 98) and scaled by the build's headScale around (100, 140).
import { OUTLINE } from "./color";

export interface Build {
  sh: number; // shoulder half width
  wa: number; // waist half width
  hip: number; // hip half width
  sY: number; // shoulder line
  waistY: number;
  hipY: number;
  footY: number;
  legX: number; // leg offset from centre
  armW: number;
  corner: number; // shoulder rounding: big = soft/round, small = square
  baby: boolean;
  headScale: number;
}

// The mer-witch's own build: small, round-shouldered, a touch more head.
export const MER_BUILD: Build = { sh: 18, wa: 15, hip: 19, sY: 143, waistY: 176, hipY: 186, footY: 238, legX: 7, armW: 8.5, corner: 10, baby: true, headScale: 1.07 };

export type Pt = [number, number];
export const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const f = (n: number) => Math.round(n * 100) / 100;

export function armPts(b: Build) {
  const S: Pt = [100 + b.sh - 3, b.sY + 5];
  const E: Pt = [100 + b.sh + 5, b.sY + 21];
  const H: Pt = [100 + b.sh + 6.5, b.sY + 36];
  return { S, E, H };
}

export function torsoD(b: Build) {
  const L = 100 - b.sh, R = 100 + b.sh, c = b.corner, y = b.sY;
  return `M ${L} ${y + c} Q ${L} ${y} ${L + c} ${y} L ${R - c} ${y} Q ${R} ${y} ${R} ${y + c} L ${100 + b.wa} ${b.waistY} L ${100 - b.wa} ${b.waistY} Z`;
}

export function scallops(x1: number, x2: number, y: number, n: number, depth: number) {
  let s = "";
  const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) {
    const xa = x1 + w * i;
    s += ` Q ${f(xa + w / 2)} ${f(y + depth)} ${f(xa + w)} ${y}`;
  }
  return s;
}

export function skirtD(sy: number, sw: number, hy: number, hw: number, n = 6, depth = 4) {
  return `M ${100 - sw} ${sy} L ${100 + sw} ${sy} Q ${100 + hw - 1} ${(sy + hy) / 2} ${100 + hw} ${hy}${scallops(100 + hw, 100 - hw, hy, n, depth)} Q ${100 - hw + 1} ${(sy + hy) / 2} ${100 - sw} ${sy} Z`;
}

export function starD(cx: number, cy: number, r1: number, r2: number, n = 5, rot = -90) {
  let d = "";
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? r1 : r2;
    const a = ((rot + (i * 180) / n) * Math.PI) / 180;
    d += `${i === 0 ? "M" : "L"} ${f(cx + r * Math.cos(a))} ${f(cy + r * Math.sin(a))} `;
  }
  return d + "Z";
}

/** Builds a fringe edge from alternating dip / tip points (right to left). */
export function fringe(pts: Pt[]) {
  let s = "";
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [x, y] = pts[i];
    if (i % 2 === 1) s += ` Q ${f(px - 1)} ${f((py + y) / 2 + 5)} ${x} ${y}`; // dip -> tip
    else s += ` Q ${f(px - 2)} ${f((py + y) / 2 - 1)} ${x} ${y}`; // tip -> dip
  }
  return s;
}

export const mirrorD = (d: string) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_m, x: string, y: string) => `${f(200 - parseFloat(x))} ${y}`);

export const SPARKLE_D = "M0 -6 Q 1 -1 6 0 Q 1 1 0 6 Q -1 1 -6 0 Q -1 -1 0 -6 Z";
export const HEART_D = "M0 3.4 C -4.2 0 -6.4 -3.2 -3.6 -5.6 C -2 -6.8 -0.4 -6.1 0 -4.6 C 0.4 -6.1 2 -6.8 3.6 -5.6 C 6.4 -3.2 4.2 0 0 3.4 Z";
export const FACE_D = "M 56 98 C 56 68 76 54 100 54 C 124 54 144 68 144 98 C 144 124 126 141 100 141 C 74 141 56 124 56 98 Z";
export const EYE_D = "M -12.5 -3 Q -11.5 -15 0 -15 Q 10 -15 12.8 -5 Q 13.5 6 6.5 12 Q 0 15.5 -6 12.2 Q -13 7 -12.5 -3 Z";
export const mirror = "translate(200 0) scale(-1 1)";

export const ol = { stroke: OUTLINE, strokeWidth: 1.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
export const thin = { stroke: OUTLINE, strokeWidth: 1.2, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
