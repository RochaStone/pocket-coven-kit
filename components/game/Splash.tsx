"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Compact } from "@/components/art/Compact";
import { Witch } from "@/components/art/Witch";
import { CHARACTERS, WORLD } from "@/lib/game/catalog";
import { supabaseBrowser } from "@/lib/supabase/client";
import { SignIn } from "./SignIn";

export function Splash({ configured, signedIn, characterName, authError }: { configured: boolean; signedIn: boolean; characterName: string | null; authError: string | null }) {
  const [open, setOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();
  const showcase = CHARACTERS.slice(0, 3);
  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 pb-10 pt-[max(env(safe-area-inset-top),24px)]">
      <h1 className="text-center">
        <span className="font-pixel on-ground block text-[11px] uppercase tracking-[0.3em] opacity-80">a pocket coven</span>
        <span className="title-display on-ground block text-[38px] leading-none">{WORLD.name}</span>
        <span className="on-ground mt-1 block text-sm opacity-80">{WORLD.tagline}</span>
      </h1>
      <div className="mt-5 w-full max-w-[520px]">
        <Compact open={open} onToggle={() => setOpen((o) => !o)}>
          <div className="flex flex-col items-center gap-3 p-4 text-center">
            <div className="flex items-end justify-center -space-x-6">
              {showcase.map((c, i) => (
                <div key={c.id} style={{ zIndex: i === 1 ? 10 : 5 }}>
                  <Witch look={c.look} equipped={c.equipped} mood={i === 1 ? "thriving" : "happy"} size={i === 1 ? 120 : 96} title={c.name} />
                </div>
              ))}
            </div>
            {!configured ? (
              <p className="rounded-2xl bg-white/80 p-3 text-xs text-ink">The coven&apos;s database is not connected yet. The README shows how to connect your own Supabase project.</p>
            ) : characterName ? (
              <button className="btn" onClick={() => router.push("/play")}>
                Back to {characterName}
              </button>
            ) : signedIn ? (
              <div className="space-y-2 text-sm text-ink">
                <p className="font-semibold">You are signed in, but no witch is linked to this email yet.</p>
                <p className="opacity-80">Open the invitation link you were sent to claim your witch.</p>
                <button className="text-xs font-bold text-accent-500" onClick={async () => { await supabaseBrowser().auth.signOut(); router.refresh(); }}>
                  Sign out
                </button>
              </div>
            ) : signingIn ? (
              <p className="text-sm font-semibold text-ink">Sign in just below.</p>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button className="btn" onClick={() => setSigningIn(true)}>
                  Enter the coven
                </button>
                <p className="text-xs text-ink/70">New here? Open the invitation link you were sent.</p>
              </div>
            )}
            {authError && <p className="text-sm font-semibold text-warn-500">{authError}</p>}
          </div>
        </Compact>
      </div>
      {open && signingIn && !characterName && !signedIn && (
        <section className="panel mt-4 w-full max-w-sm p-5">
          <SignIn onSignedIn={() => { router.push("/play"); router.refresh(); }} />
        </section>
      )}
      {!open && <p className="on-ground mt-4 text-sm font-bold opacity-80">Tap to open</p>}
    </main>
  );
}
