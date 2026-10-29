// The shared library every preset and every coven.config.json draws from.
// Rooms pick 2 to 6 activities from ACTIVITY_LIBRARY by id. Names and flavour can be overridden per room.
// Flavour templates must stay pronoun-neutral: use {name}, {they}, {them}, {their}, {They}, {Their}, {is}, {has}, {are}.
import type { ActivityCategory, AnimationKey, FamiliarSpecies, Stats } from "../lib/game/types.ts";

export interface LibraryActivity {
  id: string;
  name: string;
  category: ActivityCategory;
  effects: Partial<Stats>;
  coins: number;
  xp: number;
  cooldownSeconds: number;
  animation: AnimationKey;
  adultOnly?: boolean;
  // Which tier of the preset's collectibles this activity can turn up.
  loot?: "forage" | "gem" | "rare";
  flavour: string[];
}

const A = (a: LibraryActivity) => a;

export const ACTIVITY_LIBRARY: LibraryActivity[] = [
  // rest
  A({ id: "nap", name: "Nap under the quilt", category: "rest", effects: { energy: 35, joy: 5 }, coins: 0, xp: 5, cooldownSeconds: 600, animation: "sleep",
    flavour: ["{name} curled up under the quilt and slept like a stone in a warm pocket.", "Forty winks became sixty. {name} regrets nothing."] }),
  A({ id: "bath", name: "Soak in a herb bath", category: "rest", effects: { joy: 20, magic: 10, energy: 5 }, coins: 0, xp: 6, cooldownSeconds: 900, animation: "bathe",
    flavour: ["{name} soaked in rosemary steam until every worry went soft at the edges.", "Toes wrinkled, mind smoothed. {name} climbs out smelling of a summer hedge."] }),
  A({ id: "daydream", name: "Daydream by the window", category: "rest", effects: { energy: 15, joy: 10 }, coins: 0, xp: 3, cooldownSeconds: 300, animation: "sleep",
    flavour: ["{name} watched a raindrop race another raindrop. {Their} favourite won.", "{name} gazed out of the window and planned nothing at all, on purpose."] }),
  A({ id: "stretch", name: "Slow morning stretch", category: "rest", effects: { energy: 10, joy: 8 }, coins: 2, xp: 4, cooldownSeconds: 300, animation: "stretch",
    flavour: ["{name} reached for the ceiling beams and very nearly touched one.", "Spine unrolled, shoulders unknotted. {name} {is} a cat in a sunbeam now."] }),
  A({ id: "cuddle", name: "Cuddle the familiar", category: "rest", effects: { joy: 15, social: 10 }, coins: 0, xp: 4, cooldownSeconds: 300, animation: "cuddle",
    flavour: ["{name} scooped up the familiar, who sighed as if this were a great burden and stayed for an hour.", "Warm weight, slow breathing, one twitching ear. {name} {is} fully recharged."] }),

  // nourish
  A({ id: "herbal_tea", name: "Brew a pot of herbal tea", category: "nourish", effects: { nourishment: 15, joy: 15, energy: 10 }, coins: -8, xp: 4, cooldownSeconds: 180, animation: "drink",
    flavour: ["{name} let the tea steep exactly as long as the kettle suggested.", "Two cups in, {name} could hear {their} own thoughts again."] }),
  A({ id: "stew", name: "Eat a bowl of hedgerow stew", category: "nourish", effects: { nourishment: 30, energy: 5 }, coins: -6, xp: 4, cooldownSeconds: 180, animation: "eat",
    flavour: ["{name} wiped the bowl clean with a crust and declared the day saved.", "Thick, hot and full of things from the garden. {name} {is} stew-powered now."] }),
  A({ id: "bake_bread", name: "Bake a loaf of bread", category: "nourish", effects: { nourishment: 20, joy: 12, energy: -5 }, coins: 2, xp: 6, cooldownSeconds: 900, animation: "brew",
    flavour: ["{name} knocked on the bottom of the loaf and it answered hollow. Perfect.", "Flour on the nose, flour on the familiar. {name} calls it a success."] }),
  A({ id: "pie", name: "Share a slice of pie", category: "nourish", effects: { nourishment: 25, joy: 8, social: 5 }, coins: -5, xp: 3, cooldownSeconds: 180, animation: "eat",
    flavour: ["{name} cut the pie into fair slices, then took the slightly bigger one.", "The pastry shattered beautifully. {name} saved every crumb for later."] }),
  A({ id: "honey_cake", name: "Nibble a honey cake", category: "nourish", effects: { nourishment: 20, joy: 12 }, coins: -7, xp: 3, cooldownSeconds: 180, animation: "eat",
    flavour: ["{name} ate the honey cake slowly so it would last. It did not last.", "Golden, sticky, gone. {name} licks {their} fingers without shame."] }),
  A({ id: "hot_cocoa", name: "Sip spiced cocoa", category: "nourish", effects: { nourishment: 12, joy: 18, energy: 8 }, coins: -6, xp: 3, cooldownSeconds: 180, animation: "drink",
    flavour: ["{name} added a pinch of chilli and felt quietly heroic.", "Both hands round the mug, {name} {is} officially off duty."] }),
  A({ id: "soup", name: "Stir the soup pot", category: "nourish", effects: { nourishment: 22, magic: 5 }, coins: -4, xp: 4, cooldownSeconds: 240, animation: "brew",
    flavour: ["{name} stirred sunwise three times so the soup would turn out kind.", "A taste from the ladle, a pinch of salt, a whispered wish. {name} serves it up."] }),
  A({ id: "feast", name: "Lay out a little feast", category: "nourish", effects: { joy: 20, social: 10, nourishment: 10 }, coins: 0, xp: 5, cooldownSeconds: 1800, animation: "eat",
    flavour: ["{name} spread a cloth, set out cheese and plums, and called everyone to the table.", "Nothing matched and everything was delicious. {name} hosts like a legend."] }),

  // magic
  A({ id: "cast_spell", name: "Cast a little spell", category: "magic", effects: { magic: 20, energy: -10 }, coins: 3, xp: 8, cooldownSeconds: 600, animation: "spell", loot: "gem",
    flavour: ["{name} drew a small circle in the air and the candles all leaned in to listen.", "A flick, a word, a faint smell of lightning. {name} looks very pleased."] }),
  A({ id: "brew_potion", name: "Brew a potion", category: "magic", effects: { magic: 25, energy: -8, joy: 5 }, coins: 4, xp: 9, cooldownSeconds: 900, animation: "brew", loot: "gem",
    flavour: ["{name} brewed something the colour of dusk and labelled it 'for emergencies'.", "Three herbs, one secret, a long patient stir. The potion winked at {name}."] }),
  A({ id: "read_cards", name: "Read the cards", category: "magic", effects: { magic: 15, joy: 10 }, coins: 2, xp: 6, cooldownSeconds: 600, animation: "read",
    flavour: ["{name} laid out three cards and raised one eyebrow at the middle one.", "The cards told {name} to rest and to be brave. In that order."] }),
  A({ id: "stargaze", name: "Stargaze", category: "magic", effects: { magic: 20, joy: 10 }, coins: 2, xp: 6, cooldownSeconds: 600, animation: "stargaze", loot: "gem",
    flavour: ["{name} found the plough, then a teapot, then a constellation nobody has named yet.", "{name} lay back and let the whole sky happen."] }),
  A({ id: "moon_bath", name: "Moon bathe", category: "magic", effects: { magic: 30, energy: -10 }, coins: 4, xp: 10, cooldownSeconds: 1800, animation: "spell", loot: "rare",
    flavour: ["{name} sat very still in the silver light until {they} felt full to the brim.", "The moon poured out and {name} held out both hands to catch it."] }),
  A({ id: "candle_magic", name: "Light an intention candle", category: "magic", effects: { magic: 18, joy: 6 }, coins: 2, xp: 6, cooldownSeconds: 600, animation: "spell",
    flavour: ["{name} carved a wish into the wax and lit the wick with a steady hand.", "The flame stood tall and did not flicker once. {name} takes that as a yes."] }),
  A({ id: "scry", name: "Scry in the water bowl", category: "magic", effects: { magic: 22, energy: -6 }, coins: 3, xp: 8, cooldownSeconds: 900, animation: "spell", loot: "rare",
    flavour: ["{name} stared into the dark water until it showed a door, slightly open.", "Ripples, then a shape, then a clear little picture. {name} keeps it secret."] }),
  A({ id: "spellbook", name: "Study the spellbook", category: "magic", effects: { magic: 15, energy: -5, joy: 5 }, coins: 3, xp: 8, cooldownSeconds: 600, animation: "read",
    flavour: ["{name} found a spell for finding lost buttons and memorised it immediately.", "A pressed violet fell out of chapter nine. {name} reads chapter nine twice."] }),
  A({ id: "crystal_cleanse", name: "Cleanse the crystals", category: "magic", effects: { magic: 15, joy: 8 }, coins: 2, xp: 5, cooldownSeconds: 600, animation: "spell", loot: "gem",
    flavour: ["{name} rinsed each stone in rainwater and lined them up in the sun to dry.", "Smoke, a bell, a long breath. The crystals sparkle like they mean it now."] }),

  // play and the outdoors
  A({ id: "forage", name: "Forage for treasures", category: "play", effects: { joy: 10, energy: -12, magic: 8 }, coins: 3, xp: 8, cooldownSeconds: 600, animation: "explore", loot: "forage",
    flavour: ["{name} came home with full pockets and twigs in {their} hair.", "{name} followed a robin off the path. The robin had excellent taste."] }),
  A({ id: "garden", name: "Tend the garden", category: "play", effects: { joy: 15, energy: -8, nourishment: 5 }, coins: 3, xp: 6, cooldownSeconds: 600, animation: "garden", loot: "forage",
    flavour: ["{name} pulled the weeds, praised the beans and had a word with the slugs.", "Muddy knees, green fingers. {name}'s seedlings stand a little straighter."] }),
  A({ id: "dig", name: "Dig for buried things", category: "play", effects: { joy: 15, energy: -12 }, coins: 6, xp: 8, cooldownSeconds: 600, animation: "dig", loot: "rare",
    flavour: ["{name} dug down past the worms and found something that clinked.", "Spade, sweat, a muddy glint. {name} holds the find up to the light."] }),
  A({ id: "swim", name: "Wild swim", category: "play", effects: { joy: 20, energy: -10, magic: 5 }, coins: 2, xp: 6, cooldownSeconds: 300, animation: "swim", loot: "forage",
    flavour: ["{name} gasped at the cold, laughed at the gasp, and swam out anyway.", "Out past the reeds and back. {name} {is} pink-cheeked and very awake."] }),
  A({ id: "rock_pool", name: "Peer into the rock pools", category: "play", effects: { joy: 12, magic: 6, energy: -5 }, coins: 3, xp: 5, cooldownSeconds: 300, animation: "explore", loot: "forage",
    flavour: ["{name} lay on {their} front and watched a tiny shrimp go about its business.", "Every pool a little kingdom. {name} visited four and was welcomed in all of them."] }),
  A({ id: "sketch", name: "Sketch in the journal", category: "play", effects: { joy: 15, magic: 5 }, coins: 2, xp: 5, cooldownSeconds: 600, animation: "read",
    flavour: ["{name} drew the view from the window and added one small dragon.", "Pencil smudges, a pressed leaf, a half-finished moon. {name}'s journal grows."] }),
  A({ id: "dance", name: "Dance it out", category: "play", effects: { joy: 20, social: 15, energy: -10 }, coins: 2, xp: 5, cooldownSeconds: 300, animation: "dance",
    flavour: ["{name} spun until the skirts flared and the candles guttered.", "No music needed. {name} dances to the crackle of the fire."] }),
  A({ id: "sing", name: "Sing to the room", category: "play", effects: { joy: 18, magic: 8 }, coins: 1, xp: 5, cooldownSeconds: 600, animation: "sing",
    flavour: ["{name} sang an old song and the room hummed the chorus back.", "Every verse a little louder. By the end, {name} has an audience of moths."] }),
  A({ id: "lantern_walk", name: "Take a lantern walk", category: "play", effects: { joy: 12, energy: -6, social: 6 }, coins: 2, xp: 5, cooldownSeconds: 600, animation: "explore", loot: "forage",
    flavour: ["{name} carried a lantern down the lane and said goodnight to every window.", "Puddles full of lamplight. {name} steps in exactly one, deliberately."] }),

  // social
  A({ id: "gossip", name: "Gossip by the fire", category: "social", effects: { social: 25, joy: 10 }, coins: 0, xp: 4, cooldownSeconds: 600, animation: "sing",
    flavour: ["{name} leaned in, lowered {their} voice and made the fire crackle on cue.", "News was swapped, secrets were kept, mostly. {name} {is} fully informed."] }),
  A({ id: "visit_neighbours", name: "Chat with the regulars", category: "social", effects: { social: 20, joy: 5 }, coins: 1, xp: 4, cooldownSeconds: 300, animation: "cuddle",
    flavour: ["{name} stopped for a quick word and stayed for an hour.", "Everyone asked after {name}'s familiar first. {name} pretends not to mind."] }),
  A({ id: "story_night", name: "Story night", category: "social", effects: { joy: 20, social: 15, energy: 5 }, coins: 0, xp: 5, cooldownSeconds: 1800, animation: "read",
    flavour: ["{name} told the one about the walking teapot and nobody could stop laughing.", "Blankets, candle stubs, a story with a twist. {name} saves the best line for last."] }),
  A({ id: "elderflower_toast", name: "Elderflower wine toast", category: "social", effects: { joy: 25, social: 15, energy: -5 }, coins: 0, xp: 6, cooldownSeconds: 900, adultOnly: true, animation: "toast",
    flavour: ["{name} raised a glass of last summer's elderflower wine to the whole coven.", "Glasses clinked, toasts were made, one was rhymed. {name} glows."] }),
  A({ id: "tavern_cards", name: "Late cards at the tavern", category: "social", effects: { social: 25, joy: 10, energy: -8 }, coins: 0, xp: 5, cooldownSeconds: 900, adultOnly: true, animation: "toast",
    flavour: ["{name} played three hands of whist and won the one that mattered.", "Cider, candlelight, a deck with a missing queen. {name} stays until the last hand."] }),

  // work: the way to earn the currency
  A({ id: "market_stall", name: "Run the market stall", category: "work", effects: { energy: -20, social: -5, magic: 5 }, coins: 25, xp: 12, cooldownSeconds: 1200, animation: "work",
    flavour: ["{name} sold out of hand cream by noon and bartered for a pot of jam.", "A full till and a sore throat. {name} packs up the stall humming.", "Every jar labelled, every customer charmed. {name} counts the takings twice."] }),
  A({ id: "chop_wood", name: "Chop the firewood", category: "work", effects: { energy: -18, joy: 12, nourishment: -8 }, coins: 5, xp: 10, cooldownSeconds: 900, animation: "work",
    flavour: ["{name} split a whole basket of logs and stacked them like a puzzle.", "Thwack, thwack, done. The woodpile looks smug and so does {name}."] }),
  A({ id: "mend", name: "Mend cloaks for the village", category: "work", effects: { energy: -12, magic: 4, social: 4 }, coins: 15, xp: 9, cooldownSeconds: 900, animation: "work",
    flavour: ["{name} stitched a tear so neatly the owner could not find it again.", "Needle, thimble, a small protective charm sewn into every hem. {name} charges fairly."] }),
  A({ id: "write_almanac", name: "Write the almanac", category: "work", effects: { energy: -15, magic: 6 }, coins: 20, xp: 11, cooldownSeconds: 1200, animation: "read",
    flavour: ["{name} predicted rain on Thursday and a good year for plums.", "Ink-stained fingers, a finished page. {name} sends it to the printer with a flourish."] }),
];

export const activityFromLibrary = (id: string) => ACTIVITY_LIBRARY.find((a) => a.id === id);

// One card a day per witch. Second person so they suit any pronouns.
export const ORACLE_DECK = [
  { id: "moon", name: "The Moon", symbol: "moon", message: "What is hidden is only resting. Let it come up in its own time." },
  { id: "sun", name: "The Sun", symbol: "sun", message: "Go outside before noon. Something warm is looking for you." },
  { id: "star", name: "The Star", symbol: "star", message: "Point at the thing you want. Pointing is the first step of walking." },
  { id: "key", name: "The Key", symbol: "key", message: "A locked door today is a door that needs a different question." },
  { id: "candle", name: "The Candle", symbol: "candle", message: "Burn for one thing, not for everything. Brightness needs a wick." },
  { id: "cauldron", name: "The Cauldron", symbol: "cauldron", message: "Leave it to simmer. Lifting the lid will not make it faster." },
  { id: "broom", name: "The Broom", symbol: "broom", message: "Clear one surface. The rest of the house will feel it." },
  { id: "owl", name: "The Owl", symbol: "owl", message: "Ask the quiet person. They noticed everything." },
  { id: "mushroom", name: "The Mushroom", symbol: "mushroom", message: "The network under your feet is bigger than it looks. Lean on it." },
  { id: "crystal", name: "The Crystal", symbol: "crystal", message: "Hold the thing up to the light before you decide what it is." },
  { id: "feather", name: "The Feather", symbol: "feather", message: "Say it softly. It will travel further." },
  { id: "door", name: "The Door", symbol: "door", message: "You are allowed to walk through without being invited twice." },
  { id: "tree", name: "The Old Tree", symbol: "tree", message: "Grow slowly on purpose. Fast things fall over in wind." },
  { id: "river", name: "The River", symbol: "river", message: "Something is carrying you. Stop paddling for a moment and see where." },
  { id: "lantern", name: "The Lantern", symbol: "lantern", message: "Carry your own light today and lend it to someone on the way." },
  { id: "spindle", name: "The Spindle", symbol: "spindle", message: "Twist the small thread every day. Thread becomes cloth becomes cloak." },
] as const;

export const ACHIEVEMENT_LIBRARY = [
  { id: "first_care", name: "First Spell", description: "Do your first activity." },
  { id: "first_treasure", name: "Magpie", description: "Find your first treasure." },
  { id: "regular", name: "Part of the Furniture", description: "Do twenty-five activities." },
  { id: "coven_ritual", name: "In the Circle", description: "Finish a ceremony with the coven." },
  { id: "fashionista", name: "Dressed for It", description: "Wear five things at once." },
  { id: "interior_witch", name: "Nest Builder", description: "Put five things in your room." },
  { id: "hoarder", name: "Treasury", description: "Hold 300 {currency} at once." },
  { id: "generous_witch", name: "Open Hand", description: "Send five gifts to the coven." },
  { id: "oracle_devotee", name: "Card Reader", description: "Draw seven oracle cards." },
  { id: "moon_child", name: "Moonlit", description: "Finish a full or new moon ceremony." },
] as const;

// Wardrobe shapes. Each preset paints them in its own colours.
export const WARDROBE_STYLES = {
  outfit: [
    { style: "cloak", name: "Cloak", price: 120 },
    { style: "pinafore", name: "Pinafore", price: 70 },
    { style: "wrap_dress", name: "Wrap Dress", price: 110 },
    { style: "gown", name: "Gown", price: 180 },
    { style: "cardigan", name: "Cardigan Set", price: 80 },
    { style: "apron_dress", name: "Apron Dress", price: 90 },
  ],
  boots: [
    { style: "lace_up", name: "Lace-up Boots", price: 70 },
    { style: "ankle", name: "Ankle Boots", price: 60 },
    { style: "buckled", name: "Buckled Boots", price: 90 },
    { style: "slippers", name: "Felt Slippers", price: 40 },
  ],
  hat: [
    { style: "pointed", name: "Pointed Hat", price: 70 },
    { style: "wide_brim", name: "Wide-brim Hat", price: 90 },
    { style: "hood", name: "Hood", price: 50 },
    { style: "beret", name: "Beret", price: 45 },
    { style: "flower_crown", name: "Crown", price: 80 },
  ],
  necklace: [
    { style: "moon_pendant", name: "Moon Pendant", price: 80 },
    { style: "crystal", name: "Crystal Point", price: 90 },
    { style: "acorn", name: "Acorn Locket", price: 50 },
    { style: "key", name: "Key Charm", price: 60 },
  ],
  earrings: [
    { style: "hoops", name: "Hoops", price: 40 },
    { style: "stars", name: "Star Studs", price: 45 },
    { style: "drops", name: "Drops", price: 50 },
    { style: "leaves", name: "Leaf Dangles", price: 45 },
  ],
  hair_acc: [
    { style: "ribbon", name: "Ribbon", price: 30 },
    { style: "sprig", name: "Sprig", price: 30 },
    { style: "clip", name: "Moon Clip", price: 35 },
    { style: "pins", name: "Star Pins", price: 40 },
  ],
} as const;

export const FAMILIAR_INFO: Record<FamiliarSpecies, { name: string; description: string; price: number }> = {
  cat: { name: "Cat", description: "Sits on the spellbook you need. Purrs when the spell works.", price: 200 },
  owl: { name: "Owl", description: "Turns its head right round to disapprove of you properly.", price: 220 },
  moth: { name: "Moth", description: "Dusty velvet wings. Follows you to every lamp.", price: 160 },
  fox: { name: "Fox", description: "Russet, quick, and always one step ahead of the hens.", price: 220 },
  toad: { name: "Toad", description: "Golden-eyed and patient. Knows where the rain is coming from.", price: 140 },
  raven: { name: "Raven", description: "Brings you buttons, bottle tops and bad news, beautifully.", price: 200 },
  snake: { name: "Snake", description: "Coils round your wrist like a bracelet with opinions.", price: 180 },
  rabbit: { name: "Rabbit", description: "Thumps once for yes, twice for snacks.", price: 160 },
};

// Placeable icon styles the art layer can draw. Presets name them.
export const FURNITURE_STYLES = ["bed", "armchair", "bookcase", "table", "cauldron", "wardrobe", "rug", "lamp", "dresser", "bench"] as const;
export const DECOR_STYLES = ["candles", "plant", "jars", "lantern", "wreath", "garland", "crystal_ball", "broom", "clock", "mirror", "pumpkin", "star_tree"] as const;
export const COLLECTIBLE_STYLES = ["acorn", "feather", "crystal", "mushroom", "stone", "key", "moonstone", "leaf", "charm", "coin", "bottle", "berry", "glass", "sprig"] as const;
export const TREAT_STYLES = ["cup", "pie", "jar", "bouquet", "bread", "bowl"] as const;

// Signature pieces: drawn only when a witch's config wears one (witches.slots[].wear), then sold in the wardrobe too.
// Each has default colours; a config can give its own.
export const SIGNATURE_STYLES = {
  outfit: [{ style: "mer_tail", name: "Mer Tail", price: 200, colours: ["#F58FC4", "#8FD3E8"] }],
  hat: [{ style: "crown", name: "Gold Crown", price: 150, colours: ["#F0C86A", "#E0559A"] }],
  necklace: [{ style: "pearls", name: "Pearl Strand", price: 120, colours: ["#FFF7F4", "#F27DB4"] }],
  earrings: [{ style: "fins", name: "Fin Ears", price: 60, colours: ["#F7A8CF", "#FFF7F4"] }],
  hair_acc: [{ style: "shell_clip", name: "Shell Clip", price: 40, colours: ["#F9B8D3", "#FFF7F4"] }],
  boots: [],
} as const satisfies Record<keyof typeof WARDROBE_STYLES, readonly { style: string; name: string; price: number; colours: readonly string[] }[]>;
