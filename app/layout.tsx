import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, Fraunces, Nunito, Silkscreen } from "next/font/google";
import type { CSSProperties } from "react";
import { WORLD } from "@/lib/game/catalog";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "600", "900"] });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], variable: "--font-cormorant", weight: ["500", "700"], style: ["italic", "normal"] });
const body = Nunito({ subsets: ["latin"], variable: "--font-body", weight: ["400", "600", "700", "800"] });
const pixel = Silkscreen({ subsets: ["latin"], variable: "--font-pixel", weight: ["400"] });
const mono = DM_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: WORLD.name,
  description: WORLD.tagline,
  appleWebApp: { capable: true, title: WORLD.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: WORLD.palette.ground,
};

// The world's palette becomes CSS variables, so every panel and button wears the coven's own colours.
const p = WORLD.palette;
const vars = {
  "--pc-ground": p.ground,
  "--pc-ground-deep": p.groundDeep,
  "--pc-paper": p.paper,
  "--pc-ink": p.ink,
  "--pc-accent": p.accent,
  "--pc-alt": p.alt,
  "--pc-mystic": p.mystic,
  "--pc-coin": p.coin,
  "--pc-warn": p.warn,
  "--pc-wall": p.wall,
  "--pc-glow": p.glow,
  "--stat-nourishment": p.glow,
  "--stat-energy": p.coin,
  "--stat-joy": p.accent,
  "--stat-magic": p.mystic,
  "--stat-social": p.alt,
  "--font-display": WORLD.displayFont === "cormorant" ? "var(--font-cormorant)" : "var(--font-fraunces)",
} as CSSProperties;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-motif={WORLD.motif} style={vars} className={`${fraunces.variable} ${cormorant.variable} ${body.variable} ${pixel.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
