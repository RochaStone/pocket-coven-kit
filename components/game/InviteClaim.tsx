"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Witch } from "@/components/art/Witch";
import { api, GameError } from "@/lib/game/api";
import { WORLD } from "@/lib/game/catalog";
import type { Equipped, Look, Pronouns } from "@/lib/game/types";
import { SignIn } from "./SignIn";

interface Peek {
  valid: boolean;
  reason: string | null;
  character_id?: string;
  name?: string;
  title?: string;
  look?: Look;
  equipment?: Equipped;
  pronouns?: Pronouns;
  bundle?: { character_id: string; name: string; title: string; look: Look; equipment: Equipped }[];
}

const REASON: Record<string, string> = {
  not_found: "This invitation does not exist. Check the link, or ask the coven owner for a fresh one.",
  revoked: "This invitation was revoked. Ask the coven owner for a fresh one.",
  claimed: "This witch has already been claimed. If it was you, sign in to return to your world.",
  expired: "This invitation has expired. Ask the coven owner for a fresh one.",
};

export function InviteClaim({ token, peek, signedIn }: { token: string; peek: Peek | null; signedIn: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [authed, setAuthed] = useState(signedIn);

  const claim = async () => {
    setWorking(true);
    setError(null);
    try {
      await api.claimInvite(token);
      router.push("/play");
      router.refresh();
    } catch (e) {
      setError(e instanceof GameError ? e.hint : "That did not work. Try again.");
      setWorking(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="panel flex w-full max-w-sm flex-col items-center p-6 text-center">
        {peek?.character_id && peek.look ? (
          <>
            <p className="title-display text-lg text-mystic-500">You are invited to the coven as</p>
            <Witch look={peek.look} equipped={peek.equipment ?? {}} mood={peek.valid ? "thriving" : "sleepy"} size={220} />
            <h1 className="font-display text-3xl font-bold text-accent-500">{peek.name}</h1>
            <p className="text-sm font-semibold text-ink/65">
              {peek.title}
              {peek.pronouns ? ` · ${peek.pronouns.subject}/${peek.pronouns.object}` : ""}
            </p>
            {peek.bundle && peek.bundle.length > 0 && (
              <div className="mt-3 flex flex-col items-center">
                <p className="title-display text-base text-mystic-500">and bringing along</p>
                {peek.bundle.map((b) => (
                  <div key={b.character_id} className="flex flex-col items-center">
                    <Witch look={b.look} equipped={b.equipment ?? {}} mood={peek.valid ? "thriving" : "sleepy"} size={150} />
                    <p className="font-display text-xl font-bold text-accent-500">{b.name}</p>
                    <p className="text-xs font-semibold text-ink/65">{b.title}</p>
                  </div>
                ))}
                <p className="mt-1 text-xs text-ink/70">One login plays both. Switch between them from the top of the screen.</p>
              </div>
            )}
          </>
        ) : (
          <h1 className="title-display text-2xl text-accent-500">An invitation to {WORLD.name}</h1>
        )}
        <div className="mt-4 w-full">
          {!peek?.valid ? (
            <>
              <p className="text-sm">{REASON[peek?.reason ?? "not_found"]}</p>
              <Link className="btn ghost mt-3 inline-block" href="/">
                Go to the coven
              </Link>
            </>
          ) : authed ? (
            <button className="btn w-full" onClick={claim} disabled={working}>
              {working ? "One moment" : `Claim ${peek.name}`}
            </button>
          ) : (
            <SignIn inviteToken={token} onSignedIn={() => { setAuthed(true); claim(); }} />
          )}
          {error && <p className="mt-2 text-sm font-semibold text-[#a8343f]">{error}</p>}
        </div>
      </div>
    </main>
  );
}
