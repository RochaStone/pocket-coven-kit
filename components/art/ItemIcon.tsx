"use client";
// Every item sprite, drawn from its art params (style + colours). Treats are drawn the same way.
import { useArt } from "./ArtContext";
import type { FamiliarSpecies, ItemArt } from "@/lib/game/types";
import { darken, INK, lighten, starPath } from "./colour";
import { Familiar } from "./Familiar";

type Draw = (c: string[], line: string) => React.ReactNode;
const W = 2;

const SHAPES: Record<string, Draw> = {
  // outfits (on a hanger)
  cloak: ([m, t], l) => <g><path d="M32 8 L32 13" stroke={INK} strokeWidth={2} /><path d="M20 14 L44 14 L54 58 L10 58 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M28 14 L36 14 L37 58 L27 58 Z" fill={t} /><circle cx={32} cy={16} r={2.4} fill="#e2b64a" /></g>,
  pinafore: ([m, t], l) => <g><path d="M22 10 L42 10 L48 58 L16 58 Z" fill={t} stroke={l} strokeWidth={W} /><path d="M20 26 L44 26 L50 58 L14 58 Z" fill={m} stroke={l} strokeWidth={W} /><rect x={25} y={14} width={14} height={12} fill={m} stroke={l} strokeWidth={1.4} /></g>,
  wrap_dress: ([m, t], l) => <g><path d="M22 10 L42 10 L52 58 L12 58 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M24 10 L32 22 L40 10 Z" fill={lighten(t, 0.2)} /><rect x={19} y={28} width={26} height={4} fill={t} /></g>,
  gown: ([m, t], l) => <g><path d="M24 8 L40 8 L56 58 L8 58 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M10 52 L54 52 L56 58 L8 58 Z" fill={t} />{[20, 32, 44].map((x) => <path key={x} d={starPath(x, 40, 2.6)} fill={t} />)}</g>,
  cardigan: ([m, t], l) => <g><path d="M18 34 L46 34 L52 58 L12 58 Z" fill={t} stroke={l} strokeWidth={W} /><path d="M18 8 L46 8 L48 36 L16 36 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M32 8 L32 36" stroke={l} strokeWidth={1.2} />{[16, 24, 30].map((y) => <circle key={y} cx={35} cy={y} r={1.6} fill={t} />)}</g>,
  apron_dress: ([m, t], l) => <g><path d="M22 8 L42 8 L52 58 L12 58 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M24 20 L40 20 L44 56 L20 56 Z" fill={t} stroke={darken(t, 0.4)} strokeWidth={1.2} /></g>,
  // boots
  lace_up: ([m, t], l) => <g><path d="M18 10 L32 10 L32 44 L46 48 Q48 56 40 56 L14 56 Q12 50 18 44 Z" fill={m} stroke={l} strokeWidth={W} />{[18, 26, 34].map((y) => <path key={y} d={`M20 ${y} L30 ${y + 4} M30 ${y} L20 ${y + 4}`} stroke={t} strokeWidth={1.4} />)}</g>,
  ankle: ([m, t], l) => <g><path d="M18 26 L32 26 L32 44 L46 48 Q48 56 40 56 L14 56 Q12 50 18 44 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M18 30 L32 30" stroke={t} strokeWidth={3} /></g>,
  buckled: ([m, t], l) => <g><path d="M17 8 L33 8 L33 44 L47 48 Q49 56 40 56 L13 56 Q11 50 17 44 Z" fill={m} stroke={l} strokeWidth={W} /><rect x={17} y={24} width={16} height={5} fill={t} /><rect x={22} y={23} width={7} height={7} fill="none" stroke="#e2b64a" strokeWidth={2} /></g>,
  slippers: ([m, t], l) => <g><path d="M8 50 Q8 32 28 32 Q50 32 56 50 Q56 56 48 56 L14 56 Q8 56 8 50 Z" fill={m} stroke={l} strokeWidth={W} /><circle cx={30} cy={36} r={4} fill={t} /></g>,
  // hats
  pointed: ([m, t], l) => <g><ellipse cx={32} cy={50} rx={28} ry={7} fill={m} stroke={l} strokeWidth={W} /><path d="M18 50 C24 36 30 18 46 4 C40 18 42 36 46 50 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M19 45 Q32 49 45 45 L46 50 Q32 54 18 50 Z" fill={t} /></g>,
  wide_brim: ([m, t], l) => <g><ellipse cx={32} cy={44} rx={30} ry={9} fill={m} stroke={l} strokeWidth={W} /><path d="M18 44 C18 22 46 22 46 44 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M18 38 Q32 42 46 38 L46 43 Q32 47 18 43 Z" fill={t} /></g>,
  hood: ([m, t], l) => <g><path d="M10 54 C6 20 58 20 54 54 Z" fill={m} stroke={l} strokeWidth={W} /><path d="M18 54 C16 32 48 32 46 54" fill={darken(m, 0.35)} stroke={t} strokeWidth={3} /></g>,
  beret: ([m, t], l) => <g><ellipse cx={32} cy={36} rx={26} ry={11} fill={m} stroke={l} strokeWidth={W} /><path d="M32 25 l1 -6" stroke={l} strokeWidth={3} /><path d="M10 40 Q32 48 54 40" stroke={t} strokeWidth={3} fill="none" /></g>,
  flower_crown: ([m, t]) => <g><circle cx={32} cy={34} r={18} fill="none" stroke="#5f7a43" strokeWidth={3} />{[0, 60, 120, 180, 240, 300].map((r, i) => <g key={r} transform={`rotate(${r} 32 34) translate(32 16)`}>{[0, 72, 144, 216, 288].map((p) => <ellipse key={p} cy={-3} rx={2.6} ry={3.6} fill={i % 2 ? t : m} transform={`rotate(${p})`} />)}<circle r={1.8} fill="#e2b64a" /></g>)}</g>,
  // necklaces (metal, gem)
  moon_pendant: ([m]) => <g><path d="M14 10 Q32 40 50 10" stroke={m} strokeWidth={2} fill="none" /><path d="M36 30 A12 12 0 1 0 36 54 A9 9 0 1 1 36 30 Z" fill={m} stroke={darken(m, 0.5)} strokeWidth={1.4} /></g>,
  crystal: ([m, g]) => <g><path d="M14 10 Q32 34 50 10" stroke={m} strokeWidth={2} fill="none" /><path d="M32 28 L40 36 L37 56 L27 56 L24 36 Z" fill={g} stroke={darken(g, 0.45)} strokeWidth={1.4} /></g>,
  acorn: ([m, g]) => <g><path d="M14 10 Q32 34 50 10" stroke={m} strokeWidth={2} fill="none" /><ellipse cx={32} cy={46} rx={9} ry={11} fill={g} stroke={darken(g, 0.45)} strokeWidth={1.4} /><path d="M21 40 Q32 26 43 40 Z" fill={m} stroke={darken(m, 0.5)} strokeWidth={1.4} /></g>,
  key: ([m]) => <g><path d="M14 10 Q32 30 50 10" stroke={m} strokeWidth={2} fill="none" /><circle cx={32} cy={30} r={6} fill="none" stroke={m} strokeWidth={3} /><path d="M32 36 L32 58 M32 50 L38 50 M32 56 L38 56" stroke={m} strokeWidth={3} /></g>,
  // earrings
  hoops: ([m]) => <g><circle cx={22} cy={36} r={10} fill="none" stroke={m} strokeWidth={3.4} /><circle cx={42} cy={36} r={10} fill="none" stroke={m} strokeWidth={3.4} /></g>,
  stars: ([m]) => <g><path d={starPath(22, 32, 10)} fill={m} stroke={darken(m, 0.5)} strokeWidth={1} /><path d={starPath(42, 32, 10)} fill={m} stroke={darken(m, 0.5)} strokeWidth={1} /></g>,
  drops: ([m, g]) => <g>{[22, 42].map((x) => <g key={x}><path d={`M${x} 14 L${x} 30`} stroke={m} strokeWidth={2} /><circle cx={x} cy={38} r={7} fill={g} stroke={darken(g, 0.45)} strokeWidth={1.4} /></g>)}</g>,
  leaves: ([m, g]) => <g>{[22, 42].map((x) => <path key={x} d={`M${x} 16 C${x + 10} 26 ${x + 10} 42 ${x} 50 C${x - 10} 42 ${x - 10} 26 ${x} 16 Z`} fill={g} stroke={m} strokeWidth={1.6} />)}</g>,
  // hair accessories
  ribbon: ([m, t], l) => <g><path d="M32 32 L8 18 L8 46 Z M32 32 L56 18 L56 46 Z" fill={m} stroke={l} strokeWidth={W} strokeLinejoin="round" /><circle cx={32} cy={32} r={6} fill={t} stroke={l} strokeWidth={1.4} /></g>,
  sprig: ([m]) => <g><path d="M14 54 L48 12" stroke="#4f6a3a" strokeWidth={3} />{[[24, 38], [32, 28], [40, 18]].map(([x, y]) => <ellipse key={x} cx={x + 6} cy={y + 2} rx={8} ry={3.6} fill="#6f8f4a" transform={`rotate(-40 ${x + 6} ${y + 2})`} />)}<circle cx={22} cy={36} r={4} fill={m} /><circle cx={30} cy={26} r={4} fill={m} /></g>,
  clip: ([m], l) => <path d="M40 12 A20 20 0 1 0 40 52 A15 15 0 1 1 40 12 Z" fill={m} stroke={l} strokeWidth={W} />,
  pins: ([m], l) => <g>{[[22, 22], [42, 30], [26, 46]].map(([x, y]) => <path key={x} d={starPath(x, y, 10)} fill={m} stroke={l} strokeWidth={1.2} />)}</g>,
  // furniture (wood, colour, glow)
  bed: ([w, c], l) => <g><rect x={6} y={18} width={8} height={38} rx={2} fill={w} stroke={l} strokeWidth={W} /><rect x={50} y={28} width={8} height={28} rx={2} fill={w} stroke={l} strokeWidth={W} /><rect x={10} y={34} width={44} height={14} rx={3} fill={c} stroke={l} strokeWidth={W} /><path d="M10 38 h44 M22 34 v14 M38 34 v14" stroke={lighten(c, 0.3)} strokeWidth={1.4} /><ellipse cx={18} cy={32} rx={7} ry={4} fill="#f6f0e1" stroke={l} strokeWidth={1.2} /></g>,
  armchair: ([w, c], l) => <g><path d="M14 22 Q32 10 50 22 L50 46 L14 46 Z" fill={c} stroke={l} strokeWidth={W} /><rect x={8} y={32} width={10} height={20} rx={4} fill={c} stroke={l} strokeWidth={W} /><rect x={46} y={32} width={10} height={20} rx={4} fill={c} stroke={l} strokeWidth={W} /><rect x={16} y={40} width={32} height={10} rx={3} fill={lighten(c, 0.2)} stroke={l} strokeWidth={1.4} /><path d="M14 52 v6 M50 52 v6" stroke={w} strokeWidth={4} /></g>,
  bookcase: ([w, c], l) => <g><rect x={12} y={6} width={40} height={52} fill={w} stroke={l} strokeWidth={W} />{[20, 34, 48].map((y, i) => <g key={y}><path d={`M14 ${y + 2} h36`} stroke={l} strokeWidth={1.6} />{[0, 1, 2, 3, 4].map((k) => <rect key={k} x={16 + k * 7} y={y - 10 + (k % 2)} width={5} height={11 - (k % 2)} fill={k % 2 ? c : lighten(c, 0.35 + i * 0.1)} />)}</g>)}</g>,
  table: ([w, c], l) => <g><rect x={6} y={26} width={52} height={7} rx={2} fill={w} stroke={l} strokeWidth={W} /><path d="M12 33 L12 56 M52 33 L52 56" stroke={w} strokeWidth={5} /><path d="M24 26 q8 -12 16 0" fill={c} stroke={l} strokeWidth={1.4} /></g>,
  cauldron: ([, c, g], l) => <g><path d="M10 26 L54 26 C56 48 46 56 32 56 C18 56 8 48 10 26 Z" fill="#2e2836" stroke={INK} strokeWidth={W} /><ellipse cx={32} cy={26} rx={22} ry={5} fill={c} stroke={INK} strokeWidth={1.6} /><circle cx={26} cy={18} r={3} fill={lighten(c, 0.3)} /><circle cx={36} cy={13} r={2} fill={lighten(c, 0.3)} /><path d="M24 58 q8 -6 16 0" stroke={g} strokeWidth={3} fill="none" /></g>,
  wardrobe: ([w, c], l) => <g><rect x={12} y={6} width={40} height={52} rx={3} fill={w} stroke={l} strokeWidth={W} /><path d="M32 8 v48" stroke={l} strokeWidth={1.6} /><path d={starPath(22, 22, 4)} fill={c} /><path d={starPath(42, 22, 4)} fill={c} /><circle cx={29} cy={34} r={1.6} fill="#e2b64a" /><circle cx={35} cy={34} r={1.6} fill="#e2b64a" /></g>,
  rug: ([, c], l) => <g><ellipse cx={32} cy={42} rx={28} ry={12} fill={c} stroke={l} strokeWidth={W} /><ellipse cx={32} cy={42} rx={18} ry={7} fill={lighten(c, 0.3)} /></g>,
  lamp: ([w, c, g], l) => <g><ellipse cx={32} cy={30} rx={18} ry={8} fill={g} opacity={0.35} /><path d="M20 12 L44 12 L50 28 L14 28 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M32 28 L32 52" stroke={w} strokeWidth={3} /><ellipse cx={32} cy={54} rx={12} ry={4} fill={w} stroke={l} strokeWidth={1.4} /></g>,
  dresser: ([w, c], l) => <g><rect x={10} y={22} width={44} height={34} rx={2} fill={w} stroke={l} strokeWidth={W} />{[30, 42].map((y) => <g key={y}><rect x={14} y={y - 4} width={36} height={9} fill={lighten(w, 0.15)} stroke={l} strokeWidth={1} /><circle cx={32} cy={y} r={1.6} fill="#e2b64a" /></g>)}<rect x={18} y={8} width={28} height={14} fill={c} stroke={l} strokeWidth={1.4} /></g>,
  bench: ([w], l) => <g><rect x={6} y={30} width={52} height={8} rx={2} fill={w} stroke={l} strokeWidth={W} /><rect x={6} y={16} width={52} height={6} rx={2} fill={w} stroke={l} strokeWidth={W} /><path d="M10 38 L10 56 M54 38 L54 56 M10 22 L10 30 M54 22 L54 30" stroke={w} strokeWidth={4} /></g>,
  // decor
  candles: ([, , g], l) => <g>{[[18, 26], [32, 16], [46, 30]].map(([x, y]) => <g key={x}><ellipse cx={x} cy={y - 6} rx={3} ry={5} fill={g} /><rect x={x - 4} y={y} width={8} height={56 - y} fill="#f3ead2" stroke={l} strokeWidth={1.4} /></g>)}</g>,
  plant: ([w, c], l) => <g>{[-40, -15, 10, 35].map((r) => <ellipse key={r} cx={32} cy={20} rx={6} ry={16} fill="#5f7a43" stroke="#3f5a2c" strokeWidth={1.2} transform={`rotate(${r} 32 36)`} />)}<path d="M18 36 L46 36 L42 58 L22 58 Z" fill={c} stroke={l} strokeWidth={W} /></g>,
  jars: ([, c], l) => <g>{[[10, 24, c], [26, 16, lighten(c, 0.3)], [42, 28, darken(c, 0.15)]].map(([x, y, f]) => <g key={x as number}><rect x={x as number} y={y as number} width={14} height={56 - (y as number)} rx={3} fill={f as string} stroke={l} strokeWidth={1.4} opacity={0.9} /><rect x={(x as number) - 1} y={(y as number) - 4} width={16} height={5} fill="#c9a77a" stroke={l} strokeWidth={1} /></g>)}</g>,
  lantern: ([, c, g], l) => <g><path d="M32 4 L32 12" stroke={INK} strokeWidth={2} /><path d="M22 14 L42 14 L46 22 L18 22 Z" fill={c} stroke={l} strokeWidth={1.6} /><rect x={20} y={22} width={24} height={26} fill={g} stroke={l} strokeWidth={1.6} opacity={0.85} /><path d="M32 30 q-4 6 0 10 q4 -4 0 -10" fill="#fff6d0" /><path d="M18 48 L46 48 L42 56 L22 56 Z" fill={c} stroke={l} strokeWidth={1.6} /></g>,
  wreath: ([, c]) => <g><circle cx={32} cy={32} r={20} fill="none" stroke="#4f6a3a" strokeWidth={9} />{[0, 50, 110, 170, 230, 290].map((r) => <circle key={r} cx={32 + 20 * Math.cos((r * Math.PI) / 180)} cy={32 + 20 * Math.sin((r * Math.PI) / 180)} r={3} fill={c} />)}<path d="M26 54 L32 48 L38 54" stroke={c} strokeWidth={3} fill="none" /></g>,
  garland: ([, c, g]) => <g><path d="M4 16 Q32 40 60 16" stroke="#7a6a50" strokeWidth={1.6} fill="none" />{[12, 22, 32, 42, 52].map((x, i) => <path key={x} d={starPath(x, 22 + Math.sin((i / 4) * Math.PI) * 9, 5.2)} fill={i % 2 ? c : g} stroke={INK} strokeWidth={0.8} />)}</g>,
  crystal_ball: ([w, c], l) => <g><circle cx={32} cy={28} r={18} fill={lighten(c, 0.5)} stroke={l} strokeWidth={W} opacity={0.9} /><ellipse cx={26} cy={22} rx={5} ry={3} fill="#fff" opacity={0.8} /><path d="M18 46 L46 46 L50 56 L14 56 Z" fill={w} stroke={l} strokeWidth={W} /></g>,
  broom: ([w], l) => <g><path d="M46 6 L26 40" stroke={w} strokeWidth={4} strokeLinecap="round" /><path d="M24 36 L32 42 L22 58 L8 52 Z" fill="#c9a24a" stroke={l} strokeWidth={1.6} /><path d="M14 50 L24 40 M18 54 L28 42" stroke={darken("#c9a24a", 0.3)} strokeWidth={1} /></g>,
  clock: ([w, c], l) => <g><circle cx={32} cy={32} r={22} fill={w} stroke={l} strokeWidth={W} /><circle cx={32} cy={32} r={17} fill="#f6f0e1" stroke={l} strokeWidth={1.2} /><path d="M32 32 L32 20 M32 32 L40 36" stroke={INK} strokeWidth={2} strokeLinecap="round" /><circle cx={32} cy={32} r={2} fill={c} /></g>,
  mirror: ([w, c], l) => <g><ellipse cx={32} cy={30} rx={18} ry={24} fill={w} stroke={l} strokeWidth={W} /><ellipse cx={32} cy={30} rx={13} ry={19} fill={lighten(c, 0.6)} /><path d="M24 22 L30 16" stroke="#fff" strokeWidth={3} strokeLinecap="round" /></g>,
  pumpkin: ([c, g], l) => <g><path d="M32 14 l2 -8" stroke="#5f7a43" strokeWidth={3} /><ellipse cx={32} cy={36} rx={24} ry={18} fill={c} stroke={l} strokeWidth={W} /><path d="M32 18 Q24 36 32 54 M32 18 Q40 36 32 54" stroke={darken(c, 0.3)} strokeWidth={1.4} fill="none" /><path d="M22 32 L27 36 L22 38 Z M42 32 L37 36 L42 38 Z M24 44 Q32 50 40 44" fill={g} stroke={g} strokeWidth={1.4} /></g>,
  star_tree: ([c, g], l) => <g><path d="M32 8 L50 50 L14 50 Z" fill={c} stroke={l} strokeWidth={W} /><rect x={28} y={50} width={8} height={8} fill="#6b4a2e" /><path d={starPath(32, 8, 6)} fill={g} />{[[26, 36], [38, 30], [32, 44]].map(([x, y]) => <path key={x} d={starPath(x, y, 3)} fill={g} />)}</g>,
  // collectibles (one colour)
  acorn_c: ([c], l) => <g><ellipse cx={32} cy={38} rx={13} ry={16} fill={c} stroke={l} strokeWidth={W} /><path d="M16 30 Q32 10 48 30 Z" fill={darken(c, 0.35)} stroke={l} strokeWidth={W} /><path d="M32 16 l2 -8" stroke={l} strokeWidth={3} /></g>,
  feather: ([c], l) => <g><path d="M48 8 C20 14 12 40 16 56 C34 50 52 30 48 8 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M46 10 L16 56" stroke={l} strokeWidth={1.4} /></g>,
  crystal_c: ([c], l) => <g><path d="M32 6 L44 22 L40 58 L24 58 L20 22 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M32 6 L32 58 M20 22 L44 22" stroke={lighten(c, 0.4)} strokeWidth={1.2} /></g>,
  mushroom: ([c], l) => <g><path d="M26 34 L38 34 L40 56 L24 56 Z" fill="#f6efe0" stroke={l} strokeWidth={W} /><path d="M8 36 C8 14 56 14 56 36 Z" fill={c} stroke={l} strokeWidth={W} />{[[20, 26], [34, 20], [44, 30]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={3} fill="#fff" />)}</g>,
  stone: ([c], l) => <g><path d="M10 40 C8 24 24 14 38 16 C54 18 58 34 52 46 C44 58 14 58 10 40 Z" fill={c} stroke={l} strokeWidth={W} /><circle cx={32} cy={36} r={6} fill={darken(c, 0.4)} /></g>,
  key_c: ([c], l) => <g><circle cx={20} cy={22} r={10} fill="none" stroke={c} strokeWidth={5} /><path d="M27 29 L54 56 M44 46 L50 40 M50 52 L56 46" stroke={c} strokeWidth={5} strokeLinecap="round" /></g>,
  moonstone: ([c], l) => <g><ellipse cx={32} cy={34} rx={20} ry={16} fill={c} stroke={l} strokeWidth={W} /><path d="M38 24 A10 10 0 1 0 38 44 A7 7 0 1 1 38 24 Z" fill="#fff" opacity={0.7} /></g>,
  leaf: ([c], l) => <g><path d="M10 54 C10 22 34 8 56 8 C56 32 40 54 10 54 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M10 54 L46 18" stroke={l} strokeWidth={1.4} /></g>,
  charm: ([c, accent = "#b8486a"], l) => <g><path d="M10 14 Q32 30 54 14" stroke={c} strokeWidth={2} fill="none" />{[16, 26, 38, 48].map((x, i) => <circle key={x} cx={x} cy={22 + (i % 2) * 4} r={4} fill={i % 2 ? accent : c} stroke={l} strokeWidth={1} />)}<path d={starPath(32, 44, 12)} fill={c} stroke={l} strokeWidth={1.4} /></g>,
  coin: ([c], l) => <g><circle cx={32} cy={32} r={20} fill={c} stroke={l} strokeWidth={W} /><circle cx={32} cy={32} r={14} fill="none" stroke={lighten(c, 0.35)} strokeWidth={2} /><path d={starPath(32, 32, 7)} fill={lighten(c, 0.35)} /></g>,
  bottle: ([c], l) => <g><rect x={26} y={8} width={12} height={8} fill="#c9a77a" stroke={l} strokeWidth={1.4} /><path d="M27 16 L37 16 L37 22 C50 28 50 56 32 56 C14 56 14 28 27 22 Z" fill={c} stroke={l} strokeWidth={W} opacity={0.9} /><path d="M24 34 Q32 40 40 34" stroke="#fff" strokeWidth={2} opacity={0.6} fill="none" /></g>,
  berry: ([c], l) => <g><path d="M32 18 C30 10 40 6 44 8" stroke="#4f6a3a" strokeWidth={2.4} fill="none" />{[[26, 32], [38, 30], [32, 42], [22, 44], [42, 44]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={7} fill={c} stroke={l} strokeWidth={1.2} />)}</g>,
  glass: ([c], l) => <g><path d="M14 24 L30 10 L52 18 L50 44 L28 56 L10 42 Z" fill={c} stroke={l} strokeWidth={W} opacity={0.85} /><path d="M20 26 L30 18" stroke="#fff" strokeWidth={3} opacity={0.7} strokeLinecap="round" /></g>,
  sprig_c: ([c], l) => <g><path d="M14 56 L46 10" stroke={darken(c, 0.3)} strokeWidth={3} />{[[22, 44], [30, 32], [38, 20]].map(([x, y]) => <g key={x}><ellipse cx={x + 8} cy={y + 2} rx={9} ry={4} fill={c} stroke={l} strokeWidth={1} transform={`rotate(-35 ${x + 8} ${y + 2})`} /><ellipse cx={x - 6} cy={y - 2} rx={9} ry={4} fill={c} stroke={l} strokeWidth={1} transform={`rotate(35 ${x - 6} ${y - 2})`} /></g>)}</g>,
  // treats (accent, glow)
  cup: ([c], l) => <g><path d="M30 6 q4 6 0 12" stroke="#c9b9a9" strokeWidth={2} fill="none" /><path d="M12 22 L46 22 L42 52 L16 52 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M46 28 C56 28 56 42 44 44" stroke={l} strokeWidth={3} fill="none" /><ellipse cx={29} cy={22} rx={17} ry={3} fill="#9a6a44" /></g>,
  pie: ([c, g], l) => <g><path d="M6 40 L58 40 L52 52 L12 52 Z" fill={c} stroke={l} strokeWidth={W} /><path d="M8 40 C8 22 56 22 56 40 Z" fill="#d9a35a" stroke={l} strokeWidth={W} /><path d="M20 32 L44 32 M24 26 L40 26 M32 22 L32 38" stroke={g} strokeWidth={2} /></g>,
  jar: ([c, g], l) => <g><rect x={16} y={18} width={32} height={38} rx={6} fill={g} stroke={l} strokeWidth={W} /><rect x={14} y={10} width={36} height={9} rx={2} fill={c} stroke={l} strokeWidth={1.6} /><rect x={22} y={30} width={20} height={12} fill="#f6f0e1" stroke={l} strokeWidth={1} /></g>,
  bouquet: ([c, g], l) => <g><path d="M24 58 L32 34 L40 58 Z" fill="#7a9a52" stroke={l} strokeWidth={1.6} />{[[22, 22, c], [34, 14, g], [44, 24, c], [30, 30, g], [40, 34, c]].map(([x, y, f]) => <circle key={`${x}${y}`} cx={x as number} cy={y as number} r={7} fill={f as string} stroke={l} strokeWidth={1.2} />)}</g>,
  bread: ([, g], l) => <g><path d="M8 42 C8 22 56 22 56 42 Q56 52 46 52 L18 52 Q8 52 8 42 Z" fill="#d9a35a" stroke={l} strokeWidth={W} /><path d="M20 32 l6 8 M30 28 l6 8 M40 30 l6 8" stroke={g} strokeWidth={2} /></g>,
  bowl: ([c], l) => <g><path d="M24 14 q4 6 0 10 M36 12 q4 6 0 10" stroke="#c9b9a9" strokeWidth={2} fill="none" /><path d="M8 30 L56 30 C56 46 46 54 32 54 C18 54 8 46 8 30 Z" fill={c} stroke={l} strokeWidth={W} /><ellipse cx={32} cy={30} rx={24} ry={4} fill="#d98a4a" /></g>,
};

const COLLECTIBLE_ALIAS: Record<string, string> = { acorn: "acorn_c", crystal: "crystal_c", key: "key_c", sprig: "sprig_c" };

export function ArtIcon({ art, kind, size = 56, silhouette = false, className, title }: { art: ItemArt; kind?: string; size?: number; silhouette?: boolean; className?: string; title?: string }) {
  const style = kind === "collectible" ? COLLECTIBLE_ALIAS[art.style] ?? art.style : art.style;
  const draw = SHAPES[style] ?? SHAPES.charm;
  const main = art.colours[0] ?? "#8a7a6a";
  const line = darken(main, 0.5);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} role="img" aria-label={title ?? style}>
      <g style={silhouette ? { filter: "brightness(0)", opacity: 0.18 } : undefined}>{draw(art.colours.length ? art.colours : [main], line)}</g>
    </svg>
  );
}

export function ItemIcon({ itemId, size = 56, className, silhouette = false }: { itemId: string; size?: number; className?: string; silhouette?: boolean }) {
  const { items, treats, palette } = useArt();
  const item = items.find((i) => i.id === itemId);
  if (item?.category === "companion") {
    return (
      <span className={className} style={silhouette ? { filter: "brightness(0)", opacity: 0.18, display: "inline-flex" } : { display: "inline-flex" }}>
        <Familiar species={item.art.style as FamiliarSpecies} colourway="ink" size={size} title={item.name} />
      </span>
    );
  }
  if (item) return <ArtIcon art={item.art.style === "charm" ? { ...item.art, colours: [item.art.colours[0], palette.accent] } : item.art} kind={item.category} size={size} silhouette={silhouette} className={className} title={item.name} />;
  const treat = treats.find((t) => t.id === itemId);
  if (treat) return <ArtIcon art={treat.art} size={size} className={className} title={treat.name} />;
  return <ArtIcon art={{ style: "charm", colours: ["#b8862f"] }} size={size} className={className} />;
}
