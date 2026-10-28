# WORLD.md: the coven.config.json schema

`coven.config.json` is the one file that makes the world yours. The guided setup writes it with you; you can also edit it by hand.
After any change, run `npm run build:world`. It checks every key, writes `lib/game/catalog.ts` (everything the game knows) and `supabase/seed.sql` (the same, for the database), and writes nothing if something is wrong. Then `npm run test:unit`.

Start a fresh file from any preset with `npm run new:world hedge-witch` (or `moon-coven`, `kitchen-witch`, `sea-witch`, `city-witch`). Add `--force` to replace an existing one.

## Keys

| Key | Required | What it is |
|---|---|---|
| `coven.name` | yes | The coven's name, 1 to 40 characters. It is the game's title. |
| `coven.tagline` | no | One line under the name (up to 120 characters). Defaults to the preset's. |
| `coven.for` | no | Who it is for, in your words. A note for you and for Claude; the game does not show it. |
| `coven.slug` | no | Lowercase letters, digits and hyphens, used in the frame title (`slug.exe`). Made from the name if missing. |
| `theme` | yes | One of `hedge-witch`, `moon-coven`, `kitchen-witch`, `sea-witch`, `city-witch`. Sets colours, wardrobe, furniture, treasures, treats, witch names and flavour text. |
| `motif` | no | The frame's family: `analog`, `cyberpunk` or `y2k-blog`. Defaults to the preset's (City Witch is cyberpunk, Kitchen Witch is y2k-blog, the rest analog). |
| `currency.singular`, `currency.plural` | yes | What your witches earn and spend: `"acorn"` and `"acorns"`. Letters and spaces, up to 24 characters. |
| `timezone` | no | A time zone name like `Europe/London` or `America/New_York`. Daily gifts and goals reset at midnight there. Defaults to `UTC`. |
| `palette` | no | Any of the theme's colours, as hex (`"accent": "#7a4e2d"`). Keys: `ground`, `groundDeep`, `paper`, `ink`, `accent`, `alt`, `mystic`, `coin`, `warn`, and the scene colours `sky`, `skyDeep`, `wall`, `wallDeep`, `floor`, `wood`, `leaf`, `leafDeep`, `water`, `stone`, `glow`. |
| `rooms` | yes | 4 to 8 rooms (see below). The first room is where every witch wakes up. |
| `ceremonies` | no | 1 to 4 gatherings, each `{ "id", "name", "room" }`. Every ceremony needs two witches or more and rewards everyone who came. Defaults to the preset's two. |
| `moonRoom` | no | The room id where the Full Moon Ceremony and New Moon Intentions open, on the real moon. |
| `familiars` | no | 1 to 8 of `cat`, `owl`, `moth`, `fox`, `toad`, `raven`, `snake`, `rabbit`. Defaults to the preset's six. |
| `witches.count` | no | 2 to 12 witches, including you. Defaults to 5. The first witch is the owner's. |
| `witches.defaultPronouns` | no | `she`, `they` or `he` for witches with no pronouns set. Defaults to `they`. Everyone can change her own in the game. |
| `witches.slots` | no | Up to `count` entries, in order: `{ "name", "title", "pronouns", "young" }`. All optional. Names default to the preset's fictional names, and everyone can rename herself in the game. `young: true` keeps adults-only activities away from that witch. |
| `flavour` | no | Replace any of the preset's lines: `moods` (`thriving`, `happy`, `sleepy`, `hungry`, `bored`, `magical`, `offended`), `joined` (when someone claims her witch, uses `{name}`), `ritualComplete`, `dailyTitle`, `dailyBody`, `welcome` (uses `{name}`). |

## A room

```json
{
  "id": "hearth",
  "name": "The Hearth Room",
  "backdrop": "hearth_kitchen",
  "blurb": "Stew on the fire, gossip at the table.",
  "activities": ["stew", "gossip", { "id": "herbal_tea", "name": "Nettle tea at noon", "flavour": ["{name} drank {their} nettle tea and felt brave."] }]
}
```

- `id`: lowercase letters, digits and underscores, starting with a letter. Made from the name if missing. Ceremonies and `moonRoom` point at it.
- `name`: up to 30 characters. `blurb`: one line, up to 120.
- `backdrop`: one of the 18 scenes below. Defaults to the preset's backdrop for that position.
- `activities`: 2 to 6 ids from the library below. Use the object form to rename one or give it your own flavour lines.

## Flavour lines

Flavour lines are what the game says after someone does something. They must work for every witch, whatever her pronouns, so they use tokens:
`{name}` the witch's name · `{they}` `{them}` `{their}` her pronouns · `{They}` `{Their}` the same, capitalised for the start of a sentence · `{is}` `{has}` after her name · `{are}` after a pronoun ("{They} {are} glowing" reads "She is glowing" or "They are glowing").
The build refuses any line with "she", "her", "he" or "his" written in.

## Backdrops

`cottage_room`, `forest_glade`, `mushroom_ring`, `herb_garden`, `apothecary`, `hearth_kitchen`, `observatory`, `starfield_roof`, `library`, `bath_house`, `pantry`, `tea_room`, `market`, `tide_pool`, `driftwood_shore`, `sea_cave`, `rooftop_garden`, `lantern_lane`.
See them all, painted in your colours, at `/gallery/scenes` after `npm run gallery`.

## The activity library

Every room picks from these. Effects change the five needs (nourishment, energy, joy, magic, social; each 0 to 100). Loot means the activity can turn up one of the theme's treasures: `forage` (common finds), `gem` (stones and charms), `rare` (the rarest find in the world).
Give your world at least one `work` activity (the way to earn money), something to eat or drink, and somewhere to rest.

| id | Name | Category | Effects | Money | Cooldown | Loot |
|---|---|---|---|---|---|---|
| `nap` | Nap under the quilt | rest | energy +35, joy +5 | free | 10 min |  |
| `bath` | Soak in a herb bath | rest | joy +20, magic +10, energy +5 | free | 15 min |  |
| `daydream` | Daydream by the window | rest | energy +15, joy +10 | free | 5 min |  |
| `stretch` | Slow morning stretch | rest | energy +10, joy +8 | earns 2 | 5 min |  |
| `cuddle` | Cuddle the familiar | rest | joy +15, social +10 | free | 5 min |  |
| `herbal_tea` | Brew a pot of herbal tea | nourish | nourishment +15, joy +15, energy +10 | costs 8 | 3 min |  |
| `stew` | Eat a bowl of hedgerow stew | nourish | nourishment +30, energy +5 | costs 6 | 3 min |  |
| `bake_bread` | Bake a loaf of bread | nourish | nourishment +20, joy +12, energy -5 | earns 2 | 15 min |  |
| `pie` | Share a slice of pie | nourish | nourishment +25, joy +8, social +5 | costs 5 | 3 min |  |
| `honey_cake` | Nibble a honey cake | nourish | nourishment +20, joy +12 | costs 7 | 3 min |  |
| `hot_cocoa` | Sip spiced cocoa | nourish | nourishment +12, joy +18, energy +8 | costs 6 | 3 min |  |
| `soup` | Stir the soup pot | nourish | nourishment +22, magic +5 | costs 4 | 4 min |  |
| `feast` | Lay out a little feast | nourish | joy +20, social +10, nourishment +10 | free | 30 min |  |
| `cast_spell` | Cast a little spell | magic | magic +20, energy -10 | earns 3 | 10 min | gem |
| `brew_potion` | Brew a potion | magic | magic +25, energy -8, joy +5 | earns 4 | 15 min | gem |
| `read_cards` | Read the cards | magic | magic +15, joy +10 | earns 2 | 10 min |  |
| `stargaze` | Stargaze | magic | magic +20, joy +10 | earns 2 | 10 min | gem |
| `moon_bath` | Moon bathe | magic | magic +30, energy -10 | earns 4 | 30 min | rare |
| `candle_magic` | Light an intention candle | magic | magic +18, joy +6 | earns 2 | 10 min |  |
| `scry` | Scry in the water bowl | magic | magic +22, energy -6 | earns 3 | 15 min | rare |
| `spellbook` | Study the spellbook | magic | magic +15, energy -5, joy +5 | earns 3 | 10 min |  |
| `crystal_cleanse` | Cleanse the crystals | magic | magic +15, joy +8 | earns 2 | 10 min | gem |
| `forage` | Forage for treasures | play | joy +10, energy -12, magic +8 | earns 3 | 10 min | forage |
| `garden` | Tend the garden | play | joy +15, energy -8, nourishment +5 | earns 3 | 10 min | forage |
| `dig` | Dig for buried things | play | joy +15, energy -12 | earns 6 | 10 min | rare |
| `swim` | Wild swim | play | joy +20, energy -10, magic +5 | earns 2 | 5 min | forage |
| `rock_pool` | Peer into the rock pools | play | joy +12, magic +6, energy -5 | earns 3 | 5 min | forage |
| `sketch` | Sketch in the journal | play | joy +15, magic +5 | earns 2 | 10 min |  |
| `dance` | Dance it out | play | joy +20, social +15, energy -10 | earns 2 | 5 min |  |
| `sing` | Sing to the room | play | joy +18, magic +8 | earns 1 | 10 min |  |
| `lantern_walk` | Take a lantern walk | play | joy +12, energy -6, social +6 | earns 2 | 10 min | forage |
| `gossip` | Gossip by the fire | social | social +25, joy +10 | free | 10 min |  |
| `visit_neighbours` | Chat with the regulars | social | social +20, joy +5 | earns 1 | 5 min |  |
| `story_night` | Story night | social | joy +20, social +15, energy +5 | free | 30 min |  |
| `elderflower_toast` | Elderflower wine toast | social | joy +25, social +15, energy -5 | free | 15 min |  adults only |
| `tavern_cards` | Late cards at the tavern | social | social +25, joy +10, energy -8 | free | 15 min |  adults only |
| `market_stall` | Run the market stall | work | energy -20, social -5, magic +5 | earns 25 | 20 min |  |
| `chop_wood` | Chop the firewood | work | energy -18, joy +12, nourishment -8 | earns 5 | 15 min |  |
| `mend` | Mend cloaks for the village | work | energy -12, magic +4, social +4 | earns 15 | 15 min |  |
| `write_almanac` | Write the almanac | work | energy -15, magic +6 | earns 20 | 20 min |  |

## What the builder adds for you

- **A wardrobe of 27 pieces** across robes, boots, hats, necklaces, earrings and hair, painted in the theme's six wardrobe colours, plus your familiars. Two seasonal pieces appear in October and December.
- **Furniture, decor, eight treasures** to find, a keepsake for each moon ceremony and a charm for finishing a weekly coven goal.
- **Four treats** to send as gifts, a 16-card daily oracle, ten achievements and four weekly coven goals that rotate.
- **Witches** with looks, outfits and a familiar each, so the coven looks alive from the first invitation.

## After you deploy

Changing the config after your coven is online is safe: run `npm run build:world`, then `npx supabase db push --include-seed`. Rooms, items and activities you remove are switched off, never deleted, so nobody loses anything. Witches you add appear unclaimed, ready for an invite. The Owner screen's tunable settings (decay speed, daily gift size and so on) are never overwritten by a reseed.
