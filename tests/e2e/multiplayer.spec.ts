import { expect, test, type Browser, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { CHARACTERS, LOCATIONS, SHARED_EVENTS } from "@/lib/game/catalog";

// Requires: Docker, a local Supabase (`npm run setup:local && npx supabase start && npx supabase db reset`),
// `npx supabase functions serve` for the claim-account function, .env.local pointing at it,
// and the app running on E2E_BASE_URL (`npm run build && npx next start`). See tests/TESTING.md.
const PASSWORD = "coven-test-magic-42";
const owner = CHARACTERS[0];
const second = CHARACTERS[1];

async function claimViaInvite(browser: Browser, url: string, email: string, name: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await page.getByLabel("Email").fill(email);
  await page.getByLabel(/choose a password/i).fill(PASSWORD);
  await page.getByRole("button", { name: /create my login/i }).click();
  await page.waitForURL("**/play");
  return { ctx, page, errors };
}

async function collectDaily(page: Page) {
  await page.getByRole("button", { name: /collect today/i }).click();
  await page.getByRole("button", { name: /into my basket/i }).click();
}

test("a two-witch coven: invites, claims, chat, presence, a shared ceremony, persistence", async ({ browser }) => {
  const out = execFileSync("node", ["--env-file=.env.local", "scripts/create-invite.mjs"], { encoding: "utf8" });
  const ownerUrl = out.match(/http\S+\/invite\/[0-9a-f]{48}/)![0];
  const a = await claimViaInvite(browser, ownerUrl, "owner@coven.test", owner.name);
  await collectDaily(a.page);

  await a.page.goto("/admin");
  await a.page.locator("li", { hasText: second.name }).getByRole("button", { name: "New invite" }).click();
  const secondUrl = (await a.page.locator("code").first().textContent())!;
  const b = await claimViaInvite(browser, secondUrl, "second@coven.test", second.name);
  await collectDaily(b.page);

  // Chat crosses devices.
  await a.page.goto("/play");
  await a.page.getByRole("button", { name: /^Coven/ }).click();
  await a.page.getByLabel("Message").fill("Hello from the owner");
  await a.page.getByRole("button", { name: "Send" }).click();
  await b.page.getByRole("button", { name: /^Coven/ }).click();
  await expect(b.page.getByText("Hello from the owner")).toBeVisible();

  // A ceremony both witches join, started in its own room.
  const [kind, def] = Object.entries(SHARED_EVENTS).find(([, e]) => !e.moonPhase)!;
  const room = LOCATIONS.find((l) => l.id === def.locationId)!;
  for (const p of [a.page, b.page]) {
    await p.getByRole("button", { name: /^World/ }).click();
    await p.getByRole("button", { name: `Go to ${room.name}` }).click();
  }
  await a.page.getByRole("button", { name: /gather the coven/i }).click();
  await b.page.getByRole("button", { name: /join the circle/i }).click();
  await a.page.getByRole("button", { name: /begin the ceremony/i }).click();
  await expect(a.page.getByText(new RegExp(`${def.name} is complete`))).toBeVisible();
  expect(kind).toBeTruthy();

  // State survives a reload.
  await b.page.reload();
  await expect(b.page.getByText(second.name).first()).toBeVisible();
  expect(a.errors).toEqual([]);
  expect(b.errors).toEqual([]);
});
