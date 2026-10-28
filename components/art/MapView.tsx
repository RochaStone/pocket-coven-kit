"use client";
// The world map inside the compact: every room as an arched window onto its scene.
import type { ReactNode } from "react";
import { LOCATIONS } from "@/lib/game/catalog";
import { useArt } from "./ArtContext";
import type { LocationDef, ThemePalette } from "@/lib/game/types";
import { BackdropArt } from "./Backdrop";

export function MapView({
  onSelect,
  occupants = {},
  locations = LOCATIONS,
  palette,
}: {
  onSelect?: (id: string) => void;
  occupants?: Record<string, ReactNode[]>;
  locations?: LocationDef[];
  palette?: ThemePalette;
}) {
  const art = useArt();
  palette ??= art.palette;
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {locations.map((l) => (
        <button key={l.id} type="button" onClick={() => onSelect?.(l.id)} className="map-tile group flex flex-col items-center text-center" aria-label={`Go to ${l.name}`}>
          <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-t-[999px] rounded-b-[14px] border-[3px]" style={{ borderColor: palette.wood }}>
            <BackdropArt kind={l.backdrop} palette={palette} />
            {occupants[l.id] && <span className="absolute inset-x-0 bottom-0 flex justify-center -space-x-3">{occupants[l.id]}</span>}
          </span>
          <span className="mt-1 text-[12px] font-bold leading-tight">{l.name}</span>
        </button>
      ))}
    </div>
  );
}
