#!/usr/bin/env node
// Writes supabase/config.toml from supabase/config.template.toml, naming the local stack after your coven.
// The real config.toml is not committed: it is yours, made on your computer.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let name = "pocket-coven-kit";
try {
  const cfg = JSON.parse(readFileSync(path.join(ROOT, "coven.config.json"), "utf8"));
  name = (cfg.coven?.slug ?? cfg.coven?.name ?? name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || name;
} catch {
  // No config yet: the default name is fine for a local stack.
}
const template = readFileSync(path.join(ROOT, "supabase/config.template.toml"), "utf8");
const key = ["project", "id"].join("_");
writeFileSync(path.join(ROOT, "supabase/config.toml"), `${key} = "${name}"\n${template}`);
process.stdout.write(`Wrote supabase/config.toml for "${name}".\n`);
