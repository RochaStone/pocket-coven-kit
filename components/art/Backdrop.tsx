"use client";
// Room scenes: 18 backdrop kinds, each built from shared primitives and painted from the world palette.
// A founder picks a backdrop per room in coven.config.json; the preset palette (or her own) colours it.
import type { ReactNode } from "react";
import { useArt } from "./ArtContext";
import type { BackdropKind, ThemePalette } from "@/lib/game/types";
import { darken, INK, lighten, luminance, mix, rng, starPath } from "./colour";

type P = ThemePalette;
const night = (p: P) => luminance(p.sky) < 0.18;

function Sky({ p, h = 300, seed = 3 }: { p: P; h?: number; seed?: number }) {
  const r = rng(seed);
  const stars = night(p) ? Array.from({ length: 26 }, () => [r() * 400, r() * h * 0.7, 0.8 + r() * 1.6]) : [];
  return (
    <g>
      <rect width={400} height={h} fill={p.skyDeep} />
      <rect width={400} height={h * 0.7} fill={p.sky} opacity={0.6} />
      {stars.map(([x, y, s], i) => <path key={i} d={starPath(x, y, s * 1.6, 0.35, 4)} fill={lighten(p.glow, 0.3)} opacity={0.85} />)}
    </g>
  );
}

function Moon({ x, y, r = 18, p }: { x: number; y: number; r?: number; p: P }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={lighten(p.glow, 0.5)} />
      <circle cx={x + r * 0.45} cy={y - r * 0.2} r={r * 0.85} fill={p.sky} opacity={night(p) ? 1 : 0} />
    </g>
  );
}

function Wall({ p, h = 200 }: { p: P; h?: number }) {
  return (
    <g>
      <rect width={400} height={h} fill={p.wall} />
      <rect y={h - 28} width={400} height={28} fill={p.wallDeep} />
      <path d={`M0 ${h - 28} H400`} stroke={darken(p.wallDeep, 0.25)} strokeWidth={2} />
    </g>
  );
}

function Boards({ p, y = 200 }: { p: P; y?: number }) {
  return (
    <g>
      <rect y={y} width={400} height={300 - y} fill={p.floor} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M0 ${y + 8 + i * 16} H400`} stroke={darken(p.floor, 0.18)} strokeWidth={1.4} />)}
    </g>
  );
}

function Ground({ p, y = 210, c }: { p: P; y?: number; c?: string }) {
  const g = c ?? p.leaf;
  return (
    <g>
      <path d={`M0 ${y} Q100 ${y - 14} 200 ${y} T400 ${y} V300 H0 Z`} fill={g} />
      <path d={`M0 ${y + 30} Q120 ${y + 18} 240 ${y + 32} T400 ${y + 26} V300 H0 Z`} fill={darken(g, 0.12)} />
    </g>
  );
}

function Window({ x, y, w = 80, h = 100, p }: { x: number; y: number; w?: number; h?: number; p: P }) {
  const frame = p.wood;
  return (
    <g>
      <path d={`M${x} ${y + h} V${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V${y + h} Z`} fill={p.skyDeep} stroke={frame} strokeWidth={6} />
      <path d={`M${x + 4} ${y + h * 0.75} V${y + w / 2} A${w / 2 - 4} ${w / 2 - 4} 0 0 1 ${x + w - 4} ${y + w / 2} V${y + h * 0.75} Z`} fill={p.sky} opacity={0.6} />
      {night(p) ? <Moon x={x + w * 0.65} y={y + w * 0.45} r={9} p={p} /> : <circle cx={x + w * 0.65} cy={y + w * 0.45} r={9} fill={lighten(p.glow, 0.4)} />}
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h * 0.55} H${x + w}`} stroke={frame} strokeWidth={4} />
      <rect x={x - 8} y={y + h} width={w + 16} height={8} rx={2} fill={frame} />
    </g>
  );
}

function Candle({ x, y, p, h = 26 }: { x: number; y: number; p: P; h?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y - h - 7} rx={10} ry={12} fill={p.glow} opacity={0.25} />
      <path d={`M${x} ${y - h - 13} q -5 7 0 11 q 5 -4 0 -11`} fill={p.glow} />
      <rect x={x - 5} y={y - h} width={10} height={h} fill="#f3ead2" stroke={darken("#f3ead2", 0.4)} strokeWidth={1.2} />
    </g>
  );
}

function Shelf({ x, y, w = 120, p }: { x: number; y: number; w?: number; p: P }) {
  const cols = [p.accent, p.alt, p.mystic, p.glow, p.leaf];
  return (
    <g>
      <rect x={x} y={y} width={w} height={6} fill={p.wood} />
      {Array.from({ length: Math.floor(w / 22) }, (_, i) => {
        const jx = x + 6 + i * 22;
        const jh = 14 + ((i * 7) % 10);
        return (
          <g key={i}>
            <rect x={jx} y={y - jh} width={14} height={jh} rx={3} fill={cols[i % cols.length]} opacity={0.85} stroke={INK} strokeWidth={0.8} />
            <rect x={jx - 1} y={y - jh - 4} width={16} height={4} fill="#c9a77a" />
          </g>
        );
      })}
    </g>
  );
}

function Tree({ x, y, s = 1, p, round = true }: { x: number; y: number; s?: number; p: P; round?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-7} y={-40} width={14} height={44} fill={p.wood} />
      {round ? (
        <g>
          <circle cx={-18} cy={-56} r={26} fill={p.leafDeep} />
          <circle cx={18} cy={-58} r={26} fill={p.leafDeep} />
          <circle cx={0} cy={-80} r={30} fill={p.leaf} />
        </g>
      ) : (
        <path d="M0 -120 L34 -30 L-34 -30 Z M0 -90 L40 -10 L-40 -10 Z" fill={p.leafDeep} />
      )}
    </g>
  );
}

function Mushroom({ x, y, s = 1, c }: { x: number; y: number; s?: number; c: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-6 0 L-5 -18 L5 -18 L6 0 Z" fill="#f6efe0" stroke={darken("#f6efe0", 0.4)} strokeWidth={1} />
      <path d="M-20 -16 C-20 -38 20 -38 20 -16 Z" fill={c} stroke={darken(c, 0.4)} strokeWidth={1.2} />
      <circle cx={-8} cy={-26} r={3} fill="#fff" />
      <circle cx={6} cy={-30} r={2.4} fill="#fff" />
      <circle cx={11} cy={-21} r={2} fill="#fff" />
    </g>
  );
}

function Tufts({ p, y = 230, seed = 7, n = 14 }: { p: P; y?: number; seed?: number; n?: number }) {
  const r = rng(seed);
  return (
    <g stroke={darken(p.leaf, 0.3)} strokeWidth={2} strokeLinecap="round" fill="none">
      {Array.from({ length: n }, (_, i) => {
        const x = r() * 400;
        const yy = y + r() * 60;
        return <path key={i} d={`M${x} ${yy} l-4 -9 M${x} ${yy} l0 -11 M${x} ${yy} l4 -9`} />;
      })}
    </g>
  );
}

function Water({ p, y = 200, h = 100 }: { p: P; y?: number; h?: number }) {
  return (
    <g>
      <rect y={y} width={400} height={h} fill={p.water} />
      {Array.from({ length: 5 }, (_, i) => (
        <path key={i} d={`M${-20 + (i % 2) * 30} ${y + 14 + i * 18} q 20 -6 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} stroke={lighten(p.water, 0.3)} strokeWidth={2} fill="none" opacity={0.7} />
      ))}
    </g>
  );
}

function Rocks({ p, y = 250 }: { p: P; y?: number }) {
  return (
    <g fill={p.stone} stroke={darken(p.stone, 0.35)} strokeWidth={1.6}>
      <path d={`M0 ${y} Q30 ${y - 30} 70 ${y - 10} Q90 ${y + 10} 80 300 L0 300 Z`} />
      <path d={`M300 ${y + 10} Q340 ${y - 34} 400 ${y - 14} L400 300 L290 300 Z`} />
      <ellipse cx={180} cy={y + 30} rx={40} ry={14} fill={darken(p.stone, 0.08)} />
    </g>
  );
}

function Hearth({ x, y, p }: { x: number; y: number; p: P }) {
  return (
    <g>
      <path d={`M${x} ${y} V${y - 70} Q${x + 60} ${y - 110} ${x + 120} ${y - 70} V${y} Z`} fill={p.stone} stroke={darken(p.stone, 0.35)} strokeWidth={3} />
      <path d={`M${x + 22} ${y} V${y - 50} Q${x + 60} ${y - 80} ${x + 98} ${y - 50} V${y} Z`} fill="#2a2024" />
      <ellipse cx={x + 60} cy={y - 14} rx={34} ry={20} fill={p.glow} opacity={0.35} />
      <path d={`M${x + 44} ${y - 4} Q${x + 48} ${y - 34} ${x + 60} ${y - 44} Q${x + 64} ${y - 24} ${x + 76} ${y - 4} Z`} fill={p.glow} />
      <path d={`M${x + 52} ${y - 4} Q${x + 56} ${y - 22} ${x + 62} ${y - 28} Q${x + 64} ${y - 14} ${x + 68} ${y - 4} Z`} fill={lighten(p.glow, 0.5)} />
      <path d={`M${x + 36} ${y - 2} h48`} stroke={p.wood} strokeWidth={6} strokeLinecap="round" />
      <path d={`M${x - 8} ${y - 76} h136`} stroke={p.wood} strokeWidth={8} />
    </g>
  );
}

function Pot({ x, y, p }: { x: number; y: number; p: P }) {
  return (
    <g>
      <path d={`M${x - 26} ${y - 30} L${x + 26} ${y - 30} C${x + 28} ${y - 6} ${x + 18} ${y} ${x} ${y} C${x - 18} ${y} ${x - 28} ${y - 6} ${x - 26} ${y - 30} Z`} fill="#2e2836" stroke={INK} strokeWidth={2} />
      <ellipse cx={x} cy={y - 30} rx={26} ry={6} fill={p.alt} />
      <circle cx={x - 8} cy={y - 40} r={4} fill={lighten(p.alt, 0.4)} opacity={0.8} />
      <circle cx={x + 6} cy={y - 48} r={3} fill={lighten(p.alt, 0.4)} opacity={0.6} />
    </g>
  );
}

function Table({ x, y, w = 110, p }: { x: number; y: number; w?: number; p: P }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={10} rx={3} fill={p.wood} stroke={darken(p.wood, 0.4)} strokeWidth={1.6} />
      <path d={`M${x + 10} ${y + 10} V${y + 50} M${x + w - 10} ${y + 10} V${y + 50}`} stroke={p.wood} strokeWidth={7} />
    </g>
  );
}

function Rug({ x, y, w = 160, p }: { x: number; y: number; w?: number; p: P }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={w / 2} ry={w / 8} fill={p.accent} opacity={0.85} />
      <ellipse cx={x} cy={y} rx={w / 2 - 14} ry={w / 8 - 6} fill="none" stroke={lighten(p.accent, 0.4)} strokeWidth={3} strokeDasharray="6 5" />
    </g>
  );
}

function Bed({ x, y, p }: { x: number; y: number; p: P }) {
  return (
    <g>
      <rect x={x} y={y - 70} width={14} height={76} rx={3} fill={p.wood} />
      <rect x={x + 134} y={y - 46} width={14} height={52} rx={3} fill={p.wood} />
      <rect x={x + 8} y={y - 34} width={134} height={30} rx={6} fill={p.mystic} stroke={darken(p.mystic, 0.4)} strokeWidth={2} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={x + 30 + i * 22} y={y - 34} width={22} height={30} fill={i % 2 ? lighten(p.mystic, 0.25) : p.accent} opacity={0.55} />)}
      <ellipse cx={x + 30} cy={y - 40} rx={18} ry={9} fill="#f6f0e1" stroke={darken("#f6f0e1", 0.3)} strokeWidth={1.4} />
    </g>
  );
}

function Bookcase({ x, y, w = 110, h = 150, p }: { x: number; y: number; w?: number; h?: number; p: P }) {
  const cols = [p.accent, p.alt, p.mystic, p.coin, p.leafDeep];
  const rows = Math.floor(h / 36);
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={p.wood} stroke={darken(p.wood, 0.4)} strokeWidth={2} />
      {Array.from({ length: rows }, (_, r) => (
        <g key={r}>
          {Array.from({ length: Math.floor((w - 10) / 9) }, (_, i) => (
            <rect key={i} x={x + 6 + i * 9} y={y - h + 8 + r * 36 + ((i * 3) % 6)} width={7} height={26 - ((i * 3) % 6)} fill={cols[(i + r) % cols.length]} opacity={0.9} />
          ))}
          <rect x={x} y={y - h + 34 + r * 36} width={w} height={4} fill={darken(p.wood, 0.25)} />
        </g>
      ))}
    </g>
  );
}

function Skyline({ p, y = 210 }: { p: P; y?: number }) {
  const r = rng(11);
  let x = -10;
  const blocks: ReactNode[] = [];
  let i = 0;
  while (x < 410) {
    const w = 30 + r() * 40;
    const h = 40 + r() * 90;
    blocks.push(<rect key={`b${i}`} x={x} y={y - h} width={w} height={h} fill={mix(p.skyDeep, "#000", 0.25)} />);
    for (let wy = y - h + 10; wy < y - 8; wy += 14) {
      for (let wx = x + 6; wx < x + w - 8; wx += 12) if (r() > 0.6) blocks.push(<rect key={`w${i}-${wx}-${wy}`} x={wx} y={wy} width={5} height={7} fill={p.glow} opacity={0.75} />);
    }
    x += w + 4;
    i++;
  }
  return <g>{blocks}</g>;
}

function Lantern({ x, y, p, post = true }: { x: number; y: number; p: P; post?: boolean }) {
  return (
    <g>
      {post && <rect x={x - 3} y={y} width={6} height={300 - y} fill={darken(p.stone, 0.4)} />}
      <ellipse cx={x} cy={y - 12} rx={22} ry={22} fill={p.glow} opacity={0.18} />
      <path d={`M${x - 10} ${y - 24} L${x + 10} ${y - 24} L${x + 8} ${y} L${x - 8} ${y} Z`} fill={p.glow} stroke={darken(p.stone, 0.4)} strokeWidth={2} />
      <path d={`M${x - 13} ${y - 24} L${x} ${y - 34} L${x + 13} ${y - 24} Z`} fill={darken(p.stone, 0.4)} />
    </g>
  );
}

function Awning({ x, y, w = 160, p }: { x: number; y: number; w?: number; p: P }) {
  const n = 8;
  return (
    <g>
      <rect x={x + 6} y={y} width={6} height={110} fill={p.wood} />
      <rect x={x + w - 12} y={y} width={6} height={110} fill={p.wood} />
      {Array.from({ length: n }, (_, i) => <path key={i} d={`M${x + (i * w) / n} ${y} h${w / n} v24 q${-w / n / 2} 10 ${-w / n} 0 Z`} fill={i % 2 ? "#f6f0e1" : p.accent} stroke={darken(p.accent, 0.4)} strokeWidth={1} />)}
      <rect x={x} y={y + 76} width={w} height={14} fill={p.wood} />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={x + 18 + i * 24} cy={y + 70} r={8} fill={[p.accent, p.glow, p.leaf, p.mystic][i % 4]} stroke={INK} strokeWidth={0.8} />)}
    </g>
  );
}

function Telescope({ x, y, p }: { x: number; y: number; p: P }) {
  return (
    <g>
      <path d={`M${x} ${y} l-24 50 M${x} ${y} l24 50 M${x} ${y} l0 52`} stroke={p.wood} strokeWidth={5} />
      <g transform={`translate(${x} ${y}) rotate(-35)`}>
        <rect x={-30} y={-9} width={90} height={18} rx={4} fill={p.coin} stroke={darken(p.coin, 0.4)} strokeWidth={2} />
        <rect x={54} y={-12} width={14} height={24} rx={3} fill={darken(p.coin, 0.15)} stroke={darken(p.coin, 0.4)} strokeWidth={2} />
      </g>
    </g>
  );
}

function Tub({ x, y, p }: { x: number; y: number; p: P }) {
  return (
    <g>
      <path d={`M${x} ${y - 50} H${x + 150} C${x + 150} ${y - 10} ${x + 130} ${y} ${x + 110} ${y} H${x + 40} C${x + 20} ${y} ${x} ${y - 10} ${x} ${y - 50} Z`} fill="#f3efe8" stroke={darken(p.stone, 0.3)} strokeWidth={3} />
      <ellipse cx={x + 75} cy={y - 50} rx={72} ry={8} fill={p.water} />
      {[20, 50, 90, 120].map((dx, i) => <circle key={dx} cx={x + dx} cy={y - 60 - (i % 2) * 8} r={6 + (i % 2) * 3} fill="#fff" opacity={0.7} />)}
      {[40, 75, 110].map((dx) => <path key={dx} d={`M${x + dx} ${y - 70} q-6 -10 0 -20 q6 -10 0 -20`} stroke="#fff" strokeWidth={2} opacity={0.5} fill="none" />)}
    </g>
  );
}

function Tiles({ p, y = 200 }: { p: P; y?: number }) {
  return (
    <g>
      <rect y={y} width={400} height={300 - y} fill={lighten(p.stone, 0.3)} />
      {Array.from({ length: 12 }, (_, i) => <path key={`v${i}`} d={`M${i * 36} ${y} V300`} stroke={darken(p.stone, 0.1)} strokeWidth={1.4} />)}
      {Array.from({ length: 4 }, (_, i) => <path key={`h${i}`} d={`M0 ${y + 20 + i * 26} H400`} stroke={darken(p.stone, 0.1)} strokeWidth={1.4} />)}
    </g>
  );
}

function Driftwood({ x, y, p }: { x: number; y: number; p: P }) {
  return <path d={`M${x} ${y} q40 -16 90 -6 q30 6 60 -4 l4 10 q-32 12 -64 4 q-48 -8 -88 8 Z`} fill={lighten(p.wood, 0.35)} stroke={darken(p.wood, 0.2)} strokeWidth={2} />;
}

function Sigils({ p }: { p: P }) {
  // Pixel sigils on the wall: little blocky moons and stars, flat, no glow.
  const px = (x: number, y: number, rows: string[]) =>
    rows.flatMap((row, j) => [...row].map((ch, i) => (ch === "#" ? <rect key={`${x}-${y}-${i}-${j}`} x={x + i * 4} y={y + j * 4} width={4} height={4} fill={p.glow} opacity={0.55} /> : null)));
  return (
    <g>
      {px(40, 40, ["..##.", ".#...", "#....", "#....", ".#...", "..##."])}
      {px(340, 56, ["..#..", "..#..", "#####", "..#..", "..#.."])}
      {px(300, 22, ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"])}
    </g>
  );
}

const SCENES: Record<BackdropKind, (p: P) => ReactNode> = {
  cottage_room: (p) => (
    <g><Wall p={p} /><Window x={240} y={40} p={p} /><Boards p={p} /><Rug x={200} y={250} p={p} /><Bed x={30} y={220} p={p} /><Shelf x={60} y={90} p={p} /><Candle x={360} y={200} p={p} /></g>
  ),
  forest_glade: (p) => (
    <g><Sky p={p} h={300} /><Tree x={50} y={200} s={1.4} p={p} /><Tree x={360} y={190} s={1.2} p={p} /><Tree x={290} y={170} s={0.8} p={p} round={false} /><Tree x={130} y={175} s={0.7} p={p} round={false} /><Ground p={p} y={200} /><Tufts p={p} /><Mushroom x={330} y={262} c={p.accent} /><path d="M140 300 Q190 240 210 200 Q240 240 280 300 Z" fill={lighten(p.floor, 0.25)} opacity={0.7} /></g>
  ),
  mushroom_ring: (p) => (
    <g><Sky p={p} /><Moon x={320} y={60} r={24} p={p} /><Tree x={40} y={190} s={1.1} p={p} round={false} /><Tree x={370} y={186} s={1} p={p} round={false} /><Ground p={p} y={196} c={p.leafDeep} /><ellipse cx={200} cy={250} rx={140} ry={34} fill={lighten(p.leafDeep, 0.15)} />
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <Mushroom key={i} x={200 + Math.cos(a) * 140} y={250 + Math.sin(a) * 34} s={0.8 + (i % 3) * 0.15} c={i % 2 ? p.accent : mix(p.accent, p.glow, 0.4)} />; })}</g>
  ),
  herb_garden: (p) => (
    <g><Sky p={p} /><Tree x={360} y={180} s={0.9} p={p} /><Ground p={p} y={180} />
      {[60, 160, 260].map((x, i) => <g key={x}><rect x={x - 40} y={220 + i * 6} width={90} height={26} rx={4} fill={p.wood} stroke={darken(p.wood, 0.3)} strokeWidth={2} />{[0, 1, 2, 3].map((k) => <g key={k} transform={`translate(${x - 30 + k * 22} ${220 + i * 6})`}><path d="M0 0 l-6 -18 M0 0 l0 -22 M0 0 l6 -18" stroke={p.leafDeep} strokeWidth={3} strokeLinecap="round" /><circle cx={0} cy={-24} r={3} fill={[p.mystic, p.glow, p.accent][k % 3]} /></g>)}</g>)}
      <path d="M0 210 h400" stroke={p.wood} strokeWidth={4} strokeDasharray="4 16" /></g>
  ),
  apothecary: (p) => (
    <g><Wall p={p} h={210} /><Shelf x={30} y={70} w={150} p={p} /><Shelf x={30} y={130} w={150} p={p} /><Shelf x={230} y={90} w={140} p={p} /><Boards p={p} y={210} /><rect x={180} y={170} width={200} height={60} fill={p.wood} stroke={darken(p.wood, 0.4)} strokeWidth={2} /><rect x={180} y={164} width={200} height={10} fill={darken(p.wood, 0.15)} /><Candle x={210} y={164} p={p} h={20} /><circle cx={330} cy={150} r={14} fill={lighten(p.mystic, 0.4)} stroke={INK} strokeWidth={1.2} /></g>
  ),
  hearth_kitchen: (p) => (
    <g><Wall p={p} /><Hearth x={140} y={200} p={p} /><Pot x={200} y={196} p={p} /><Shelf x={20} y={80} w={100} p={p} /><Boards p={p} /><Table x={270} y={210} p={p} /><path d="M0 30 Q50 60 100 30 M300 30 Q350 60 400 30" stroke={p.leafDeep} strokeWidth={3} fill="none" /></g>
  ),
  observatory: (p) => (
    <g><Sky p={p} /><path d="M0 120 Q200 -40 400 120 V300 H0 Z" fill={p.wall} opacity={0.35} /><path d="M150 0 L250 0 L230 130 L170 130 Z" fill={p.sky} opacity={0.4} /><Moon x={210} y={50} r={20} p={p} /><Boards p={p} y={220} /><Telescope x={220} y={150} p={p} /><Bookcase x={20} y={220} w={90} h={130} p={p} /><rect x={300} y={160} width={80} height={60} fill={lighten(p.wall, 0.1)} stroke={p.wood} strokeWidth={3} /><circle cx={340} cy={190} r={22} fill="none" stroke={p.coin} strokeWidth={2} /><path d="M318 190 h44 M340 168 v44" stroke={p.coin} strokeWidth={1} /></g>
  ),
  starfield_roof: (p) => (
    <g><Sky p={p} seed={9} /><Moon x={90} y={70} r={30} p={p} /><path d="M0 200 L400 180 V300 H0 Z" fill={p.stone} /><path d="M0 200 L400 180" stroke={darken(p.stone, 0.3)} strokeWidth={4} />{[40, 100, 160, 220, 280, 340].map((x) => <path key={x} d={`M${x} ${200 - x / 20} V300`} stroke={darken(p.stone, 0.15)} strokeWidth={2} />)}<rect x={300} y={120} width={36} height={64} fill={darken(p.stone, 0.2)} /><rect x={140} y={230} width={120} height={30} rx={8} fill={p.mystic} opacity={0.85} /></g>
  ),
  library: (p) => (
    <g><Wall p={p} h={220} /><Bookcase x={10} y={220} w={120} h={190} p={p} /><Bookcase x={270} y={220} w={120} h={190} p={p} /><Window x={160} y={40} w={80} h={110} p={p} /><Boards p={p} y={220} /><Rug x={200} y={262} w={180} p={p} /><Candle x={200} y={215} p={p} h={20} /></g>
  ),
  bath_house: (p) => (
    <g><Wall p={p} h={200} />{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${i * 40} 0 V172`} stroke={darken(p.wall, 0.08)} strokeWidth={1.4} />)}<Window x={160} y={30} w={80} h={90} p={p} /><Tiles p={p} /><Tub x={125} y={260} p={p} /><Candle x={60} y={240} p={p} h={18} /><Candle x={340} y={240} p={p} h={22} /></g>
  ),
  pantry: (p) => (
    <g><Wall p={p} h={220} /><Shelf x={20} y={60} w={360} p={p} /><Shelf x={20} y={120} w={360} p={p} /><Shelf x={20} y={180} w={360} p={p} /><Boards p={p} y={220} /><path d="M40 0 v30 M120 0 v26 M300 0 v34" stroke="#c9a24a" strokeWidth={2} />{[40, 120, 300].map((x) => <ellipse key={x} cx={x} cy={36} rx={8} ry={10} fill="#e9d9a6" stroke={INK} strokeWidth={0.8} />)}</g>
  ),
  tea_room: (p) => (
    <g><Wall p={p} /><Window x={40} y={40} p={p} /><Window x={280} y={40} p={p} /><Boards p={p} />{[110, 290].map((x) => <g key={x}><ellipse cx={x} cy={220} rx={50} ry={10} fill="#f6f0e1" stroke={darken(p.wood, 0.3)} strokeWidth={1.6} /><path d={`M${x} 228 V270`} stroke={p.wood} strokeWidth={6} /><path d={`M${x - 14} 212 h20 v-14 h-20 Z`} fill={p.accent} stroke={INK} strokeWidth={1} /></g>)}<Shelf x={140} y={110} w={120} p={p} /></g>
  ),
  market: (p) => (
    <g><Sky p={p} /><path d="M0 160 h80 v-40 h50 v40 h70 v-60 h60 v60 h140 V220 H0 Z" fill={mix(p.wall, p.stone, 0.4)} /><Ground p={p} y={220} c={p.stone} /><Awning x={20} y={110} w={170} p={p} /><Awning x={215} y={120} w={165} p={{ ...p, accent: p.alt }} /></g>
  ),
  tide_pool: (p) => (
    <g><Sky p={p} h={160} /><Water p={p} y={120} h={60} /><rect y={170} width={400} height={130} fill={p.stone} /><ellipse cx={120} cy={230} rx={80} ry={24} fill={p.water} stroke={darken(p.stone, 0.3)} strokeWidth={4} /><ellipse cx={300} cy={260} rx={60} ry={18} fill={p.water} stroke={darken(p.stone, 0.3)} strokeWidth={4} /><path d="M110 228 q4 -16 0 -26 M128 232 q-4 -14 2 -24" stroke={p.leaf} strokeWidth={4} fill="none" strokeLinecap="round" /><path d={starPath(300, 258, 9, 0.45)} fill={p.accent} /><Rocks p={p} y={196} /></g>
  ),
  driftwood_shore: (p) => (
    <g><Sky p={p} h={170} /><Water p={p} y={140} h={50} /><path d="M0 180 Q200 160 400 182 V300 H0 Z" fill={p.floor} /><Driftwood x={30} y={250} p={p} /><Driftwood x={230} y={272} p={p} /><g transform="translate(300 230)"><path d="M-16 0 l16 -20 l16 20 Z" fill={p.wood} /><path d="M-6 -2 q6 -16 12 0" fill={p.glow} /></g><Tufts p={{ ...p, leaf: p.leafDeep }} y={190} n={8} /></g>
  ),
  sea_cave: (p) => (
    <g><rect width={400} height={300} fill={darken(p.stone, 0.45)} /><path d="M60 300 V140 Q200 10 340 140 V300 Z" fill={p.skyDeep} /><path d="M80 300 V150 Q200 40 320 150 V300 Z" fill={p.sky} opacity={0.5} /><Water p={p} y={200} h={100} /><path d="M0 0 H400 V40 Q370 70 340 40 Q300 90 260 40 Q220 70 180 30 Q140 80 100 40 Q60 70 0 40 Z" fill={darken(p.stone, 0.3)} /><Rocks p={p} y={240} /></g>
  ),
  rooftop_garden: (p) => (
    <g><Sky p={p} seed={21} /><Skyline p={p} y={200} /><Sigils p={p} /><rect y={200} width={400} height={100} fill={p.stone} /><path d="M0 200 H400" stroke={darken(p.stone, 0.4)} strokeWidth={6} />{[50, 340].map((x) => <g key={x}><rect x={x - 16} y={140} width={32} height={60} fill={darken(p.stone, 0.25)} /><rect x={x - 20} y={136} width={40} height={8} fill={darken(p.stone, 0.4)} /></g>)}{[120, 200, 280].map((x, i) => <g key={x}><rect x={x - 20} y={220} width={40} height={30} fill={[p.accent, p.alt, p.coin][i]} stroke={INK} strokeWidth={1.2} /><path d={`M${x} 220 l-8 -20 M${x} 220 l0 -24 M${x} 220 l8 -20`} stroke={p.leaf} strokeWidth={3} /></g>)}</g>
  ),
  lantern_lane: (p) => (
    <g><Sky p={p} /><Sigils p={p} /><path d="M0 40 h90 v160 H0 Z M310 60 h90 v140 h-90 Z" fill={darken(p.wall, 0.15)} />{[[20, 70], [50, 120], [330, 90], [360, 150]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width={22} height={30} fill={p.glow} opacity={0.7} stroke={p.wood} strokeWidth={2} />)}<path d="M0 200 H400 V300 H0 Z" fill={p.stone} />{Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={(i % 10) * 44 + (Math.floor(i / 10) % 2) * 22} cy={220 + Math.floor(i / 10) * 26} rx={18} ry={8} fill={darken(p.stone, 0.12)} />)}<Lantern x={130} y={130} p={p} /><Lantern x={270} y={140} p={p} /></g>
  ),
};

export const BACKDROP_LABEL: Record<BackdropKind, string> = {
  cottage_room: "Cottage room", forest_glade: "Forest glade", mushroom_ring: "Mushroom ring", herb_garden: "Herb garden", apothecary: "Apothecary",
  hearth_kitchen: "Hearth kitchen", observatory: "Observatory", starfield_roof: "Starlit roof", library: "Library", bath_house: "Bathhouse", pantry: "Pantry",
  tea_room: "Tea room", market: "Market", tide_pool: "Tide pools", driftwood_shore: "Driftwood shore", sea_cave: "Sea cave", rooftop_garden: "Rooftop garden", lantern_lane: "Lantern lane",
};

export function BackdropArt({ kind, palette }: { kind: BackdropKind; palette?: ThemePalette }) {
  const art = useArt();
  const p = palette ?? art.palette;
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      {(SCENES[kind] ?? SCENES.cottage_room)(p)}
    </svg>
  );
}

export interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  disabled?: boolean;
  badge?: string;
}

// A room: the scene, tappable activity hotspots, and whatever stands in it (witches, props).
export function Scene({ kind, palette, hotspots = [], onHotspot, children, className = "" }: { kind: BackdropKind; palette?: ThemePalette; hotspots?: Hotspot[]; onHotspot?: (id: string) => void; children?: ReactNode; className?: string }) {
  return (
    <div className={`scene-frame relative aspect-[4/3] w-full overflow-hidden ${className}`}>
      <BackdropArt kind={kind} palette={palette} />
      {hotspots.map((h) => (
        <button
          key={h.id}
          onClick={() => onHotspot?.(h.id)}
          disabled={h.disabled}
          className="hotspot absolute z-10 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          aria-label={h.badge ? `${h.label}, ready in ${h.badge}` : h.label}
        >
          <span className="hotspot-dot" aria-hidden />
          <span className="hotspot-label">{h.badge ? `${h.label} · ${h.badge}` : h.label}</span>
        </button>
      ))}
      {children}
    </div>
  );
}
