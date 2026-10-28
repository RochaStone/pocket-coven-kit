#!/usr/bin/env node
// Runs the database tests when a throwaway Postgres is available (TEST_DATABASE_URL, database name ending in _test).
// Without one, it says so kindly and skips: the unit tests already ran. See tests/TESTING.md.
import { spawnSync } from "node:child_process";

if (!process.env.TEST_DATABASE_URL) {
  process.stdout.write("\nDatabase tests skipped: TEST_DATABASE_URL is not set. tests/TESTING.md shows how to run them.\n");
  process.exit(0);
}
const r = spawnSync("npx", ["vitest", "run", "tests/db"], { stdio: "inherit" });
process.exit(r.status ?? 1);
