# Testing

```sh
npm run lint
npm run typecheck
npm test          # unit tests, then the database tests if TEST_DATABASE_URL is set
```

## Unit tests (always run, no database needed)

- `tests/unit/world.test.ts`: every theme preset builds a valid catalog and seed; each has 6 rooms, 14 activities, ceremonies, 30+ wearables over all 7 slots and a full palette; the Sea Witch has no shells or pearls; the config schema rejects a missing room, a missing currency, unknown activities, presets, familiars, time zones and witch counts; a founder's own names, flavour, palette and money reach the seed; witch ids stay unique; gendered flavour is refused.
- `tests/unit/catalog.test.ts`: the committed world passes its checks, matches `coven.config.json`, and matches `supabase/seed.sql`; pronouns render correctly for she, they and he; mood, decay and level rules.
- `tests/unit/forbidden.test.ts`: nothing listed in `tests/forbidden-content.txt` (the original game's rooms, items, brand and flavour lines, plus hashed names and ids) appears in any preset's generated output, the committed catalog and seed, or the app, art, engine and scripts.
- `tests/unit/motif.test.ts`: the compact renders in all three motif families, each with its signature.
- `tests/unit/starter-witch.test.ts`: a fresh install's first witch is the mer-witch and the owner's witch; she wears and owns the tail, crown, pearls, fin ears and shell clip; she is drawn with the original mer-witch figure (`components/art/mer`); a fingerprint of every shape she is drawn with, in four moods, matches the original's own SVG; each mood carries its own face and effects; her mini portrait uses the same figure; the other witches start ordinary; the signature pieces join the painted world's wardrobe and never appear in the drawn presets; renaming, recolouring and swapping her pieces through `witches.slots` builds cleanly; wrong looks and pieces are explained.
- `tests/unit/painted.test.ts`: a fresh install is painted; the painted world builds with a painting and a map spot for every room; one key (`art.theme`) switches to the flat drawn world and back, and the map renders as a picture with eight labels or as drawn tiles; the five presets and files with no `art` block stay flat; every room's painted backdrop renders and its picture is in `public/`; hotspot positions, room ids, map and painting names are checked (no paths outside `public/world/mine/`, no web addresses); the hotspot placer's saved file passes the kit's checks and builds; a scan of every shipped file, file name and picture for private names and places (the hashed list in `tests/forbidden-content.txt`); the art budget (each painting 1600 px or less on the long side, 320 KB or less, no metadata, the set under 4 MB).

## Database tests (`tests/db`, 45 tests of the real engine)

They build a throwaway Postgres database from a small stand-in for Supabase's auth schema, the real migrations, and the seed of a fixed fictional test world (`tests/fixtures/test-world.json`), then call every game function as signed-in players: invites, ownership, row-level security, the needs engine, cooldowns, the ledger, wardrobe, rooms, chat, ceremonies, gifts, the oracle, coven goals, moons, seasons, family logins.

They need any Postgres 15+ you can throw away. The database name must end in `_test` (the harness refuses anything else):
```sh
TEST_DATABASE_URL=postgres://postgres@localhost:5432/pocket_coven_test npm test
```
Without `TEST_DATABASE_URL`, `npm test` says they were skipped.
They were run and passed (45 of 45) against Postgres 17 while building this kit, and again (45 of 45) after the painted world was added.

## The mer-witch against the original

The starter witch was ported line for line from the original pocket coven art. Checked while building:
- Rendered the same way (headless Chrome, 1000 x 1300, reduced motion), the kit's four moods and the original's own SVG are pixel-identical (0.000% of pixels differ).
- Shape by shape, the kit draws everything the original draws; the original only adds four gradient stops it never uses.
- Against the original PNGs (captured with animations paused at their first frame), the kit differs on 0.13% to 0.19% of pixels, the same as the original's own SVG against those PNGs.

## The painted theme in a browser

`/gallery/painted` draws the painted map in its compact and one painted room with two witches, with no database. The README hero (`/gallery/hero`) and Playwright screenshots of the map and a room were rendered from it while building. `scripts/place-hotspots.html` was driven in headless Chrome: load the config, click the map twice, save, and the saved file built cleanly.

## End-to-end test (`tests/e2e`, not run while building)

`tests/e2e/multiplayer.spec.ts` drives two browsers against a local Supabase: owner invite, a second witch's invite from the Owner screen, chat across devices, a shared ceremony, persistence. It needs Docker Desktop, so it was written but not run here.
```sh
npm run setup:local && npx supabase start && npx supabase db reset
npx supabase functions serve &
npm run build && npx next start &
npx playwright test
```
