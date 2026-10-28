// Regenerates supabase/seed.sql from the current lib/game/catalog.ts (no config read).
// Run: node scripts/gen-seed.ts   (Node 22.18+ strips types natively). `npm run build:world` does this for you.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { CATALOG } from "../lib/game/catalog.ts";
import { buildSeedSql } from "../lib/game/seed-sql.ts";

const out = fileURLToPath(new URL("../supabase/seed.sql", import.meta.url));
writeFileSync(out, buildSeedSql(CATALOG));
process.stdout.write(`wrote ${out}\n`);
