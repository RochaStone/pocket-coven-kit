"use client";
// A witch's own room: wallpaper and floor she chooses, a window, painted from the world palette.
import type { ReactNode } from "react";
import type { ThemePalette } from "@/lib/game/types";
import { useArt } from "./ArtContext";
import type { Floor, Wallpaper } from "@/lib/game/types";
import { darken, lighten, starPath } from "./colour";

// The placement grid sits on the floor, in % of the room box.
export const ROOM_FLOOR_BOX = { x: 12, y: 54, w: 76, h: 38 };

export const WALL_LABEL: Record<Wallpaper, string> = { plain: "Plain plaster", stripe: "Ticking stripe", check: "Gingham", stars: "Starry", vines: "Climbing vines" };
export const FLOOR_LABEL: Record<Floor, string> = { boards: "Boards", flagstone: "Flagstone", rug: "Rag rug", moss: "Moss" };

function WallPattern({ kind, c, p }: { kind: Wallpaper; c: string; p: ThemePalette }) {
  const d = darken(c, 0.12);
  switch (kind) {
    case "stripe":
      return <g>{Array.from({ length: 20 }, (_, i) => <rect key={i} x={i * 20} y={0} width={8} height={170} fill={d} opacity={0.6} />)}</g>;
    case "check":
      return <g>{Array.from({ length: 20 }, (_, i) => <rect key={`v${i}`} x={i * 20} y={0} width={10} height={170} fill={d} opacity={0.35} />)}{Array.from({ length: 9 }, (_, i) => <rect key={`h${i}`} x={0} y={i * 20} width={400} height={10} fill={d} opacity={0.35} />)}</g>;
    case "stars":
      return <g>{Array.from({ length: 30 }, (_, i) => <path key={i} d={starPath((i * 53) % 400, ((i * 37) % 160) + 6, 4)} fill={d} />)}</g>;
    case "vines":
      return <g stroke={p.leafDeep} strokeWidth={2} fill="none" opacity={0.6}>{[30, 130, 230, 330].map((x) => <path key={x} d={`M${x} 170 C${x - 20} 130 ${x + 20} 90 ${x} 50 C${x - 20} 20 ${x + 10} 0 ${x} -10`} />)}{[30, 130, 230, 330].flatMap((x) => [60, 100, 140].map((y) => <ellipse key={`${x}${y}`} cx={x + 8} cy={y} rx={6} ry={3} fill={p.leaf} stroke="none" />))}</g>;
    default:
      return null;
  }
}

function FloorPattern({ kind, p }: { kind: Floor; p: ThemePalette }) {
  switch (kind) {
    case "flagstone":
      return <g><rect y={150} width={400} height={150} fill={p.stone} />{Array.from({ length: 14 }, (_, i) => <rect key={i} x={(i % 5) * 84 - (Math.floor(i / 5) % 2) * 40} y={156 + Math.floor(i / 5) * 46} width={78} height={40} rx={6} fill={lighten(p.stone, 0.12)} />)}</g>;
    case "rug":
      return <g><rect y={150} width={400} height={150} fill={p.floor} /><ellipse cx={200} cy={232} rx={170} ry={56} fill={p.accent} /><ellipse cx={200} cy={232} rx={140} ry={42} fill="none" stroke={lighten(p.accent, 0.4)} strokeWidth={6} strokeDasharray="10 8" /></g>;
    case "moss":
      return <g><rect y={150} width={400} height={150} fill={p.leaf} />{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 47) % 400} cy={160 + ((i * 29) % 130)} r={6 + (i % 4)} fill={darken(p.leaf, 0.1)} />)}</g>;
    default:
      return <g><rect y={150} width={400} height={150} fill={p.floor} />{Array.from({ length: 9 }, (_, i) => <path key={i} d={`M0 ${158 + i * 16} H400`} stroke={darken(p.floor, 0.18)} strokeWidth={1.4} />)}</g>;
  }
}

export function RoomBackdrop({ wallpaper, floor, children }: { wallpaper: Wallpaper; floor: Floor; children?: ReactNode }) {
  const p = useArt().palette;
  return (
    <div className="absolute inset-0">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width={400} height={170} fill={p.wall} />
        <WallPattern kind={wallpaper} c={p.wall} p={p} />
        <path d="M150 140 V60 A50 50 0 0 1 250 60 V140 Z" fill={p.skyDeep} stroke={p.wood} strokeWidth={6} />
        <circle cx={222} cy={64} r={10} fill={lighten(p.glow, 0.4)} />
        <path d="M200 10 V140 M150 90 H250" stroke={p.wood} strokeWidth={4} />
        <FloorPattern kind={floor} p={p} />
        <rect y={146} width={400} height={8} fill={darken(p.wallDeep, 0.2)} />
      </svg>
      {children}
    </div>
  );
}
