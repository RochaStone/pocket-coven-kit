import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type pg from "pg";
import { as, expectFail, freshDb, key, makeUser, rpc, serviceInvite } from "./harness";
import { TEST_WORLD } from "../fixtures/world.ts";

let pool: pg.Pool;
let ada: string, bea: string, cass: string;
const sql = (q: string, p: unknown[] = []) => pool.query(q, p);
const tea = TEST_WORLD.giftTreats.find((t) => t.id === "treat_tea")!;

beforeAll(async () => {
  pool = await freshDb();
  ada = await makeUser(pool, "ada@example.com");
  bea = await makeUser(pool, "bea@example.com");
  cass = await makeUser(pool, "cass@example.com");
  await rpc(pool, ada, "claim_invite", [await serviceInvite(pool, "ada")]);
  await rpc(pool, bea, "claim_invite", [await serviceInvite(pool, "bea")]);
  await rpc(pool, cass, "claim_invite", [await serviceInvite(pool, "cass")]);
});
afterAll(async () => pool?.end());

describe("gifts", () => {
  it("a treat costs the sender and nourishes the recipient when opened", async () => {
    const before = await rpc(pool, ada, "get_my_state");
    const sent = await rpc(pool, ada, "send_gift", ["bea", "treat", tea.id, null, "for my favourite chaos witch", key()]);
    expect(sent.state.coins).toBe(before.coins - tea.cost);
    expect((await rpc(pool, bea, "get_my_state")).unopened_gifts).toBe(1);
    const [gift] = await as(pool, bea, "select * from public.gifts where to_char = 'bea'");
    expect(gift.note).toBe("for my favourite chaos witch");
    await sql("update public.character_stats set joy = 50, social = 50 where character_id = 'bea'");
    const opened = await rpc(pool, bea, "open_gift", [gift.id]);
    expect(Number(opened.state.stats.joy)).toBe(50 + tea.effects.joy!);
    expect(Number(opened.state.stats.social)).toBe(60);
    expect(opened.state.unopened_gifts).toBe(0);
    expect((await rpc(pool, bea, "open_gift", [gift.id])).already_opened).toBe(true);
    await expectFail(rpc(pool, cass, "open_gift", [gift.id]), "not_found");
    expect(await as(pool, cass, "select * from public.gifts")).toHaveLength(0);
  });

  it("items move between witches; wearables and placed items cannot be gifted", async () => {
    await sql("select game.grant_item('ada', 'col_rosehip', 1)");
    await rpc(pool, ada, "send_gift", ["cass", "item", "col_rosehip", null, null, key()]);
    expect((await rpc(pool, ada, "get_my_state")).inventory.find((i: any) => i.item_id === "col_rosehip")).toBeUndefined();
    await expectFail(rpc(pool, ada, "send_gift", ["cass", "item", "col_rosehip", null, null, key()]), "none_left");
    await expectFail(rpc(pool, ada, "send_gift", ["cass", "item", "hat_pointed", null, null, key()]), "bad_gift");
    await rpc(pool, ada, "place_decoration", ["decor_candles", 0, 0]);
    await expectFail(rpc(pool, ada, "send_gift", ["cass", "item", "decor_candles", null, null, key()]), "none_left");
    const [g] = await as(pool, cass, "select id from public.gifts where to_char = 'cass' and ref = 'col_rosehip'");
    const d = await rpc(pool, cass, "open_gift", [g.id]);
    expect(d.state.inventory.find((i: any) => i.item_id === "col_rosehip")?.qty).toBe(1);
    await sql("select game.grant_item('ada', 'col_rosehip', 1)");
    expect((await rpc(pool, ada, "get_my_state")).inventory.find((i: any) => i.item_id === "col_rosehip")?.qty).toBe(1);
  });

  it("currency gifts are bounded, self-gifts refused, retries are idempotent, daily limit holds", async () => {
    await expectFail(rpc(pool, bea, "send_gift", ["bea", "coins", null, 5, null, key()]), "self_gift");
    await expectFail(rpc(pool, bea, "send_gift", ["ada", "coins", null, 500, null, key()]), "bad_gift");
    await expectFail(rpc(pool, bea, "send_gift", ["gwen", "coins", null, 5, null, key()]), "not_found");
    const k = key();
    const a = await rpc(pool, bea, "send_gift", ["ada", "coins", null, 5, null, k]);
    const b = await rpc(pool, bea, "send_gift", ["ada", "coins", null, 5, null, k]);
    expect(b.replayed).toBe(true);
    expect(b.state.coins).toBe(a.state.coins);
    const { rows } = await sql("select body from public.chat_messages where kind = 'system' order by id desc limit 1");
    expect(rows[0].body).toBe("Bea sent Ada a gift: 5 acorns.");
    await sql("update public.game_config set value = '2' where key = 'gift_daily_limit'");
    await rpc(pool, bea, "send_gift", ["ada", "coins", null, 1, null, key()]);
    await expectFail(rpc(pool, bea, "send_gift", ["ada", "coins", null, 1, null, key()]), "gift_limit");
    await sql("update public.game_config set value = '12' where key = 'gift_daily_limit'");
  });
});

describe("daily oracle", () => {
  it("draws one card per day and repeats it", async () => {
    await sql("update public.character_stats set magic = 40 where character_id = 'cass'");
    const a = await rpc(pool, cass, "draw_oracle");
    expect(a.new).toBe(true);
    expect(TEST_WORLD.oracleCards.map((c) => c.id)).toContain(a.card_id);
    expect(Number(a.state.stats.magic)).toBe(48);
    expect(a.state.oracle_today).toBe(a.card_id);
    const b = await rpc(pool, cass, "draw_oracle");
    expect(b.new).toBe(false);
    expect(b.card_id).toBe(a.card_id);
    expect(Number(b.state.stats.magic)).toBe(48);
  });
});

describe("coven goal", () => {
  it("fills from ordinary play and rewards every member once", async () => {
    const goal = await rpc(pool, ada, "get_coven_goal");
    expect(goal.target).toBeGreaterThan(0);
    // Force this week's goal to "nourish" with a small target, then eat and drink.
    await sql("update public.coven_goals set kind = 'nourish', target = 2, progress = 0, completed_at = null");
    const reward = TEST_WORLD.covenGoalReward;
    const before = (await sql("select character_id, coins from public.character_stats where character_id in ('bea','cass') order by character_id")).rows;
    await rpc(pool, bea, "perform_activity", ["cottage_herbal_tea", key()]);
    expect((await rpc(pool, cass, "get_coven_goal")).progress).toBe(1);
    await rpc(pool, cass, "perform_activity", ["hearth_stew", key()]);
    const done = await rpc(pool, cass, "get_coven_goal");
    expect(done.completed_at).not.toBeNull();
    const after = (await sql("select character_id, coins from public.character_stats where character_id in ('bea','cass') order by character_id")).rows;
    expect(after[0].coins).toBe(before[0].coins + reward.coins - 8);
    expect(after[1].coins).toBe(before[1].coins + reward.coins - 6);
    const charms = await sql("select count(*)::int as n from public.inventory where item_id = $1 and qty > 0", [reward.itemId]);
    expect(charms.rows[0].n).toBe(3);
    await sql("update public.activity_log set created_at = created_at - interval '1 hour'");
    await rpc(pool, bea, "perform_activity", ["cottage_herbal_tea", key()]);
    const charms2 = await sql("select sum(qty)::int as n from public.inventory where item_id = $1", [reward.itemId]);
    expect(charms2.rows[0].n).toBe(3);
  });
});

describe("moon ceremonies", () => {
  it("knows real full and new moons", async () => {
    const { rows } = await sql(`select game.moon_window('2024-01-25 17:54+00') as full_, game.moon_window('2024-01-11 11:57+00') as new_,
                                       game.moon_window('2024-01-18 03:52+00') as quarter`);
    expect(rows[0]).toEqual({ full_: "full", new_: "new", quarter: null });
  });
  it("only opens a moon ceremony in its window", async () => {
    const { rows } = await sql("select game.moon_window() as w");
    if (rows[0].w === "full") {
      expect((await rpc(pool, ada, "start_event", ["full_moon"])).kind).toBe("full_moon");
    } else {
      const e = await expectFail(rpc(pool, ada, "start_event", ["full_moon"]), "not_moon_time");
      expect(e.hint).toMatch(/full moon arrives in about \d+ days/);
    }
  });
  it("announces a moon once, naming the coven's own circle", async () => {
    await sql("update public.game_config set value = '\"UTC\"' where key = 'day_timezone'");
    await sql("select game.hourly_tick()");
    await sql("select game.hourly_tick()");
    const { rows } = await sql("select body from public.chat_messages where body like '%moon%' and kind = 'system' and character_id is null and body not like '%gathering%'");
    const { rows: w } = await sql("select game.moon_window() as w, extract(hour from now() at time zone 'UTC')::int as h");
    const expectAnnouncement = w[0].w !== null && w[0].h >= 9 && w[0].h <= 21;
    expect(rows.length).toBe(expectAnnouncement ? 1 : 0);
    if (expectAnnouncement) expect(rows[0].body).toContain("Toadstool Ring");
  });
});

describe("seasons", () => {
  it("seasonal items sell only in their month", async () => {
    const { rows } = await sql("select game.local_month() as m");
    const month = rows[0].m as number;
    const inSeason = month === 10 ? "decor_pumpkin" : month === 12 ? "decor_star_tree" : null;
    const outSeason = month === 12 ? "decor_pumpkin" : "decor_star_tree";
    await sql("update public.character_stats set coins = 500 where character_id = 'ada'");
    await expectFail(rpc(pool, ada, "buy_item", [outSeason, key()]), "out_of_season");
    if (inSeason) expect((await rpc(pool, ada, "buy_item", [inSeason, key()])).ok).toBe(true);
  });
});

describe("owner activity view", () => {
  it("is owner-only and reports everyone", async () => {
    await expectFail(rpc(pool, bea, "admin_activity_summary"), "not_admin");
    const s = await rpc(pool, ada, "admin_activity_summary");
    expect(s.map((x: any) => x.id)).toEqual(expect.arrayContaining(TEST_WORLD.characters.map((c) => c.id)));
    const b = s.find((x: any) => x.id === "bea");
    expect(b.actions_7d).toBeGreaterThan(0);
    expect(b.gifts_sent_7d).toBeGreaterThan(0);
  });
});

describe("familiar names", () => {
  it("a witch names a familiar she owns, friends see it, and junk names are refused", async () => {
    await sql("select game.grant_item('bea', 'fam_fox', 1)");
    const named = await rpc(pool, bea, "name_pet", ["fam_fox", "  Biscuit  "]);
    expect(named.character.pet_names).toEqual({ fam_fox: "Biscuit" });
    const visit = await rpc(pool, cass, "visit_room", ["bea"]);
    expect(visit.host.character.pet_names.fam_fox).toBe("Biscuit");
    await expectFail(rpc(pool, bea, "name_pet", ["fam_fox", "<script>"]), "bad_name");
    await expectFail(rpc(pool, bea, "name_pet", ["fam_fox", "x".repeat(17)]), "bad_name");
    await expectFail(rpc(pool, bea, "name_pet", ["outfit_pinafore", "Denim"]), "bad_pet");
    await expectFail(rpc(pool, cass, "name_pet", ["fam_fox", "Stolen"]), "not_owned");
    const cleared = await rpc(pool, bea, "name_pet", ["fam_fox", ""]);
    expect(cleared.character.pet_names).toEqual({});
  });

  it("pigtails is a hairstyle the server accepts", async () => {
    const s = await rpc(pool, cass, "set_look", [{ hairStyle: "pigtails" }]);
    expect(s.character.look.hairStyle).toBe("pigtails");
  });
});

describe("family accounts", () => {
  it("one family invite claims a grown-up and a young witch, and the login switches between them", async () => {
    const parent = await makeUser(pool, "family@example.com");
    const token = await serviceInvite(pool, "eve");
    await sql("update public.invitations set bundle = '{dot}' where character_id = 'eve' and claimed_at is null");
    const peek = await rpc(pool, parent, "peek_invite", [token]);
    expect(peek.valid).toBe(true);
    expect(peek.bundle.map((b: any) => b.name)).toEqual(["Dot"]);

    const claimed = await rpc(pool, parent, "claim_invite", [token]);
    expect(claimed.character.id).toBe("eve");
    expect(claimed.family.map((f: any) => f.id).sort()).toEqual(["dot", "eve"]);
    expect((await rpc(pool, parent, "get_my_state")).character.id).toBe("eve");

    const dot = await rpc(pool, parent, "switch_character", ["dot"]);
    expect(dot.character.id).toBe("dot");
    expect(dot.character.young).toBe(true);
    expect((await rpc(pool, parent, "get_my_state")).character.id).toBe("dot");
    const named = await rpc(pool, parent, "name_pet", ["fam_rabbit", "Clover"]);
    expect(named.character.id).toBe("dot");
    await expectFail(rpc(pool, parent, "perform_activity", ["hearth_elderflower_toast", key()]), "adult_only");

    await expectFail(rpc(pool, parent, "switch_character", ["ada"]), "not_yours");
    await expectFail(rpc(pool, bea, "switch_character", ["dot"]), "not_yours");
    const stranger = await makeUser(pool, "stranger2@example.com");
    expect((await rpc(pool, stranger, "peek_invite", [token])).valid).toBe(false);
    await expectFail(rpc(pool, stranger, "claim_invite", [token]), "invite_used");
    await expectFail(rpc(pool, parent, "claim_invite", [await serviceInvite(pool, "gwen")]), "already_has_character");
  });

  it("releasing one witch from a family login keeps the grown-up in the coven", async () => {
    const parent = await makeUser(pool, "family-release@example.com");
    const token = await serviceInvite(pool, "fay");
    await sql("update public.invitations set bundle = '{gwen}' where character_id = 'fay' and claimed_at is null");
    await rpc(pool, parent, "claim_invite", [token]);
    await rpc(pool, ada, "admin_release_character", ["gwen"]);
    const { rows } = await sql("select count(*)::int n from public.coven_members where user_id = $1", [parent]);
    expect(rows[0].n).toBe(1);
    expect((await rpc(pool, parent, "get_my_state")).family.map((f: any) => f.id)).toEqual(["fay"]);
    await rpc(pool, ada, "admin_release_character", ["fay"]);
    const after = await sql("select count(*)::int n from public.coven_members where user_id = $1", [parent]);
    expect(after.rows[0].n).toBe(0);
  });
});
