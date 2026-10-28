import { MOTIFS } from "@/lib/game/types";
import { MotifCompact } from "../showcase";
import { presetWorld } from "../worlds";

// The same world in the three motif families, side by side: /gallery/triptych
export default function Triptych() {
  const world = presetWorld("hedge-witch");
  return (
    <main className="grid min-h-dvh place-items-center p-6" style={{ background: "#50163C" }}>
      <div id="shot" className="grid w-[1260px] grid-cols-3 items-start gap-6 p-6" style={{ background: "#50163C" }}>
        {MOTIFS.map((m) => (
          <figure key={m} className="flex flex-col items-center gap-3">
            <MotifCompact world={world} motif={m} />
            <figcaption className="font-pixel text-sm" style={{ color: "#FFF7F4" }}>{m}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
