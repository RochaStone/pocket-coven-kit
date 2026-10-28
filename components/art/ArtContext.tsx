"use client";
// Lets the art render any world, not only the one in catalog.ts (the galleries and README renders use this).
// Inside the game nothing provides it, so everything falls back to the built world.
import { createContext, useContext, type ReactNode } from "react";
import { GIFT_TREATS, ITEMS, WORLD } from "@/lib/game/catalog";
import type { Chrome, GiftTreatDef, ItemArt, ItemDef, Motif, ThemePalette, World } from "@/lib/game/types";

export interface ArtWorld {
  items: ItemDef[];
  treats: GiftTreatDef[];
  palette: ThemePalette;
  chrome: Chrome;
  motif: Motif;
  name: string;
  slug: string;
}

const DEFAULT: ArtWorld = { items: ITEMS, treats: GIFT_TREATS, palette: WORLD.palette, chrome: WORLD.chrome, motif: WORLD.motif, name: WORLD.name, slug: WORLD.slug };
const Ctx = createContext<ArtWorld>(DEFAULT);

export function ArtProvider({ world, motif, children }: { world: World; motif?: Motif; children: ReactNode }) {
  const value: ArtWorld = { items: world.items, treats: world.giftTreats, palette: world.meta.palette, chrome: world.meta.chrome, motif: motif ?? world.meta.motif, name: world.meta.name, slug: world.meta.slug };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useArt = () => useContext(Ctx);
export const useItem = (id?: string): ItemDef | undefined => {
  const { items } = useArt();
  return id ? items.find((i) => i.id === id) : undefined;
};
export const useItemArt = (id?: string): ItemArt | undefined => useItem(id)?.art;
