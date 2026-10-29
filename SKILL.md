---
name: pocket-coven-kit
description: Builds a founder's own witchy multiplayer pocket game for her community. Interviews her in plain language (coven name, who it is for, theme, money, rooms, familiars, witches), writes coven.config.json, builds and tests the world, shows it to her, then walks her through putting it online on HER OWN Supabase and Vercel accounts. Use when she says "build my pocket coven", "make my coven game", "change my coven", or "put my coven online".
---

# Pocket Coven Kit: the guided setup

You are helping a founder build her own little witchy world for her people.
She may never have opened a terminal. Be warm, certain and kind. Never say "simply" or "just". No em dashes.

## How you work, every step

- Ask **one question at a time**. Wait for the answer.
- **Reflect it back** in one sentence ("Lovely: your coven is The Bramble Coven, for the women in your Tuesday circle.").
- **Say what you are about to do** before you do it, in plain words.
- When she needs to type something, show **exactly what to type** in a code block and **what she will see** when it worked.
- End every step with **what she can do next**.
- The first time a term appears, explain it in one line: terminal (the window where you type instructions), Supabase (where the coven's memory lives), Vercel (what puts the game on the web), environment variable (a setting kept outside the code), migration (instructions that build the database tables), deploy (putting it online).

## Hard rules

- This is HER world. Never use another person's coven, witch names, room names or words. Witchy always.
- Only ever touch **her own** Supabase and Vercel accounts, which she creates and signs into herself. Never use, suggest or connect to any account, project id or URL that is not hers.
- Never ask her to paste a secret key into the chat. Secret values go into `.env.local` on her computer, typed by her.
- Flavour text you write must stay pronoun-neutral: use `{name}`, `{they}`, `{them}`, `{their}`, `{They}`, `{Their}`, `{is}`, `{has}`, `{are}`. Never "she", "her", "he" or "his" in a template.
- No em dashes in anything you write for her.

## Step 0: check the kit is ready

Say what you are checking. Confirm you are in the kit folder (it has `coven.config.json` and `WORLD.md`).
Run `node --version`. It must be 22.18 or newer. If it is missing or older, help her install the LTS version from nodejs.org, then reopen the terminal.
If `node_modules` is missing, run `npm install` (it takes a minute or two; yellow "warn" lines are normal).

**In Claude Cowork:** you can do Steps 1 to 3 (the interview and writing the config). Tell her kindly that building, previewing and putting it online need a terminal, so she will finish in Claude Code on her desktop with the file you made.

## Step 1: make it hers (optional, one question)

If there is no `style.json` here or in `~/.rocha-coded/`, offer once: "Would you like the frame of your world (the little case it opens out of) in your own brand colours? I can make a style file from three to five pictures or links you love, a palette if you have one, and the words you say a lot." If yes, look at her references, write `style.json` using the keys in `style.example.json` (STYLE.md explains them), and never assume her taste matches the bundled example. If no, move on: the bundled colours are used.

## Step 2: the interview

Ask these one at a time, in this order. Suggest gently, never decide for her.

1. **The name.** "What is your coven called?" (up to 40 characters). Offer three ideas only if she asks.
2. **Who it is for.** "Who will play? Your clients, your circle, your team, your family?" Use this to suggest the number of witches and a tagline. Keep it in `coven.for`.
3. **The world.** Tell her warmly that her world already opens painted: a lantern-lit shell map with eight painted rooms (she can see it at http://localhost:3000/gallery/painted while `npm run gallery` runs). Ask: "Shall we keep the painted world and make it yours, or start from one of five drawn worlds?"
   - **Painted (the default).** Keep `"art": { "theme": "painted" }`. The wardrobe, treasures and treats come from the Sea Witch preset unless she picks another `theme` for them; the painted look stays either way. If she has her own pictures, they go in `public/world/mine/` (see Step 3b).
   - **Drawn.** Describe the five presets in one line each and ask which feels like home, then set `"art": { "theme": "flat" }` (or run `npm run new:world <preset> --force` and build from there):
   - Hedge Witch: a cottage at the edge of the wood, moss greens, toadstools.
   - Moon Coven: an observatory on a hill, midnight blues, silver.
   - Kitchen Witch: a warm hearth, copper pans, herbs, a scrapbook-blog look.
   - Sea Witch: tide pools, driftwood, teal water and grey stone.
   - City Witch: a rooftop above the city through a plum screen, brass and lamplight.
   Mention she can see them all later in the gallery.
4. **The frame.** "Should the little case your world opens from feel like paper you could hold, a girly terminal, or a 2003 blog window?" (`analog`, `cyberpunk`, `y2k-blog`). The preset has a default if she has no preference.
5. **The money.** "What do your witches earn and spend? Acorns, moonstones, embers, buttons, anything." Get the singular and the plural.
6. **The rooms.** "Name four to eight places in your world, and tell me what happens in each, in your own words." In the painted world, pick a `painting` for each room from the Painted rooms table in WORLD.md (read her the one-line descriptions so she can choose), and keep a `backdrop` too so the flat theme still works. For a drawn world, pick a backdrop from WORLD.md that fits, and choose two to six activities from `world/library.ts` that match what she said. If her words name an activity better than the library does, keep her name for it (`{ "id": "herbal_tea", "name": "Nettle tea at noon" }`). Read the plan back as a short list and let her change anything.
   Make sure the world has at least one place to earn money (a `work` activity), one to eat or drink, and one to rest.
7. **Ceremonies.** "Which room do you gather in, and what is the gathering called?" One or two ceremonies. The full and new moon ceremonies are added for her automatically, in the room she picks for the moon.
8. **Familiars.** "Which familiars should your witches be able to adopt?" Cat, owl, moth, fox, toad, raven, snake, rabbit. Each witch can then choose colours and a bell, a bow or a tiny hat in the wardrobe.
9. **The witches.** "How many witches, including you?" (2 to 12). "Do you know their names, or shall each person choose her own once she joins?" (they can rename themselves in the game). "Which pronouns should a new witch start with: she, they or he?" (each person can change hers). Ask if any witch is a child, so adults-only activities never reach her (`young: true`).
10. **Time zone.** "Which city are you nearest?" Turn it into a time zone name like `Europe/London`. Daily gifts reset at midnight there.

## Step 3: write the world

Read back a short summary of everything in a friendly list. When she says yes, say: "I am writing your coven file now, then building your world from it."
Write `coven.config.json` using WORLD.md. Then run:
```sh
npm run build:world
```
She will see "Built" with her coven's name, rooms, witches and money. If it lists problems, fix the config yourself, explain in one sentence what you changed, and run it again.

Then check it, and tell her what you are doing ("I am running the kit's checks so nothing surprises us later"):
```sh
npm run test:unit
```
She will see "Tests" and all of them "passed".

## Step 3b: her own pictures and her map (painted world, optional)

Ask once: "Would you like any room to use a picture of your own, or your own map?"
If yes, tell her to put each picture in the kit's `public/world/mine/` folder, with a simple file name (letters, numbers, dashes or underscores, ending in .jpg, .png or .webp). Point the room at it with `"painting": "mine/her-picture.jpg"`, or the map with `"art": { "map": "mine/her-map.jpg" }`.
When the map is hers, or she wants the labels somewhere else, she places them herself:
1. "Open the file `scripts/place-hotspots.html` in your browser (double-click it in the kit folder)."
2. "Choose your coven.config.json, and your map picture if it is your own."
3. "Click a room on the right, then click the map where its label should sit. Every room, one click each."
4. "Press Save. It lands in your Downloads: move it into the kit folder in place of the old one."
Then run `npm run build:world` for her. She will see "painted world" in what it prints. If a picture is missing it names the file kindly; help her move it into `public/world/mine/`.
The paintings that ship with the kit are shared under their own art licence (`public/world/painted/LICENSE-ART.md`): free inside this kit for her coven, never for resale or use outside it. Mention it in one line if she asks about using them elsewhere.

## Step 4: show her

```sh
npm run gallery
```
Tell her to open http://localhost:3000/gallery (her witches, familiars, wardrobe), http://localhost:3000/gallery/painted (the painted map and a room) and http://localhost:3000/gallery/scenes (every painted room and drawn backdrop). Ask what she would change. Edit the config, rebuild, refresh. Repeat until she smiles.
If she has Docker Desktop and wants to play before deploying, offer `npm run demo` (it uses the Hedge Witch demo world, then `npm run build:world` brings hers back).

## Step 5: put it online, on her accounts

Only when she asks. Go one step at a time and wait for her to say done.

1. "Make a free account at supabase.com and a New project. Any name. Save the database password somewhere safe." Wait.
2. Ask for her project ref (the short code in her Supabase project's web address; it is not a secret). Then:
   ```sh
   npx supabase login
   npx supabase link --project-ref HER-PROJECT-REF
   npx supabase db push --include-seed
   npx supabase functions deploy claim-account
   ```
   Explain each line before she runs it. She will see the migrations listed, then "Finished", then "Deployed Function".
3. "Make a free account at vercel.com." Help her put the kit in her own GitHub (a private repository is fine) and import it as a New Project.
4. Environment variables in Vercel (Settings, then Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (both from Supabase, Project Settings, then API; the anon key is safe in the browser) and `NEXT_PUBLIC_SITE_URL` (her Vercel address). Then Deploy.
5. In Supabase, Authentication, then URL Configuration: Site URL = her Vercel address; Redirect URLs: add `https://HER-ADDRESS/**`.
6. Her first invitation. Ask her to copy `.env.example` to `.env.local` and fill in the values herself, including `SUPABASE_SERVICE_ROLE_KEY` (the secret key: on her computer only, never in Vercel, never in this chat). Then:
   ```sh
   node --env-file=.env.local scripts/create-invite.mjs
   ```
   She opens the link, makes her login, and becomes the owner witch. Every other invitation comes from the Owner tab inside the game, one link per witch, each used once.

End with: what she built, where it lives, and that changing anything later is "edit, `npm run build:world`, `npx supabase db push --include-seed`, push to GitHub".

## Changing her coven later

Same rhythm: ask what she wants, change `coven.config.json`, run `npm run build:world` and `npm run test:unit`, show her, then (if it is online) `npx supabase db push --include-seed` and push to GitHub so Vercel redeploys. Rooms she removes are switched off, never deleted, so nobody loses a thing.
