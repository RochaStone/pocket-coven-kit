import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { as, expectFail, freshDb, key, makeUser, rpc, seedSql, serviceInvite } from "./harness";
import { moodFromStats, projectStats } from "@/lib/game/logic.ts";
import type { Stats } from "@/lib/game/types.ts";
import { TEST_WORLD, item } from "../fixtures/world.ts";

// Every witch here is fictional: Ada (owner), Bea (they/them), Cass, Dot (a young witch), Eve, Fay, Gwen.
let pool: pg.Pool;
let ada: string, bea: string, cass: string, stranger: string;
const STARTING = TEST_WORLD.gameConfig.starting_coins;

beforeAll(async () => {
  pool = await freshDb();
  ada = await makeUser(pool, "ada@example.com");
  bea = await makeUser(pool, "bea@example.com");
  cass = await makeUser(pool, "cass@example.com");
  stranger = await makeUser(pool, "stranger@example.com");
});
afterAll(async () => pool?.end());

const statsOf = (s: any): Stats => ({
  nourishment: Number(s.stats.nourishment), energy: Number(s.stats.energy), joy: Number(s.stats.joy),
  magic: Number(s.stats.magic), social: Number(s.stats.social),
});
const superSql = (sql: string, params: unknown[] = []) => pool.query(sql, params);

describe("seed", () => {
  it("creates every witch from the world, unclaimed, with starter wardrobes", async () => {
    const { rows } = await superSql("select id, owner_user_id from public.characters order by id");
    expect(rows.map((r) => r.id)).toEqual(TEST_WORLD.characters.map((c) => c.id).sort());
    expect(rows.every((r) => r.owner_user_id === null)).toBe(true);
    const inv = await superSql("select count(*)::int as n from public.inventory where character_id = 'bea'");
    expect(inv.rows[0].n).toBeGreaterThan(4);
  });
  it("seed is re-runnable without resetting witches", async () => {
    await superSql("update public.character_stats set coins = 999 where character_id = 'eve'");
    await superSql(seedSql());
    const { rows } = await superSql("select coins from public.character_stats where character_id = 'eve'");
    expect(rows[0].coins).toBe(999);
    await superSql("select game.init_character('eve')");
  });
  it("activities that leave the world are switched off, not deleted", async () => {
    await superSql("insert into public.activities (id, location_id, name, animation) values ('ghost_activity', 'cottage', 'Ghost', 'sleep')");
    await superSql(seedSql());
    const { rows } = await superSql("select active from public.activities where id = 'ghost_activity'");
    expect(rows[0].active).toBe(false);
  });
});

describe("invitations and ownership", () => {
  it("anonymous visitors can peek an invite but not claim it", async () => {
    const token = await serviceInvite(pool, "ada");
    const peek = await rpc(pool, null, "peek_invite", [token]);
    expect(peek).toMatchObject({ valid: true, character_id: "ada", name: "Ada" });
    await expectFail(rpc(pool, null, "claim_invite", [token]), "permission denied");
    const state = await rpc(pool, ada, "claim_invite", [token]);
    expect(state.character.id).toBe("ada");
    expect(state.is_admin).toBe(true);
    expect((await rpc(pool, null, "peek_invite", [token])).valid).toBe(false);
    const { rows } = await superSql("select body from public.chat_messages where kind = 'system' order by id desc limit 1");
    expect(rows[0].body).toBe("Ada has joined the coven. Another chair at the hearth.");
  });

  it("admin mints an invite; it can be claimed exactly once", async () => {
    const inv = await rpc(pool, ada, "admin_create_invite", ["bea", 7]);
    expect(inv.token).toMatch(/^[0-9a-f]{48}$/);
    const stored = await superSql("select token_hash from public.invitations where id = $1", [inv.id]);
    expect(stored.rows[0].token_hash).not.toBe(inv.token);
    const state = await rpc(pool, bea, "claim_invite", [inv.token]);
    expect(state.character).toMatchObject({ id: "bea", pronouns: { subject: "they", object: "them", plural: true } });
    expect(state.is_admin).toBe(false);
    await expectFail(rpc(pool, stranger, "claim_invite", [inv.token]), "invite_used");
    expect((await rpc(pool, bea, "claim_invite", [inv.token])).character.id).toBe("bea");
  });

  it("one witch per account, no claiming without a valid invite", async () => {
    const inv = await rpc(pool, ada, "admin_create_invite", ["cass", 7]);
    await expectFail(rpc(pool, bea, "claim_invite", [inv.token]), "already_has_character");
    await expectFail(rpc(pool, stranger, "claim_invite", ["deadbeef".repeat(6)]), "invite_invalid");
    await expectFail(as(pool, stranger, "update public.characters set owner_user_id = auth.uid() where id = 'eve'"), "permission denied");
    await expectFail(as(pool, stranger, "insert into public.currency_ledger (character_id, delta, balance_after, reason) values ('eve', 1000, 1000, 'x')"), "permission denied");
    await rpc(pool, cass, "claim_invite", [inv.token]);
  });

  it("revoked and expired invites are refused; minting a new invite revokes the old one", async () => {
    const a = await rpc(pool, ada, "admin_create_invite", ["dot", 7]);
    const b = await rpc(pool, ada, "admin_create_invite", ["dot", 7]);
    await expectFail(rpc(pool, stranger, "claim_invite", [a.token]), "invite_revoked");
    await rpc(pool, ada, "admin_revoke_invite", [b.id]);
    await expectFail(rpc(pool, stranger, "claim_invite", [b.token]), "invite_revoked");
    const expired = await serviceInvite(pool, "dot");
    await superSql("update public.invitations set expires_at = now() - interval '1 minute' where revoked_at is null and claimed_at is null and character_id = 'dot'");
    await expectFail(rpc(pool, stranger, "claim_invite", [expired]), "invite_expired");
  });

  it("non-owners cannot use admin powers or see invitations", async () => {
    await expectFail(rpc(pool, bea, "admin_create_invite", ["eve", 7]), "not_admin");
    await expectFail(rpc(pool, bea, "admin_reset_character", ["ada"]), "not_admin");
    expect(await as(pool, bea, "select * from public.invitations")).toHaveLength(0);
    expect((await as(pool, ada, "select * from public.invitations")).length).toBeGreaterThan(0);
  });

  it("strangers without a witch see nothing of the coven", async () => {
    expect(await as(pool, stranger, "select * from public.characters")).toHaveLength(0);
    expect(await as(pool, stranger, "select * from public.chat_messages")).toHaveLength(0);
    expect(await as(pool, stranger, "select * from public.character_stats")).toHaveLength(0);
    await expectFail(rpc(pool, stranger, "get_my_state"), "no_character");
    expect((await as(pool, bea, "select id from public.characters")).length).toBe(TEST_WORLD.characters.length);
  });
});

describe("tamagotchi engine", () => {
  it("activities change stats and currency, and are idempotent on retry", async () => {
    await superSql("update public.character_stats set energy = 50, nourishment = 50 where character_id = 'ada'");
    const before = await rpc(pool, ada, "get_my_state");
    const k = key();
    const r = await rpc(pool, ada, "perform_activity", ["apothecary_market_stall", k]);
    expect(r.ok).toBe(true);
    expect(r.state.coins).toBe(before.coins + 25);
    expect(Number(r.state.stats.energy)).toBe(Number(before.stats.energy) - 20);
    const replay = await rpc(pool, ada, "perform_activity", ["apothecary_market_stall", k]);
    expect(replay.replayed).toBe(true);
    expect(replay.state.coins).toBe(r.state.coins);
    const ledger = await superSql("select count(*)::int as n from public.currency_ledger where character_id = 'ada' and reason = 'activity'");
    expect(ledger.rows[0].n).toBe(1);
    expect(r.state.achievements).toContain("first_care");
  });

  it("enforces cooldowns", async () => {
    const e = await expectFail(rpc(pool, ada, "perform_activity", ["apothecary_market_stall", key()]), "cooldown");
    expect(e.hint).toMatch(/Ready again/);
  });

  it("stat costs cannot go below zero", async () => {
    await superSql("update public.character_stats set energy = 5 where character_id = 'bea'");
    await expectFail(rpc(pool, bea, "perform_activity", ["apothecary_market_stall", key()]), "too_tired");
    const nap = await rpc(pool, bea, "perform_activity", ["cottage_nap", key()]);
    expect(Number(nap.state.stats.energy)).toBe(40);
  });

  it("young witches never get adults-only activities; grown witches do", async () => {
    const dot = await makeUser(pool, "dot@example.com");
    await rpc(pool, dot, "claim_invite", [await serviceInvite(pool, "dot")]);
    await expectFail(rpc(pool, dot, "perform_activity", ["hearth_elderflower_toast", key()]), "adult_only");
    const r = await rpc(pool, bea, "perform_activity", ["hearth_elderflower_toast", key()]);
    expect(r.ok).toBe(true);
  });

  it("unknown or retired activities are refused", async () => {
    await expectFail(rpc(pool, bea, "perform_activity", ["ghost_activity", key()]), "unknown_activity");
  });

  it("stats stay in 0..100", async () => {
    await superSql("update public.character_stats set nourishment = 95 where character_id = 'bea'");
    const r = await rpc(pool, bea, "perform_activity", ["hearth_stew", key()]);
    expect(Number(r.state.stats.nourishment)).toBe(100);
  });

  it("needs decay with time, floor out (no death) and the witch sulks", async () => {
    await superSql("update public.character_stats set nourishment=80, energy=80, joy=80, magic=80, social=80, updated_at = now() - interval '10 hours' where character_id = 'cass'");
    const s10 = await rpc(pool, cass, "get_my_state");
    expect(statsOf(s10)).toEqual({ nourishment: 40, energy: 50, joy: 50, magic: 60, social: 50 });
    await superSql("update public.character_stats set updated_at = now() - interval '500 hours' where character_id = 'cass'");
    const sLong = await rpc(pool, cass, "get_my_state");
    for (const v of Object.values(statsOf(sLong))) expect(v).toBe(10);
    expect(sLong.mood).toBe("offended");
    const fed = await rpc(pool, cass, "perform_activity", ["hearth_stew", key()]);
    expect(Number(fed.state.stats.nourishment)).toBe(40);
  });

  it("decay ignores sub-3-minute windows so frequent reads never lose decay", async () => {
    await superSql("update public.character_stats set joy = 60, updated_at = now() - interval '1 minute' where character_id = 'cass'");
    const s = await rpc(pool, cass, "get_my_state");
    expect(Number(s.stats.joy)).toBe(60);
    const { rows } = await superSql("select updated_at < now() - interval '50 seconds' as kept from public.character_stats where character_id = 'cass'");
    expect(rows[0].kept).toBe(true);
  });

  it("daily reward claims once per day", async () => {
    const a = await rpc(pool, bea, "claim_daily");
    expect(a.ok).toBe(true);
    expect(a.loot).toHaveLength(1);
    const b = await rpc(pool, bea, "claim_daily");
    expect(b.already_claimed).toBe(true);
    expect(b.state.coins).toBe(a.state.coins);
  });

  it("friends at the same place lift social", async () => {
    await rpc(pool, cass, "set_location", ["ring"]);
    await superSql("update public.character_stats set energy = 90, social = 40 where character_id = 'bea'");
    const r = await rpc(pool, bea, "perform_activity", ["ring_moon_bath", key()]);
    expect(r.friends).toContain("Cass");
    expect(Number(r.effects.social)).toBe(5);
  });
});

describe("economy, wardrobe and rooms", () => {
  it("buying debits the currency; found-only items are not for sale; balance cannot go negative", async () => {
    const s = await rpc(pool, bea, "get_my_state");
    const r = await rpc(pool, bea, "buy_item", ["hat_pointed", key()]);
    expect(r.state.coins).toBe(s.coins - item("hat_pointed").price!);
    await expectFail(rpc(pool, bea, "buy_item", ["hat_pointed", key()]), "already_owned");
    await expectFail(rpc(pool, bea, "buy_item", ["col_old_iron_key", key()]), "not_for_sale");
    await superSql("update public.character_stats set coins = 10 where character_id = 'bea'");
    const e = await expectFail(rpc(pool, bea, "buy_item", ["outfit_gown", key()]), "not_enough_coins");
    expect(e.hint).toMatch(/acorns/);
    const { rows } = await superSql("select coins from public.character_stats where character_id = 'bea'");
    expect(rows[0].coins).toBe(10);
  });

  it("equipping requires ownership and the right slot, and changes the visible avatar state", async () => {
    await expectFail(rpc(pool, bea, "equip_item", ["outfit", "outfit_gown"]), "not_owned");
    await expectFail(rpc(pool, bea, "equip_item", ["boots", "hat_pointed"]), "bad_slot");
    const r = await rpc(pool, bea, "equip_item", ["hat", "hat_pointed"]);
    expect(r.state.equipment.hat).toBe("hat_pointed");
    const off = await rpc(pool, bea, "equip_item", ["hat", null]);
    expect(off.state.equipment.hat).toBeUndefined();
  });

  it("look edits are validated, including the familiar's colour and accessory", async () => {
    await expectFail(rpc(pool, bea, "set_look", [JSON.stringify({ skin: "red; drop table" })]), "bad_look");
    await expectFail(rpc(pool, bea, "set_look", [JSON.stringify({ familiarColour: "neon" })]), "bad_look");
    await expectFail(rpc(pool, bea, "set_look", [JSON.stringify({ familiarAcc: "crown" })]), "bad_look");
    const s = await rpc(pool, bea, "set_look", [JSON.stringify({ hairStyle: "pixie", hairColor: "#123ABC", familiarColour: "moss", familiarAcc: "bow", freckles: true })]);
    expect(s.character.look).toMatchObject({ hairStyle: "pixie", hairColor: "#123abc", familiarColour: "moss", familiarAcc: "bow", freckles: true });
  });

  it("room decorations respect ownership, cells and privacy", async () => {
    const r = await rpc(pool, bea, "place_decoration", ["furn_armchair", 0, 0]);
    expect(r.state.decorations).toHaveLength(1);
    await expectFail(rpc(pool, bea, "place_decoration", ["decor_plant", 0, 0]), "cell_taken");
    await expectFail(rpc(pool, bea, "place_decoration", ["furn_armchair", 1, 0]), "none_left");
    await expectFail(rpc(pool, bea, "place_decoration", ["furn_cauldron", 2, 0]), "none_left");
    await expectFail(rpc(pool, bea, "place_decoration", ["hat_pointed", 2, 0]), "not_placeable");
    expect(await as(pool, cass, "select * from public.room_decorations where character_id = 'bea'")).toHaveLength(1);
    const visit = await rpc(pool, cass, "visit_room", ["bea"]);
    expect(visit.first_visit_today).toBe(true);
    expect((await rpc(pool, cass, "visit_room", ["bea"])).first_visit_today).toBe(false);
    await rpc(pool, bea, "set_room_style", ["stars", "rug", "private"]);
    expect(await as(pool, cass, "select * from public.room_decorations where character_id = 'bea'")).toHaveLength(0);
    await expectFail(rpc(pool, cass, "visit_room", ["bea"]), "room_private");
    expect(await as(pool, bea, "select * from public.room_decorations where character_id = 'bea'")).toHaveLength(1);
    await expectFail(rpc(pool, bea, "set_room_style", ["glitter_bomb", null, null]), "bad_style");
  });

  it("pronoun edits are validated and saved", async () => {
    await expectFail(rpc(pool, cass, "update_my_profile", [null, null, JSON.stringify({ subject: "<b>", object: "x", possessive: "x", plural: true })]), "bad_pronouns");
    const s = await rpc(pool, cass, "update_my_profile", ["Herb witch", "Calm, then chaotic", JSON.stringify({ subject: "he", object: "him", possessive: "his", plural: false })]);
    expect(s.character.pronouns).toEqual({ subject: "he", object: "him", possessive: "his", plural: false });
    expect(s.character.personality).toBe("Calm, then chaotic");
  });

  it("a witch can choose her own name; junk names are refused", async () => {
    await expectFail(rpc(pool, bea, "rename_witch", ["<script>"]), "bad_name");
    await expectFail(rpc(pool, bea, "rename_witch", ["x".repeat(25)]), "bad_name");
    const s = await rpc(pool, bea, "rename_witch", ["  Bea   Moonwhistle "]);
    expect(s.character.name).toBe("Bea Moonwhistle");
    expect(s.character.id).toBe("bea");
  });
});

describe("chat and ceremonies", () => {
  it("chat syncs to coven members, is rate limited and stickers are whitelisted", async () => {
    const m = await rpc(pool, bea, "send_chat", ["text", "  <img src=x onerror=alert(1)> hi\u0007  "]);
    expect(m.body).toBe("<img src=x onerror=alert(1)> hi");
    await rpc(pool, bea, "send_chat", ["sticker", "cauldron"]);
    await expectFail(rpc(pool, bea, "send_chat", ["sticker", "nope"]), "bad_sticker");
    await expectFail(rpc(pool, bea, "send_chat", ["text", "x".repeat(281)]), "too_long");
    for (let i = 0; i < 3; i++) await rpc(pool, bea, "send_chat", ["text", `msg ${i}`]);
    await expectFail(rpc(pool, bea, "send_chat", ["text", "one too many"]), "slow_down");
    expect((await as(pool, cass, "select body from public.chat_messages where character_id = 'bea'")).length).toBe(5);
    expect(await as(pool, stranger, "select body from public.chat_messages")).toHaveLength(0);
  });

  it("admin moderation hides messages", async () => {
    const [msg] = await as(pool, ada, "select id from public.chat_messages where character_id = 'bea' order by id limit 1");
    await expectFail(rpc(pool, cass, "admin_delete_chat", [msg.id]), "not_admin");
    await rpc(pool, ada, "admin_delete_chat", [msg.id]);
    expect(await as(pool, cass, "select * from public.chat_messages where id = $1", [msg.id])).toHaveLength(0);
  });

  it("a ceremony needs two witches, only the host begins it, and everyone is rewarded", async () => {
    const def = TEST_WORLD.sharedEvents.hedgerow_circle;
    await superSql("update public.character_stats set magic = 40 where character_id in ('ada','cass')");
    const ev = await rpc(pool, ada, "start_event", ["hedgerow_circle"]);
    expect(ev.status).toBe("gathering");
    expect((await rpc(pool, ada, "start_event", ["hedgerow_circle"])).id).toBe(ev.id);
    await expectFail(rpc(pool, ada, "start_event", ["not_a_ceremony"]), "bad_event");
    await expectFail(rpc(pool, ada, "complete_event", [ev.id]), "need_more_witches");
    await rpc(pool, cass, "join_event", [ev.id]);
    await expectFail(rpc(pool, cass, "complete_event", [ev.id]), "not_host");
    const before = (await superSql("select character_id, coins from public.character_stats where character_id in ('ada','cass') order by character_id")).rows;
    const done = await rpc(pool, ada, "complete_event", [ev.id]);
    expect(done.ok).toBe(true);
    const after = (await superSql("select character_id, coins from public.character_stats where character_id in ('ada','cass') order by character_id")).rows;
    expect(after[0].coins).toBe(before[0].coins + def.coins);
    expect(after[1].coins).toBe(before[1].coins + def.coins);
    const loot = await superSql("select count(*)::int as n from public.inventory where item_id = $1 and character_id in ('ada','cass')", [def.lootItemId]);
    expect(loot.rows[0].n).toBe(2);
    const ach = await superSql("select count(*)::int as n from public.character_achievements where achievement_id = 'coven_ritual'");
    expect(ach.rows[0].n).toBe(2);
    const { rows } = await superSql("select body from public.chat_messages where kind = 'system' order by id desc limit 1");
    expect(rows[0].body).toBe("The Hedgerow Circle is complete: Ada, Cass. The hedge rustled its approval.");
    await expectFail(rpc(pool, cass, "join_event", [ev.id]), "event_closed");
  });

  it("admin reset restores a witch without unclaiming", async () => {
    await rpc(pool, ada, "admin_reset_character", ["bea"]);
    const s = await rpc(pool, bea, "get_my_state");
    expect(s.coins).toBe(STARTING);
    expect(s.decorations).toHaveLength(0);
    expect(s.character.id).toBe("bea");
  });
});

describe("client mirrors agree with the database", () => {
  const fixtures: Stats[] = [
    { nourishment: 70, energy: 70, joy: 70, magic: 70, social: 70 },
    { nourishment: 90, energy: 90, joy: 90, magic: 90, social: 90 },
    { nourishment: 85, energy: 85, joy: 80, magic: 70, social: 85 },
    { nourishment: 20, energy: 70, joy: 70, magic: 70, social: 70 },
    { nourishment: 70, energy: 20, joy: 70, magic: 70, social: 70 },
    { nourishment: 70, energy: 70, joy: 30, magic: 70, social: 70 },
    { nourishment: 70, energy: 70, joy: 70, magic: 70, social: 25 },
    { nourishment: 10, energy: 10, joy: 10, magic: 10, social: 10 },
    { nourishment: 60, energy: 60, joy: 60, magic: 90, social: 60 },
    { nourishment: 15, energy: 90, joy: 90, magic: 90, social: 90 },
  ];
  it("mood", async () => {
    for (const f of fixtures) {
      const { rows } = await superSql("select game.mood($1,$2,$3,$4,$5) as m", [f.nourishment, f.energy, f.joy, f.magic, f.social]);
      expect(rows[0].m).toBe(moodFromStats(f));
    }
  });
  it("decay projection", async () => {
    const cfg = TEST_WORLD.gameConfig;
    const now = new Date();
    for (const hours of [0.5, 3, 12, 100]) {
      await superSql("update public.character_stats set nourishment=73, energy=55, joy=12, magic=99, social=40, updated_at = now() - make_interval(secs => $1) where character_id = 'eve'", [hours * 3600]);
      await superSql("select game.apply_decay('eve')");
      const { rows } = await superSql("select nourishment, energy, joy, magic, social from public.character_stats where character_id = 'eve'");
      const db = Object.fromEntries(Object.entries(rows[0]).map(([k, v]) => [k, Number(v)]));
      const updatedAt = new Date(now.getTime() - hours * 3600_000);
      const ts = projectStats({ nourishment: 73, energy: 55, joy: 12, magic: 99, social: 40 }, updatedAt, now, cfg);
      for (const k of Object.keys(ts) as (keyof Stats)[]) expect(Math.abs(ts[k] - db[k])).toBeLessThan(0.05);
    }
  });
});
