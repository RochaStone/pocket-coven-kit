<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`: verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Working on this kit

- Content is generated. Edit `coven.config.json`, `world/presets/*.json` or `world/library.ts`, then run `npm run build:world`. Never hand-edit `lib/game/catalog.ts` or `supabase/seed.sql`.
- The engine lives in `supabase/migrations`. Every player action is a `SECURITY DEFINER` function; clients never write tables.
- Flavour text stays pronoun-neutral (`{name}`, `{they}`, `{their}`, `{is}`, `{are}`); the build refuses gendered lines.
- Before finishing: `npm run lint && npm run typecheck && npm test`, then `./scripts/security-check.sh`.
- SKILL.md is the founder's guided setup. Follow its tone rules: one question at a time, plain words, no em dashes.
- The painted world (the default look) lives in `public/world/painted/` under its own art licence (`LICENSE-ART.md` there), not MIT. Never add pictures of people. Room pictures are chosen in `coven.config.json` (`art`, and `painting` per room); `world/painted.ts` holds the list and the map spots.
- `components/art/mer/` is the original mer-witch figure, ported line for line. Keep it exact: `tests/unit/starter-witch.test.ts` fingerprints every shape in four moods. Never name her world in code (the forbidden-word scan reads components).
