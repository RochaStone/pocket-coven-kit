import { Witch } from "@/components/art/Witch";
import { CHARACTERS } from "@/lib/game/catalog";
import { MOODS, type Mood } from "@/lib/game/types";

// Your first witch in every mood: /gallery/starter
// One mood alone on a clear background, at an exact width, for pixel checks: /gallery/starter?mood=happy&width=1000
// (add &animate=1 to draw her with her idle animation on).
export default async function Starter({ searchParams }: { searchParams: Promise<{ mood?: string; width?: string; animate?: string }> }) {
  const q = await searchParams;
  const me = CHARACTERS[0];
  const solo = (MOODS as readonly string[]).includes(q.mood ?? "") ? (q.mood as Mood) : undefined;
  if (solo) {
    const width = Math.min(2000, Math.max(100, Number(q.width) || 1000));
    return (
      <main id="shot" style={{ display: "inline-block", lineHeight: 0, background: "transparent" }}>
        <Witch look={me.look} equipped={{ ...me.equipped, companion: undefined }} mood={solo} size={width} animate={q.animate === "1"} title={me.name} />
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="title-display on-ground text-4xl">{me.name}, in every mood</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MOODS.map((m) => (
          <figure key={m} className="panel flex flex-col items-center p-3">
            <Witch look={me.look} equipped={me.equipped} mood={m} size={180} animate={false} title={`${me.name}, ${m}`} />
            <figcaption className="text-sm font-bold">{m}</figcaption>
          </figure>
        ))}
      </div>
    </main>
  );
}
