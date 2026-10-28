import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Compact } from "@/components/art/Compact";
import { MOTIFS } from "@/lib/game/types";
import { parseConfig } from "@/world/schema";
import { starterConfig, loadPreset } from "@/world/presets";

// One component, three motif families: each must render, and each carries its signature.
const SIGNATURE = { analog: "EST.", cyberpunk: ":~$", "y2k-blog": "you are visitor no." } as const;

describe("compact chrome motifs", () => {
  for (const motif of MOTIFS) {
    it(`${motif} renders with its signature`, () => {
      const html = renderToStaticMarkup(createElement(Compact, { open: true, onToggle: () => undefined, motif }, createElement("p", null, "the map")));
      expect(html).toContain(`data-motif="${motif}"`);
      expect(html).toContain(SIGNATURE[motif]);
      expect(html).toContain("the map");
      expect(html).not.toMatch(/glow|neon/i);
    });
  }

  it("the world chooses its motif, and the config rejects unknown ones", () => {
    expect(loadPreset("city-witch").motif).toBe("cyberpunk");
    expect(loadPreset("kitchen-witch").motif).toBe("y2k-blog");
    const c = { ...starterConfig(loadPreset("hedge-witch")), motif: "vaporwave" };
    expect(() => parseConfig(c)).toThrow(/motif must be one of/);
  });
});
