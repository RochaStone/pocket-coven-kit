// Parametric familiar: 8 species x 6 colourways x 4 accessories (none, bell, bow, hat). Original SVG.
import type { FamiliarAccessory, FamiliarColourway, FamiliarSpecies } from "@/lib/game/types";
import { darken, INK, lighten } from "./colour";

export const COLOURWAYS: Record<FamiliarColourway, { body: string; belly: string; eye: string; label: string }> = {
  ink: { body: "#2e2836", belly: "#4c4456", eye: "#e9c46a", label: "Ink" },
  cream: { body: "#eee4d0", belly: "#fbf6ea", eye: "#4f7a5a", label: "Cream" },
  ginger: { body: "#c8743a", belly: "#f1d3ad", eye: "#3f5a2a", label: "Ginger" },
  moss: { body: "#6f8a4a", belly: "#b9c98c", eye: "#e2b64a", label: "Moss" },
  dusk: { body: "#5d6b8a", belly: "#a3b2cc", eye: "#f2d69b", label: "Dusk" },
  plum: { body: "#6a3d5c", belly: "#b08aa2", eye: "#f2d69b", label: "Plum" },
};

export const ACCESSORY_LABEL: Record<FamiliarAccessory, string> = { none: "None", bell: "Bell collar", bow: "Bow", hat: "Tiny hat" };

// Where accessories sit for each species, in the 100x100 box.
const ANCHORS: Record<FamiliarSpecies, { head: [number, number]; neck: [number, number]; tilt: number }> = {
  cat: { head: [50, 26], neck: [50, 50], tilt: -6 },
  owl: { head: [50, 18], neck: [50, 50], tilt: 0 },
  moth: { head: [50, 34], neck: [50, 52], tilt: 0 },
  fox: { head: [50, 24], neck: [50, 52], tilt: 6 },
  toad: { head: [50, 40], neck: [50, 62], tilt: -4 },
  raven: { head: [48, 22], neck: [50, 48], tilt: -8 },
  snake: { head: [56, 30], neck: [52, 48], tilt: 10 },
  rabbit: { head: [50, 30], neck: [50, 56], tilt: 0 },
};

function Eyes({ y, dx = 9, r = 4.6, eye, cx = 50, blink = false }: { y: number; dx?: number; r?: number; eye: string; cx?: number; blink?: boolean }) {
  if (blink) {
    return (
      <g stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round">
        <path d={`M${cx - dx - r} ${y} q ${r} ${r} ${2 * r} 0`} />
        <path d={`M${cx + dx - r} ${y} q ${r} ${r} ${2 * r} 0`} />
      </g>
    );
  }
  return (
    <g>
      {[cx - dx, cx + dx].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill={eye} stroke={INK} strokeWidth={1.4} />
          <ellipse cx={x} cy={y} rx={r * 0.38} ry={r * 0.8} fill={INK} />
          <circle cx={x - r * 0.35} cy={y - r * 0.4} r={r * 0.28} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Body({ species, c, sleepy }: { species: FamiliarSpecies; c: (typeof COLOURWAYS)[FamiliarColourway]; sleepy: boolean }) {
  const line = darken(c.body, 0.45);
  const s = { stroke: line, strokeWidth: 1.8, strokeLinejoin: "round" as const };
  switch (species) {
    case "cat":
      return (
        <g>
          <path d="M70 84 C92 84 94 62 82 58 C76 56 74 64 80 66" fill="none" stroke={c.body} strokeWidth={7} strokeLinecap="round" />
          <path d="M70 84 C92 84 94 62 82 58" fill="none" stroke={line} strokeWidth={1.2} opacity={0.4} />
          <path d="M30 90 C26 64 36 50 50 50 C64 50 74 64 70 90 Z" fill={c.body} {...s} />
          <path d="M40 90 C40 74 44 64 50 64 C56 64 60 74 60 90 Z" fill={c.belly} opacity={0.9} />
          <path d="M30 36 L28 12 L44 24 Z M70 36 L72 12 L56 24 Z" fill={c.body} {...s} />
          <path d="M32 30 L31 18 L40 25 Z M68 30 L69 18 L60 25 Z" fill={lighten(c.belly, 0.2)} />
          <ellipse cx={50} cy={38} rx={24} ry={20} fill={c.body} {...s} />
          <Eyes y={36} eye={c.eye} blink={sleepy} />
          <path d="M47 44 L53 44 L50 47 Z" fill="#d9849a" />
          <path d="M50 47 q -3 4 -6 2 M50 47 q 3 4 6 2" stroke={INK} strokeWidth={1.2} fill="none" strokeLinecap="round" />
          <path d="M28 42 l-10 -2 M28 46 l-10 2 M72 42 l10 -2 M72 46 l10 2" stroke={line} strokeWidth={1} />
        </g>
      );
    case "owl":
      return (
        <g>
          <path d="M26 56 C24 30 38 16 50 16 C62 16 76 30 74 56 C74 80 64 92 50 92 C36 92 26 80 26 56 Z" fill={c.body} {...s} />
          <path d="M36 62 C36 50 42 46 50 46 C58 46 64 50 64 62 C64 80 58 88 50 88 C42 88 36 80 36 62 Z" fill={c.belly} />
          {[56, 64, 72, 80].map((y) => (
            <path key={y} d={`M43 ${y} q 3 3 6 0 M51 ${y} q 3 3 6 0`} stroke={darken(c.belly, 0.3)} strokeWidth={1} fill="none" />
          ))}
          <path d="M28 20 L36 30 L32 32 Z M72 20 L64 30 L68 32 Z" fill={c.body} {...s} />
          <path d="M24 56 C16 64 18 78 28 84 C30 72 30 62 24 56 Z M76 56 C84 64 82 78 72 84 C70 72 70 62 76 56 Z" fill={darken(c.body, 0.15)} {...s} />
          <circle cx={40} cy={36} r={11} fill={lighten(c.belly, 0.3)} stroke={line} strokeWidth={1.2} />
          <circle cx={60} cy={36} r={11} fill={lighten(c.belly, 0.3)} stroke={line} strokeWidth={1.2} />
          <Eyes y={36} dx={10} r={6.5} eye={c.eye} blink={sleepy} />
          <path d="M46 44 L54 44 L50 52 Z" fill="#e2a64a" stroke={INK} strokeWidth={1} />
          <path d="M42 92 l-3 5 M45 92 l0 6 M58 92 l3 5 M55 92 l0 6" stroke="#e2a64a" strokeWidth={2} strokeLinecap="round" />
        </g>
      );
    case "moth":
      return (
        <g>
          <path d="M50 54 C30 30 6 30 8 50 C10 66 30 64 48 58 Z M50 54 C70 30 94 30 92 50 C90 66 70 64 52 58 Z" fill={c.body} {...s} />
          <path d="M48 60 C34 66 20 82 30 88 C40 92 46 76 49 64 Z M52 60 C66 66 80 82 70 88 C60 92 54 76 51 64 Z" fill={darken(c.body, 0.12)} {...s} />
          <circle cx={26} cy={48} r={6} fill={c.belly} stroke={line} strokeWidth={1} />
          <circle cx={74} cy={48} r={6} fill={c.belly} stroke={line} strokeWidth={1} />
          <circle cx={26} cy={48} r={2.4} fill={c.eye} />
          <circle cx={74} cy={48} r={2.4} fill={c.eye} />
          <ellipse cx={50} cy={64} rx={9} ry={20} fill={c.belly} {...s} />
          {[58, 66, 74].map((y) => (
            <path key={y} d={`M42 ${y} q 8 3 16 0`} stroke={darken(c.belly, 0.3)} strokeWidth={1} fill="none" />
          ))}
          <circle cx={50} cy={42} r={10} fill={c.belly} {...s} />
          <path d="M46 34 C40 22 32 18 28 20 M54 34 C60 22 68 18 72 20" stroke={line} strokeWidth={1.6} fill="none" strokeLinecap="round" />
          <path d="M34 22 l-3 -4 M37 24 l-4 -3 M66 22 l3 -4 M63 24 l4 -3" stroke={line} strokeWidth={1} />
          <Eyes y={42} dx={4.5} r={3} eye={INK} blink={sleepy} />
        </g>
      );
    case "fox":
      return (
        <g>
          <path d="M66 86 C92 88 98 66 88 52 C84 64 74 70 64 72 Z" fill={c.body} {...s} />
          <path d="M88 52 C92 58 93 64 92 70 C86 66 84 60 88 52 Z" fill="#fbf6ea" />
          <path d="M32 90 C28 66 38 52 50 52 C62 52 72 66 68 90 Z" fill={c.body} {...s} />
          <path d="M42 90 C42 74 46 64 50 64 C54 64 58 74 58 90 Z" fill="#fbf6ea" opacity={0.9} />
          <path d="M30 34 L26 8 L46 26 Z M70 34 L74 8 L54 26 Z" fill={c.body} {...s} />
          <path d="M31 28 L29 14 L40 25 Z M69 28 L71 14 L60 25 Z" fill={INK} opacity={0.75} />
          <path d="M26 34 C26 24 38 22 50 22 C62 22 74 24 74 34 C74 44 60 56 50 56 C40 56 26 44 26 34 Z" fill={c.body} {...s} />
          <path d="M34 40 C40 44 46 50 50 56 C54 50 60 44 66 40 C60 46 56 50 50 50 C44 50 40 46 34 40 Z" fill="#fbf6ea" />
          <Eyes y={35} dx={10} r={4} eye={c.eye} blink={sleepy} />
          <ellipse cx={50} cy={53} rx={3.2} ry={2.4} fill={INK} />
        </g>
      );
    case "toad":
      return (
        <g>
          <path d="M14 82 C10 60 28 48 50 48 C72 48 90 60 86 82 C84 92 70 94 50 94 C30 94 16 92 14 82 Z" fill={c.body} {...s} />
          <path d="M28 88 C30 74 40 70 50 70 C60 70 70 74 72 88 Z" fill={c.belly} />
          {[[30, 62, 3], [70, 60, 3.4], [22, 76, 2.4], [78, 76, 2.6], [40, 56, 2]].map(([x, y, r]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={darken(c.body, 0.18)} />
          ))}
          <circle cx={34} cy={46} r={11} fill={c.body} {...s} />
          <circle cx={66} cy={46} r={11} fill={c.body} {...s} />
          <Eyes y={45} dx={16} r={6} eye={c.eye} blink={sleepy} />
          <path d="M30 66 C40 72 60 72 70 66" stroke={INK} strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d="M14 86 l-6 6 l8 0 M86 86 l6 6 l-8 0" stroke={line} strokeWidth={1.6} fill={c.body} />
        </g>
      );
    case "raven":
      return (
        <g>
          <path d="M60 80 L82 94 L66 92 Z" fill={darken(c.body, 0.1)} {...s} />
          <path d="M28 60 C26 40 36 26 50 26 C64 26 74 40 72 62 C70 82 60 90 48 90 C36 90 30 80 28 60 Z" fill={c.body} {...s} />
          <path d="M30 56 C20 64 22 80 34 88 C38 76 38 64 30 56 Z M70 56 C80 64 78 80 66 88 C62 76 62 64 70 56 Z" fill={darken(c.body, 0.15)} {...s} />
          <path d="M40 64 C40 56 44 52 50 52 C56 52 60 56 60 64 C60 78 56 84 50 84 C44 84 40 78 40 64 Z" fill={c.belly} opacity={0.5} />
          <Eyes y={40} dx={9} r={4} eye={c.eye} blink={sleepy} />
          <path d="M44 46 L56 46 L50 58 Z" fill="#3a3238" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
          <path d="M44 90 l-2 6 M48 90 l0 7 M54 90 l2 6" stroke="#3a3238" strokeWidth={2} strokeLinecap="round" />
          <path d="M42 24 C44 18 48 16 50 20" stroke={line} strokeWidth={1.4} fill="none" />
        </g>
      );
    case "snake":
      return (
        <g>
          <ellipse cx={50} cy={84} rx={34} ry={10} fill={darken(c.body, 0.1)} {...s} />
          <ellipse cx={50} cy={74} rx={28} ry={9} fill={c.body} {...s} />
          <ellipse cx={50} cy={65} rx={21} ry={8} fill={darken(c.body, 0.05)} {...s} />
          <path d="M60 60 C64 50 62 42 56 38" stroke={c.body} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M60 60 C64 50 62 42 56 38" stroke={line} strokeWidth={1.2} fill="none" opacity={0.5} />
          {[[30, 82], [44, 86], [60, 86], [72, 80], [36, 72], [64, 72], [50, 64]].map(([x, y]) => (
            <path key={`${x}${y}`} d={`M${x - 4} ${y} l4 -3 l4 3 l-4 3 Z`} fill={c.belly} opacity={0.8} />
          ))}
          <ellipse cx={56} cy={32} rx={15} ry={11} fill={c.body} {...s} />
          <Eyes y={30} dx={7} r={3.6} eye={c.eye} cx={56} blink={sleepy} />
          <path d="M56 42 l0 6 l-3 3 M56 48 l3 3" stroke="#c9485a" strokeWidth={1.4} fill="none" strokeLinecap="round" />
        </g>
      );
    case "rabbit":
      return (
        <g>
          <circle cx={74} cy={84} r={7} fill={c.belly} {...s} />
          <path d="M30 92 C24 70 36 56 50 56 C64 56 76 70 70 92 Z" fill={c.body} {...s} />
          <path d="M40 92 C40 78 44 70 50 70 C56 70 60 78 60 92 Z" fill={c.belly} />
          <path d="M40 30 C34 6 40 0 44 4 C48 8 48 22 46 32 Z M60 30 C66 6 60 0 56 4 C52 8 52 22 54 32 Z" fill={c.body} {...s} />
          <path d="M42 26 C39 12 41 8 43 9 C45 11 45 20 44 28 Z M58 26 C61 12 59 8 57 9 C55 11 55 20 56 28 Z" fill="#e8a6b4" opacity={0.8} />
          <ellipse cx={50} cy={44} rx={20} ry={17} fill={c.body} {...s} />
          <Eyes y={42} dx={9} r={4.2} eye={c.eye} blink={sleepy} />
          <path d="M47 50 L53 50 L50 53 Z" fill="#d9849a" />
          <path d="M50 53 l0 3" stroke={INK} strokeWidth={1.2} />
        </g>
      );
  }
}

function Accessory({ kind, species, accent }: { kind: FamiliarAccessory; species: FamiliarSpecies; accent: string }) {
  const a = ANCHORS[species];
  if (kind === "bell") {
    const [x, y] = a.neck;
    return (
      <g>
        <path d={`M${x - 14} ${y - 2} Q ${x} ${y + 5} ${x + 14} ${y - 2}`} stroke={accent} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={x} cy={y + 6} r={4.6} fill="#e2b64a" stroke={INK} strokeWidth={1.2} />
        <path d={`M${x - 3} ${y + 6} h6`} stroke={INK} strokeWidth={1} />
      </g>
    );
  }
  if (kind === "bow") {
    const [x, y] = a.neck;
    return (
      <g transform={`translate(${x} ${y})`}>
        <path d="M0 0 L-12 -7 L-12 7 Z M0 0 L12 -7 L12 7 Z" fill={accent} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <circle r={3.2} fill={darken(accent, 0.2)} stroke={INK} strokeWidth={1} />
      </g>
    );
  }
  if (kind === "hat") {
    const [x, y] = a.head;
    return (
      <g transform={`translate(${x} ${y}) rotate(${a.tilt})`}>
        <ellipse cx={0} cy={0} rx={16} ry={4} fill="#2e2836" stroke={INK} strokeWidth={1.2} />
        <path d="M-9 -1 L2 -24 L6 -20 L9 -1 Z" fill="#2e2836" stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
        <path d="M-8 -4 L8 -4" stroke={accent} strokeWidth={2.6} />
      </g>
    );
  }
  return null;
}

export function Familiar({
  species,
  colourway = "ink",
  accessory = "none",
  accent = "#b8486a",
  size = 80,
  sleepy = false,
  className,
  title,
}: {
  species: FamiliarSpecies;
  colourway?: FamiliarColourway;
  accessory?: FamiliarAccessory;
  accent?: string;
  size?: number;
  sleepy?: boolean;
  className?: string;
  title?: string;
}) {
  const c = COLOURWAYS[colourway] ?? COLOURWAYS.ink;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} role="img" aria-label={title ?? `${c.label} ${species}`}>
      <ellipse cx={50} cy={95} rx={30} ry={4} fill="#000" opacity={0.12} />
      <Body species={species} c={c} sleepy={sleepy} />
      <Accessory kind={accessory} species={species} accent={accent} />
    </svg>
  );
}

// Drawn inside another SVG (the witch), at x/y with a given box size.
export function FamiliarInline(props: Parameters<typeof Familiar>[0] & { x: number; y: number }) {
  const c = COLOURWAYS[props.colourway ?? "ink"] ?? COLOURWAYS.ink;
  return (
    <svg x={props.x} y={props.y} width={props.size ?? 60} height={props.size ?? 60} viewBox="0 0 100 100" overflow="visible">
      <ellipse cx={50} cy={95} rx={30} ry={4} fill="#000" opacity={0.12} />
      <Body species={props.species} c={c} sleepy={props.sleepy ?? false} />
      <Accessory kind={props.accessory ?? "none"} species={props.species} accent={props.accent ?? "#b8486a"} />
    </svg>
  );
}
