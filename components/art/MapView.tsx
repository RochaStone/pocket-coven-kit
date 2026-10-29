"use client";
// The world map inside the compact.
//   painted  the painted map picture, with a label for every room at its spot (art.hotspots in the catalog)
//   flat     every room as an arched window onto its drawn scene
import type { ReactNode } from "react";
import { LOCATIONS } from "@/lib/game/catalog";
import { useArt } from "./ArtContext";
import type { ArtTheme, LocationDef, ThemePalette } from "@/lib/game/types";
import { BackdropArt } from "./Backdrop";

type Props = {
  onSelect?: (id: string) => void;
  occupants?: Record<string, ReactNode[]>;
  locations?: LocationDef[];
  palette?: ThemePalette;
  theme?: ArtTheme; // galleries can force one look; the game follows the world
};

export function MapView({ onSelect, occupants = {}, locations = LOCATIONS, palette, theme }: Props) {
  const art = useArt();
  palette ??= art.palette;
  const look = theme ?? art.worldArt.theme;
  if (look === "painted" && art.worldArt.map) return <PaintedMap onSelect={onSelect} occupants={occupants} locations={locations} />;
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

function PaintedMap({ onSelect, occupants, locations }: { onSelect?: (id: string) => void; occupants: Record<string, ReactNode[]>; locations: LocationDef[] }) {
  const { worldArt, name } = useArt();
  return (
    <div className="painted-map relative w-full overflow-hidden" data-art="painted">
      {/* A plain img keeps the map's own shape, whatever picture the founder drops in. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={worldArt.map} alt={`Map of ${name}`} className="block h-auto w-full select-none" draggable={false} />
      {locations.map((l) => {
        const s = worldArt.hotspots[l.id];
        if (!s) return null;
        return (
          <button
            key={l.id}
            type="button"
            onClick={() => onSelect?.(l.id)}
            className="map-pin absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={`Go to ${l.name}`}
            data-room={l.id}
          >
            {occupants[l.id] && <span className="-mb-1 flex justify-center -space-x-3">{occupants[l.id]}</span>}
            <span className="map-pin-label">{l.name}</span>
          </button>
        );
      })}
    </div>
  );
}
