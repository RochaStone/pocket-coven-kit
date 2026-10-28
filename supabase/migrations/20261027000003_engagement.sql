-- Engagement layer: gifts, the daily oracle, weekly coven goals, moon announcements and the owner's activity view.
-- Written without row deletes: things are marked (opened_at, qty 0) rather than removed.

-- ───────────────────────── coven goals ─────────────────────────

create or replace function game.current_goal(p_coven uuid) returns public.coven_goals
language plpgsql set search_path = public, game, pg_temp as $$
declare g public.coven_goals; wk date := date_trunc('week', game.today())::date; defs jsonb := game.cfg('coven_goals'); def jsonb;
begin
  select * into g from public.coven_goals where coven_id = p_coven and week_start = wk;
  if found then return g; end if;
  def := defs -> (mod(extract(week from wk)::int, jsonb_array_length(defs)));
  insert into public.coven_goals (coven_id, week_start, kind, target)
  values (p_coven, wk, def ->> 'kind', (def ->> 'target')::int)
  on conflict (coven_id, week_start) do nothing;
  select * into g from public.coven_goals where coven_id = p_coven and week_start = wk;
  return g;
end $$;

create or replace function game.bump_goal(p_coven uuid, p_kind text, p_n int) returns void
language plpgsql set search_path = public, game, pg_temp as $$
declare g public.coven_goals; reward jsonb := game.cfg('coven_goal_reward'); def jsonb; c record; charm text;
begin
  g := game.current_goal(p_coven);
  if g.kind <> p_kind or g.completed_at is not null then return; end if;
  update public.coven_goals set progress = progress + p_n
  where coven_id = p_coven and week_start = g.week_start returning * into g;
  if g.progress >= g.target then
    update public.coven_goals set completed_at = now() where coven_id = p_coven and week_start = g.week_start;
    select d into def from jsonb_array_elements(game.cfg('coven_goals')) d where d ->> 'kind' = g.kind;
    for c in select id from public.characters where coven_id = p_coven and owner_user_id is not null loop
      perform game.credit(c.id, (reward ->> 'coins')::int, 'coven_goal', g.week_start::text);
      perform game.grant_item(c.id, reward ->> 'itemId', 1);
    end loop;
    select name into charm from public.items where id = reward ->> 'itemId';
    perform game.system_message(p_coven, 'The coven completed ' || (def ->> 'name') || '. ' || initcap(game.currency())
      || ' and a ' || coalesce(charm, 'charm') || ' for everyone.');
  end if;
end $$;

-- Goals fill from what already happens in the game, via triggers (no engine rewrites needed).
create or replace function game.on_activity_logged() returns trigger
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare coven uuid := game.coven_of(new.character_id); cat text;
begin
  select category into cat from public.activities where id = new.activity_id;
  if cat is not null then perform game.bump_goal(coven, cat, 1); end if;
  perform game.bump_goal(coven, 'activities', 1);
  return new;
end $$;
create trigger activity_goal after insert on public.activity_log for each row execute function game.on_activity_logged();

create or replace function game.on_event_completed() returns trigger
language plpgsql security definer set search_path = public, game, pg_temp as $$
begin
  if new.status = 'complete' and old.status is distinct from 'complete' then
    perform game.bump_goal(new.coven_id, 'rituals', 1);
  end if;
  return new;
end $$;
create trigger event_goal after update on public.shared_events for each row execute function game.on_event_completed();

create or replace function public.get_coven_goal() returns jsonb
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare v text := game.require_character(); g public.coven_goals; def jsonb;
begin
  g := game.current_goal(game.coven_of(v));
  select d into def from jsonb_array_elements(game.cfg('coven_goals')) d where d ->> 'kind' = g.kind;
  return to_jsonb(g) || jsonb_build_object('name', def ->> 'name', 'description', def ->> 'description',
    'ends_at', (g.week_start + 7)::text, 'reward', game.cfg('coven_goal_reward'));
end $$;

-- ───────────────────────── gifts ─────────────────────────

create or replace function public.send_gift(p_to text, p_kind text, p_ref text, p_coins int, p_note text, p_key text) returns jsonb
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare
  v text := game.require_character();
  coven uuid := game.coven_of(v);
  prior jsonb;
  treat jsonb;
  it public.items;
  owned int;
  placed int;
  sent_today int;
  from_name text;
  to_name text;
  what text;
  g public.gifts;
  ach text[];
  r jsonb;
  note text := nullif(btrim(regexp_replace(coalesce(p_note, ''), '[[:cntrl:]]', ' ', 'g')), '');
begin
  select result into prior from public.action_receipts where character_id = v and key = p_key;
  if found then return prior || jsonb_build_object('replayed', true, 'state', game.state(v)); end if;
  if p_to = v then perform game.fail('self_gift', 'Gifts are for other witches.'); end if;
  if game.coven_of(p_to) is distinct from coven or not exists (select 1 from public.characters where id = p_to and owner_user_id is not null) then
    perform game.fail('not_found', 'That witch has not joined the coven yet.');
  end if;
  if char_length(coalesce(note, '')) > 140 then perform game.fail('too_long', 'Keep the note under 140 characters.'); end if;
  perform 1 from public.character_stats where character_id = v for update;
  select count(*) into sent_today from public.gifts where from_char = v and created_at > now() - interval '1 day';
  if sent_today >= (game.cfg('gift_daily_limit'))::int then
    perform game.fail('gift_limit', 'No more gifts today. More tomorrow.');
  end if;
  select name into from_name from public.characters where id = v;
  select name into to_name from public.characters where id = p_to;

  if p_kind = 'treat' then
    select t into treat from jsonb_array_elements(game.cfg('gift_treats')) t where t ->> 'id' = p_ref;
    if treat is null then perform game.fail('bad_gift', 'Unknown treat.'); end if;
    perform game.credit(v, -(treat ->> 'cost')::int, 'gift', p_ref);
    what := lower(treat ->> 'name');
  elsif p_kind = 'coins' then
    if p_coins is null or p_coins not between 1 and 100 then perform game.fail('bad_gift', 'Send between 1 and 100 ' || game.currency() || '.'); end if;
    perform game.credit(v, -p_coins, 'gift', p_to);
    what := p_coins || ' ' || game.currency();
  elsif p_kind = 'item' then
    select * into it from public.items where id = p_ref;
    if not found or it.slot is not null then perform game.fail('bad_gift', 'Only treasures and decor can be gifted.'); end if;
    select coalesce(qty, 0) into owned from public.inventory where character_id = v and item_id = p_ref for update;
    select count(*) into placed from public.room_decorations where character_id = v and item_id = p_ref;
    if coalesce(owned, 0) - placed < 1 then perform game.fail('none_left', 'Take it out of your room first, or find another.'); end if;
    update public.inventory set qty = qty - 1 where character_id = v and item_id = p_ref;
    what := it.name;
  else
    perform game.fail('bad_gift', 'Unknown gift.');
  end if;

  insert into public.gifts (coven_id, from_char, to_char, kind, ref, coins, note)
  values (coven, v, p_to, p_kind, case when p_kind = 'coins' then null else p_ref end, case when p_kind = 'coins' then p_coins end, note)
  returning * into g;
  perform game.bump_goal(coven, 'gifts', 1);
  perform game.system_message(coven, from_name || ' sent ' || to_name || ' a gift: ' || what || '.');
  ach := game.check_achievements(v);
  r := jsonb_build_object('ok', true, 'gift_id', g.id, 'achievements', to_jsonb(ach));
  insert into public.action_receipts (character_id, key, result) values (v, p_key, r);
  return r || jsonb_build_object('state', game.state(v));
end $$;

create or replace function public.open_gift(p_id bigint) returns jsonb
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare v text := game.require_character(); g public.gifts; treat jsonb; ach text[];
begin
  select * into g from public.gifts where id = p_id and to_char = v for update;
  if not found then perform game.fail('not_found', 'That gift is not addressed to you.'); end if;
  if g.opened_at is not null then
    return jsonb_build_object('ok', true, 'already_opened', true, 'gift', to_jsonb(g), 'state', game.state(v));
  end if;
  perform game.apply_decay(v);
  if g.kind = 'treat' then
    select t into treat from jsonb_array_elements(game.cfg('gift_treats')) t where t ->> 'id' = g.ref;
    perform game.apply_effects(v, coalesce(treat -> 'effects', '{}'::jsonb));
  elsif g.kind = 'coins' then
    perform game.credit(v, g.coins, 'gift_received', g.id::text);
  elsif g.kind = 'item' then
    perform game.grant_item(v, g.ref, 1);
  end if;
  perform game.apply_effects(v, jsonb_build_object('social', 10));
  update public.gifts set opened_at = now() where id = g.id returning * into g;
  ach := game.check_achievements(v);
  return jsonb_build_object('ok', true, 'gift', to_jsonb(g), 'effects', treat -> 'effects', 'achievements', to_jsonb(ach), 'state', game.state(v));
end $$;

-- ───────────────────────── daily oracle ─────────────────────────

create or replace function public.draw_oracle() returns jsonb
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare v text := game.require_character(); deck jsonb := game.cfg('oracle_cards'); card text; existing text; ach text[];
begin
  perform 1 from public.character_stats where character_id = v for update;
  select card_id into existing from public.daily_oracle where character_id = v and day = game.today();
  if existing is not null then
    return jsonb_build_object('ok', true, 'card_id', existing, 'new', false, 'state', game.state(v));
  end if;
  card := deck ->> floor(random() * jsonb_array_length(deck))::int;
  insert into public.daily_oracle (character_id, day, card_id) values (v, game.today(), card);
  perform game.apply_decay(v);
  perform game.apply_effects(v, '{"magic": 8, "joy": 4}'::jsonb);
  ach := game.check_achievements(v);
  return jsonb_build_object('ok', true, 'card_id', card, 'new', true, 'achievements', to_jsonb(ach), 'state', game.state(v));
end $$;

-- ───────────────────────── owner activity view ─────────────────────────

create or replace function public.admin_activity_summary() returns jsonb
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare coven uuid := game.admin_coven(); tz text := coalesce(game.cfg('day_timezone') #>> '{}', 'UTC');
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id', c.id, 'name', c.name, 'claimed', c.owner_user_id is not null,
      'last_seen', st.last_seen_at,
      'actions_today', (select count(*) from public.activity_log l where l.character_id = c.id and l.created_at > now() - interval '1 day'),
      'actions_7d', (select count(*) from public.activity_log l where l.character_id = c.id and l.created_at > now() - interval '7 days'),
      'days_active_7d', (select count(distinct (l.created_at at time zone tz)::date) from public.activity_log l
                         where l.character_id = c.id and l.created_at > now() - interval '7 days'),
      'chats_7d', (select count(*) from public.chat_messages m where m.character_id = c.id and m.created_at > now() - interval '7 days'),
      'gifts_sent_7d', (select count(*) from public.gifts g where g.from_char = c.id and g.created_at > now() - interval '7 days')
    ) order by c.created_at, c.id)
    from public.characters c left join public.character_status st on st.character_id = c.id
    where c.coven_id = coven), '[]'::jsonb);
end $$;

-- ───────────────────────── scheduled work ─────────────────────────

-- Hourly: announce full and new moons in the coven chat, once per moon.
create or replace function game.hourly_tick() returns void
language plpgsql security definer set search_path = public, game, pg_temp as $$
declare hr int := extract(hour from (now() at time zone coalesce(game.cfg('day_timezone') #>> '{}', 'UTC')))::int;
        win text := game.moon_window(); cycle int; cov record; place text;
begin
  if win is null or hr not between 9 and 21 then return; end if;
  cycle := floor(extract(epoch from (now() - timestamptz '2000-01-06 18:14:00+00')) / 86400.0 / 29.530588853)::int;
  select name into place from public.locations where id = game.cfg('shared_events') -> (win || '_moon') ->> 'locationId';
  for cov in select id from public.covens loop
    if not exists (select 1 from game.markers where key = 'moon:' || cov.id || ':' || win || ':' || cycle) then
      insert into game.markers (key) values ('moon:' || cov.id || ':' || win || ':' || cycle);
      perform game.system_message(cov.id, case when win = 'full'
        then 'The full moon is up. The Full Moon Ceremony is open at ' || coalesce(place, 'the circle') || '.'
        else 'New moon tonight. Gather at ' || coalesce(place, 'the circle') || ' to set intentions.' end);
    end if;
  end loop;
end $$;

-- Supabase has pg_cron; plain test databases skip this.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('pocket-coven-hourly', '7 * * * *', 'select game.hourly_tick()');
  end if;
end $$;
