// Public values only (safe in the browser; data is protected by row-level security).
// They come from YOUR Supabase project, set in .env.local for local work and in Vercel for the live site.
// There are no defaults: an unconfigured app shows a friendly "not connected yet" screen instead.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
// Edge functions (overridable so local tests can run them outside the Supabase gateway).
export const FUNCTIONS_URL = (process.env.NEXT_PUBLIC_FUNCTIONS_URL || `${SUPABASE_URL}/functions/v1`).replace(/\/$/, "");
export const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
