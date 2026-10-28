import type { MetadataRoute } from "next";
import { WORLD } from "@/lib/game/catalog";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: WORLD.name,
    short_name: WORLD.name.length > 12 ? "Pocket Coven" : WORLD.name,
    description: WORLD.tagline,
    id: "/play",
    start_url: "/play",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: WORLD.palette.ground,
    theme_color: WORLD.palette.ground,
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
