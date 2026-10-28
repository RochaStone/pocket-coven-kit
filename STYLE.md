# STYLE.md: style.json, the one style file for every Rocha Coded tool

**In this kit, style.json styles two things only:** the compact's chrome (the case, rim and lining your world opens out of) and the README images.
The game itself is styled by its theme preset and by `palette` and `motif` in `coven.config.json` (see WORLD.md). That keeps your community's world separate from your brand file, and lets you change either one alone.

The kit looks for `./style.json`, then `~/.rocha-coded/style.json`, then the bundled `examples/style.rocha-coded.json`. `npm run build:world` prints which one it used.
If your file leaves out a `palette` or `fonts` key, that one key falls back to the bundled example. Your words never fall back to anyone else's.

Copy `style.example.json` to `style.json` and fill in what you like:

| Key | What it does here |
|---|---|
| `name`, `owner`, `handle`, `site` | Your brand's name and links. Not used by the game. |
| `palette.hero` | The compact's case colour. |
| `palette.gold` | The rim, the screws and the moon on the lid. |
| `palette.paper` | The lining inside the compact. |
| `palette.accent` | The washi tape, the cursor and the status light. |
| `palette.ink` | Lines and type on the frame. |
| `palette.paper_pink`, `marker`, `plum`, `wine`, `cool` | Shared with the other tools; this kit does not use them. |
| `fonts.masthead` | Recorded for the frame title. The game loads its own fonts. |
| `fonts.label`, `body`, `scrawl`, `script`, `mono` | Shared with the other tools. |
| `motif` | `analog`, `cyberpunk` or `y2k-blog` for your other tools. In this kit the frame's family is set by `motif` in `coven.config.json`. |
| `lines` | Your own words for the other tools. Never used by the game. |
| `references` | Pictures or links Claude looks at when you say "make it mine". |
| `notes` | A sentence about your taste. |

Two examples ship: `examples/style.rocha-coded.json` (Rocha's) and `style.example.json` (blank). Never assume your taste is anyone else's: Claude asks for three to five references before writing yours.
