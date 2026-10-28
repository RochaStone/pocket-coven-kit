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

## Database tests (`tests/db`, 45 tests of the real engine)

They build a throwaway Postgres database from a small stand-in for Supabase's auth schema, the real migrations, and the seed of a fixed fictional test world (`tests/fixtures/test-world.json`), then call every game function as signed-in players: invites, ownership, row-level security, the needs engine, cooldowns, the ledger, wardrobe, rooms, chat, ceremonies, gifts, the oracle, coven goals, moons, seasons, family logins.

They need any Postgres 15+ you can throw away. The database name must end in `_test` (the harness refuses anything else):
```sh
TEST_DATABASE_URL=postgres://postgres@localhost:5432/pocket_coven_test npm test
```
Without `TEST_DATABASE_URL`, `npm test` says they were skipped.
They were run and passed (45 of 45) against Postgres 17 while building this kit.

## End-to-end test (`tests/e2e`, not run while building)

`tests/e2e/multiplayer.spec.ts` drives two browsers against a local Supabase: owner invite, a second witch's invite from the Owner screen, chat across devices, a shared ceremony, persistence. It needs Docker Desktop, so it was written but not run here.
```sh
npm run setup:local && npx supabase start && npx supabase db reset
npx supabase functions serve &
npm run build && npx next start &
npx playwright test
```
