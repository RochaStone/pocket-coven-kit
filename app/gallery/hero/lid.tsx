"use client";
import { useArt } from "@/components/art/ArtContext";
import { starPath } from "@/components/art/colour";

// The open compact lid, tilted back above the room.
export function HeroLid() {
  const { chrome } = useArt();
  return (
    <svg width={220} height={80} viewBox="0 0 220 80" className="mx-auto -mb-2 block" aria-hidden>
      <ellipse cx={110} cy={44} rx={106} ry={34} fill={chrome.rim} />
      <ellipse cx={110} cy={44} rx={98} ry={28} fill={chrome.case} />
      <path d="M126 26 A26 18 0 1 0 126 62 A20 14 0 1 1 126 26 Z" fill={chrome.rim} />
      {[[160, 34, 5], [168, 52, 3.5], [60, 36, 3]].map(([x, y, r]) => <path key={x} d={starPath(x, y, r, 0.4)} fill={chrome.rim} />)}
    </svg>
  );
}
