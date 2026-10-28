#!/usr/bin/env node
// Mints an invitation with your Supabase project's secret key (run on your own computer, never deployed).
// Use it once for the owner witch (that is you); after that the Owner screen in the app mints every other invite.
//   node --env-file=.env.local scripts/create-invite.mjs            (the owner witch, 7 days)
//   node --env-file=.env.local scripts/create-invite.mjs fern 3     (a named witch, 3 days)
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [requested, days = "7"] = process.argv.slice(2);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env.local).");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const query = db.from("characters").select("id, name, coven_id, owner_user_id");
const { data: c, error: ce } = await (requested ? query.eq("id", requested) : query.eq("is_owner_character", true)).single();
const characterId = c?.id ?? requested ?? "the owner witch";
if (ce || !c) {
  console.error(`No witch "${characterId}" yet. Did you run the seed (supabase/seed.sql)?`, ce?.message ?? "");
  process.exit(1);
}
if (c.owner_user_id) {
  console.error(`${characterId} is already claimed.`);
  process.exit(1);
}
const token = randomBytes(24).toString("hex");
const { error } = await db.from("invitations").insert({
  coven_id: c.coven_id,
  character_id: c.id,
  token_hash: createHash("sha256").update(token).digest("hex"),
  expires_at: new Date(Date.now() + Number(days) * 86400_000).toISOString(),
});
if (error) {
  console.error(error.message);
  process.exit(1);
}
process.stdout.write(`Invitation for ${c.name} (valid ${days} days, shown once, keep it safe):\n${site}/invite/${token}\n`);
