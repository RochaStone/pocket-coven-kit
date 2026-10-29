"use client";
// Necklaces, earrings and hair accessories for the kit's witch, including the original mer-witch pieces
// (pearls, fin ears, shell clip) placed onto this figure. Split from Witch.tsx to keep each file small.
import { useItemArt } from "./ArtContext";
import { darken, starPath } from "./colour";
import { Ear, Pearls, ShellClip } from "./mer/Body";
import { skinPalette } from "./mer/color";
import { mirror } from "./mer/geometry";

// The original figure's pieces, placed onto this figure's head (centred at 100, 92 rather than 100, 97.5).
export const MER_HEAD = "translate(100 92) scale(0.932) translate(-100 -97.5)";

export function Necklace({ id }: { id?: string }) {
  const a = useItemArt(id);
  if (!a) return null;
  const [metal, gem] = a.colours;
  if (a.style === "pearls")
    return (
      <g transform="translate(100 130) scale(1.1)">
        <Pearls pearl={metal} line={gem} />
      </g>
    );
  const line = darken(metal, 0.5);
  return (
    <g>
      <path d="M86 130 Q100 146 114 130" stroke={metal} strokeWidth={1.8} fill="none" />
      <g transform="translate(100 146)">
        {a.style === "moon_pendant" && <path d="M4 -6 A7 7 0 1 0 4 6 A5 5 0 1 1 4 -6 Z" fill={metal} stroke={line} strokeWidth={1} />}
        {a.style === "crystal" && <path d="M0 -7 L5 -2 L3 7 L-3 7 L-5 -2 Z" fill={gem} stroke={line} strokeWidth={1} />}
        {a.style === "acorn" && (
          <g>
            <ellipse cx={0} cy={2} rx={4.5} ry={5.5} fill={gem} stroke={line} strokeWidth={1} />
            <path d="M-5.5 -1 Q0 -8 5.5 -1 Z" fill={metal} stroke={line} strokeWidth={1} />
          </g>
        )}
        {a.style === "key" && <path d="M0 -6 a3 3 0 1 1 0.1 0 M0 -3 L0 7 M0 4 L3 4 M0 7 L3 7" stroke={metal} strokeWidth={2} fill="none" />}
      </g>
    </g>
  );
}

export function Earrings({ id }: { id?: string }) {
  const a = useItemArt(id);
  if (!a) return null;
  const [metal, gem] = a.colours;
  if (a.style === "fins")
    return (
      <g transform={MER_HEAD}>
        {[1, -1].map((s) => (
          <g key={s} transform={s === -1 ? mirror : undefined}>
            <Ear fin={metal} sp={skinPalette("#f9d6c3")} />
          </g>
        ))}
      </g>
    );
  return (
    <g>
      {[58, 142].map((x) => (
        <g key={x} transform={`translate(${x} 110)`}>
          {a.style === "hoops" && <circle cx={0} cy={4} r={5} fill="none" stroke={metal} strokeWidth={2} />}
          {a.style === "stars" && <path d={starPath(0, 3, 4.2)} fill={metal} />}
          {a.style === "drops" && (
            <g>
              <path d="M0 0 L0 5" stroke={metal} strokeWidth={1.4} />
              <circle cx={0} cy={8} r={3.2} fill={gem} stroke={darken(gem, 0.4)} strokeWidth={0.8} />
            </g>
          )}
          {a.style === "leaves" && <path d="M0 0 C5 4 5 10 0 13 C-5 10 -5 4 0 0 Z" fill={gem} stroke={metal} strokeWidth={1} />}
        </g>
      ))}
    </g>
  );
}

export function HairAcc({ id }: { id?: string }) {
  const a = useItemArt(id);
  if (!a) return null;
  const [M, T] = a.colours;
  const line = darken(M, 0.5);
  return (
    <g transform="translate(136 78)">
      {a.style === "ribbon" && (
        <g>
          <path d="M0 0 L-14 -9 L-14 9 Z M0 0 L14 -9 L14 9 Z" fill={M} stroke={line} strokeWidth={1.4} strokeLinejoin="round" />
          <circle r={3.6} fill={T} stroke={line} strokeWidth={1} />
        </g>
      )}
      {a.style === "sprig" && (
        <g>
          <path d="M-6 8 L8 -10" stroke="#4f6a3a" strokeWidth={2} />
          {[[-2, 2], [2, -3], [5, -8]].map(([x, y]) => <ellipse key={`${x}${y}`} cx={x + 4} cy={y} rx={4} ry={2} fill="#6f8f4a" transform={`rotate(-30 ${x + 4} ${y})`} />)}
          <circle cx={-3} cy={-1} r={2.4} fill={M} />
          <circle cx={1} cy={-6} r={2.4} fill={M} />
        </g>
      )}
      {a.style === "shell_clip" && (
        <g transform="translate(4 -14) scale(0.932)">
          <ShellClip shell={M} rib={T} />
        </g>
      )}
      {a.style === "clip" && <path d="M6 -8 A10 10 0 1 0 6 8 A7 7 0 1 1 6 -8 Z" fill={M} stroke={line} strokeWidth={1.2} />}
      {a.style === "pins" && [[0, 0], [-8, 10], [6, 14]].map(([x, y]) => <path key={`${x}${y}`} d={starPath(x, y, 4.4)} fill={M} stroke={line} strokeWidth={0.8} />)}
    </g>
  );
}
