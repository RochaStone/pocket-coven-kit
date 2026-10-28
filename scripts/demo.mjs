#!/usr/bin/env node
// npm run demo
// A playable Hedge Witch coven on YOUR computer: a local Supabase with three sample witches
// (Bramble, Fern and Sorrel, all fictional), two of them already playing, so you can click around before deploying.
// Needs Docker Desktop running (local Supabase lives inside it). Nothing here touches the internet or anyone's account.
import { execSync, spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd) => execSync(cmd, { cwd: ROOT, stdio: "inherit" });
const say = (s) => process.stdout.write(`\n${s}\n`);
const PASSWORD = "demo-coven-42";

const docker = spawnSync("docker", ["info"], { stdio: "ignore" });
if (docker.status !== 0) {
  say(`The demo needs Docker Desktop, and it is not running (or not installed) yet.
That is completely normal on a first go. Two kind options:
  1. Install Docker Desktop from docker.com, open it, wait for the whale to settle, then run: npm run demo
  2. Skip the demo for now and see all the art with no database: npm run gallery
     then open http://localhost:3000/gallery in your browser.`);
  process.exit(1);
}

say("Step 1 of 4: building the Hedge Witch demo world...");
run("node scripts/build-world.ts examples/demo.coven.config.json");
run("node scripts/setup-local.mjs");

say("Step 2 of 4: starting your local Supabase (the first time takes a few minutes while it downloads)...");
run("npx supabase start");
run("npx supabase db reset");

say("Step 3 of 4: connecting the app to it...");
const env = Object.fromEntries(
  execSync("npx supabase status -o env", { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .map((l) => l.match(/^([A-Z_]+)="?([^"]*)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);
const envFile = path.join(ROOT, ".env.local");
if (!existsSync(envFile)) {
  writeFileSync(envFile, `NEXT_PUBLIC_SUPABASE_URL=${env.API_URL}\nNEXT_PUBLIC_SUPABASE_ANON_KEY=${env.ANON_KEY}\nNEXT_PUBLIC_SITE_URL=http://localhost:3000\n`);
  say("Wrote .env.local with your LOCAL addresses (it stays on this computer and is never committed).");
}

say("Step 4 of 4: letting the sample witches in...");
const db = new pg.Client({ connectionString: env.DB_URL });
await db.connect();
const witches = [
  { id: "bramble", email: "bramble@demo.local" },
  { id: "fern", email: "fern@demo.local" },
  { id: "sorrel", email: "sorrel@demo.local" },
];
for (const w of witches) {
  const { rows } = await db.query(
    `insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data)
     values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', $1, extensions.crypt($2, extensions.gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}')
     on conflict do nothing returning id`,
    [w.email, PASSWORD],
  );
  const uid = rows[0]?.id ?? (await db.query("select id from auth.users where email = $1", [w.email])).rows[0].id;
  await db.query(
    `insert into auth.identities (id, user_id, provider_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
     values (gen_random_uuid(), $1, $1::text, jsonb_build_object('sub', $1::text, 'email', $2::text), 'email', now(), now(), now()) on conflict do nothing`,
    [uid, w.email],
  );
  const token = (await db.query("select encode(extensions.gen_random_bytes(24), 'hex') as t")).rows[0].t;
  await db.query(
    "insert into public.invitations (coven_id, character_id, token_hash, expires_at) select coven_id, id, encode(extensions.digest($2, 'sha256'), 'hex'), now() + interval '7 days' from public.characters where id = $1",
    [w.id, token],
  );
  // Claim as that witch, exactly as the app would.
  await db.query("begin");
  await db.query("set local role authenticated");
  await db.query("select set_config('request.jwt.claim.sub', $1, true)", [uid]);
  await db.query("select public.claim_invite($1)", [token]);
  if (w.id !== "bramble") {
    await db.query("select public.send_chat('text', $1)", [w.id === "fern" ? "Kettle is on in the hearth room. Who wants stew?" : "Found a fairy ring cap in the glade. Not eating it. Admiring it."]);
    await db.query("select public.set_location($1)", [w.id === "fern" ? "hearth" : "glade"]);
  }
  await db.query("commit");
}
await db.end();

say(`Your demo coven is ready.
  1. In this same window, run:   npm run dev
  2. Open http://localhost:3000 and choose "Enter the coven".
  3. Sign in as Bramble, the owner witch:
       email:    bramble@demo.local
       password: ${PASSWORD}
     Fern and Sorrel are already in the coven. Their logins use the same password, so you can open a
     private window and play as one of them too.
When you are ready to build YOUR world, run: npm run build:world   (it goes back to coven.config.json).`);
