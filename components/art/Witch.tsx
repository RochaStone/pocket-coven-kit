"use client";
// Parametric witch: hair (8 styles), skin, eyes, freckles, mood face, and every wardrobe slot drawn from the
// item's art params (style + colours). Original SVG, no per-character art: any witch in any coven renders here.
import type { AnimationKey, Equipped, FamiliarSpecies, Look, Mood } from "@/lib/game/types";
import { darken, INK, lighten, mix, starPath } from "./colour";
import { useArt, useItem, useItemArt } from "./ArtContext";
import { FamiliarInline } from "./Familiar";
import { Crown } from "./mer/Body";
import { Earrings, HairAcc, MER_HEAD, Necklace } from "./Trinkets";
import { MerFigure } from "./mer/MerFigure";


export interface WitchProps {
  characterId?: string;
  look: Look;
  equipped: Equipped;
  mood: Mood;
  size?: number;
  animate?: boolean;
  action?: AnimationKey | null;
  className?: string;
  title?: string;
  petName?: string;
}


function HairBack({ style, c, tie }: { style: Look["hairStyle"]; c: string; tie: string }) {
  const line = darken(c, 0.4);
  const s = { fill: c, stroke: line, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (style) {
    case "long_waves":
      return <path d="M56 92 C48 34 152 34 144 92 C152 118 144 132 154 150 C146 160 152 172 142 182 C120 176 80 176 58 182 C48 172 54 160 46 150 C56 132 48 118 56 92 Z" {...s} />;
    case "straight_long":
      return <path d="M55 92 C50 36 150 36 145 92 L150 184 Q100 192 50 184 Z" {...s} />;
    case "bob":
      return <path d="M53 94 C48 38 152 38 147 94 L150 128 Q100 140 50 128 Z" {...s} />;
    case "curls":
      return (
        <g>
          {[[58, 72], [52, 96], [56, 120], [62, 142], [142, 72], [148, 96], [144, 120], [138, 142], [76, 52], [124, 52], [100, 46]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={17} {...s} />
          ))}
        </g>
      );
    case "braid":
      return (
        <g>
          <path d="M56 94 C50 40 150 40 144 94 L146 112 Q100 120 54 112 Z" {...s} />
          {[118, 132, 146, 160, 174].map((y, i) => (
            <ellipse key={y} cx={64 - i * 1.5} cy={y} rx={9} ry={8} {...s} />
          ))}
          <path d="M57 182 l3 8 l3 -8" stroke={line} strokeWidth={2} fill={c} />
        </g>
      );
    case "pixie":
      return <path d="M57 88 C54 42 146 42 143 88 L140 104 Q100 98 60 104 Z" {...s} />;
    case "buns":
      return (
        <g>
          <circle cx={64} cy={54} r={17} {...s} />
          <circle cx={136} cy={54} r={17} {...s} />
          <path d="M57 92 C54 42 146 42 143 92 L141 108 Q100 102 59 108 Z" {...s} />
        </g>
      );
    case "pigtails":
      return (
        <g>
          <path d="M54 96 C40 116 40 150 52 170 C60 150 62 124 62 104 Z" {...s} />
          <path d="M146 96 C160 116 160 150 148 170 C140 150 138 124 138 104 Z" {...s} />
          <path d="M57 92 C54 42 146 42 143 92 L141 108 Q100 102 59 108 Z" {...s} />
          <circle cx={58} cy={100} r={5} fill={tie} stroke={INK} strokeWidth={1.2} />
          <circle cx={142} cy={100} r={5} fill={tie} stroke={INK} strokeWidth={1.2} />
        </g>
      );
  }
}

function Fringe({ style, c }: { style: Look["hairStyle"]; c: string }) {
  const s = { fill: c, stroke: darken(c, 0.4), strokeWidth: 2, strokeLinejoin: "round" as const };
  if (style === "curls") return <path d="M60 82 C62 58 82 48 100 48 C118 48 138 58 140 82 C132 70 124 74 118 66 C112 76 100 72 96 64 C88 74 78 70 74 66 C70 76 64 74 60 82 Z" {...s} />;
  if (style === "bob" || style === "straight_long") return <path d="M58 88 C56 52 144 52 142 88 C136 76 132 74 128 72 L72 72 C66 74 62 78 58 88 Z" {...s} />;
  if (style === "pixie") return <path d="M58 86 C58 50 140 44 142 84 C130 66 112 62 98 70 C90 62 74 64 58 86 Z" {...s} />;
  return <path d="M58 88 C60 50 140 46 142 86 C128 64 108 60 92 70 C82 76 70 80 58 88 Z" {...s} />;
}

function Face({ mood, eye, skin, freckles }: { mood: Mood; eye: string; skin: string; freckles?: boolean }) {
  const blush = mix(skin, "#e0607a", mood === "thriving" ? 0.5 : 0.32);
  const closed = mood === "sleepy";
  const half = mood === "bored" || mood === "offended";
  const eyes = [84, 116].map((x) =>
    closed ? (
      <path key={x} d={`M${x - 7} 96 q 7 6 14 0`} stroke={INK} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    ) : (
      <g key={x}>
        <ellipse cx={x} cy={96} rx={6.5} ry={8.5} fill="#fff" stroke={INK} strokeWidth={1.6} />
        <ellipse cx={x} cy={97.5} rx={5} ry={6.6} fill={eye} />
        <ellipse cx={x} cy={98} rx={2.4} ry={3.4} fill={INK} />
        {mood === "magical" ? <path d={starPath(x - 2, 93.5, 3.2)} fill="#fff" /> : <circle cx={x - 2.2} cy={93.5} r={1.9} fill="#fff" />}
        {half && <path d={`M${x - 7.5} ${mood === "offended" ? 92 : 94} L${x + 7.5} ${mood === "offended" ? (x < 100 ? 95 : 92) : 94}`} stroke={skin} strokeWidth={5} />}
        {half && <path d={`M${x - 7.5} ${mood === "offended" ? 94 : 96} L${x + 7.5} ${mood === "offended" ? (x < 100 ? 97 : 94) : 96}`} stroke={INK} strokeWidth={1.6} strokeLinecap="round" />}
      </g>
    ),
  );
  const mouth =
    mood === "thriving" || mood === "magical" ? (
      <path d="M90 110 Q100 122 110 110 Z" fill="#8a3a4a" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
    ) : mood === "hungry" ? (
      <ellipse cx={100} cy={113} rx={4.5} ry={5.5} fill="#8a3a4a" stroke={INK} strokeWidth={1.6} />
    ) : mood === "offended" ? (
      <path d="M93 115 Q100 109 107 115" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    ) : mood === "bored" ? (
      <path d="M94 113 L106 113" stroke={INK} strokeWidth={2} strokeLinecap="round" />
    ) : mood === "sleepy" ? (
      <ellipse cx={100} cy={113} rx={2.6} ry={3} fill="#8a3a4a" stroke={INK} strokeWidth={1.4} />
    ) : (
      <path d="M92 110 Q100 117 108 110" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    );
  return (
    <g>
      <ellipse cx={76} cy={107} rx={7} ry={4.4} fill={blush} opacity={0.75} />
      <ellipse cx={124} cy={107} rx={7} ry={4.4} fill={blush} opacity={0.75} />
      {freckles &&
        [[72, 103], [77, 106], [81, 102], [119, 102], [123, 106], [128, 103]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.1} fill={darken(skin, 0.35)} />)}
      {mood === "offended" && (
        <g stroke={INK} strokeWidth={2.2} strokeLinecap="round">
          <path d="M77 84 L90 88" />
          <path d="M123 84 L110 88" />
        </g>
      )}
      {eyes}
      <path d="M99 104 q 2 2 0 3" stroke={darken(skin, 0.35)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {mouth}
    </g>
  );
}

function Outfit({ id }: { id?: string }) {
  const a = useItemArt(id);
  const M = a?.colours[0] ?? "#6b5a7a";
  const T = a?.colours[1] ?? "#efe6d6";
  const line = darken(M, 0.45);
  const s = { stroke: line, strokeWidth: 2, strokeLinejoin: "round" as const };
  const sleeves = (
    <g>
      <path d="M76 134 C62 140 58 160 62 172 L74 170 C74 158 78 146 84 140 Z" fill={M} {...s} />
      <path d="M124 134 C138 140 142 160 138 172 L126 170 C126 158 122 146 116 140 Z" fill={M} {...s} />
    </g>
  );
  switch (a?.style) {
    case "cloak":
      return (
        <g>
          <path d="M76 132 Q100 124 124 132 L150 206 Q100 214 50 206 Z" fill={M} {...s} />
          <path d="M92 134 L108 134 L112 206 L88 206 Z" fill={T} stroke={line} strokeWidth={1.4} />
          <path d="M76 132 C70 160 62 188 50 206 M124 132 C130 160 138 188 150 206" stroke={darken(M, 0.2)} strokeWidth={3} fill="none" />
          {sleeves}
          <circle cx={100} cy={136} r={4} fill="#e2b64a" stroke={INK} strokeWidth={1.2} />
        </g>
      );
    case "pinafore":
      return (
        <g>
          <path d="M78 132 Q100 126 122 132 L136 204 Q100 210 64 204 Z" fill={T} {...s} />
          {sleeves}
          <path d="M84 150 L116 150 L140 206 Q100 214 60 206 Z" fill={M} {...s} />
          <rect x={86} y={134} width={28} height={18} rx={3} fill={M} {...s} />
          <path d="M86 136 L80 130 M114 136 L120 130" stroke={line} strokeWidth={3} />
          <rect x={74} y={176} width={14} height={12} rx={3} fill={darken(M, 0.12)} stroke={line} strokeWidth={1.2} />
          <rect x={112} y={176} width={14} height={12} rx={3} fill={darken(M, 0.12)} stroke={line} strokeWidth={1.2} />
        </g>
      );
    case "wrap_dress":
      return (
        <g>
          <path d="M76 132 Q100 126 124 132 L146 206 Q100 216 54 206 Z" fill={M} {...s} />
          <path d="M84 132 L100 154 L116 132 Z" fill={lighten(T, 0.2)} stroke={line} strokeWidth={1.4} />
          <path d="M78 160 L122 160 L122 168 L78 168 Z" fill={T} stroke={line} strokeWidth={1.4} />
          <path d="M116 164 l10 20 M118 166 l2 22" stroke={T} strokeWidth={3} strokeLinecap="round" />
          {sleeves}
        </g>
      );
    case "gown":
      return (
        <g>
          <path d="M78 132 Q100 126 122 132 L156 212 Q100 222 44 212 Z" fill={M} {...s} />
          <path d="M48 202 Q100 212 152 202 L156 212 Q100 222 44 212 Z" fill={T} stroke={line} strokeWidth={1.4} />
          <path d="M80 134 Q100 146 120 134" stroke={T} strokeWidth={3} fill="none" />
          <path d="M76 134 C58 146 52 166 52 176 L72 172 C74 158 78 146 84 140 Z M124 134 C142 146 148 166 148 176 L128 172 C126 158 122 146 116 140 Z" fill={M} {...s} />
          {[70, 100, 130].map((x) => <path key={x} d={starPath(x, 186, 3.4)} fill={T} opacity={0.8} />)}
        </g>
      );
    case "cardigan":
      return (
        <g>
          <path d="M74 166 L126 166 L142 206 Q100 212 58 206 Z" fill={T} {...s} />
          <path d="M76 132 Q100 126 124 132 L128 170 Q100 176 72 170 Z" fill={M} {...s} />
          <path d="M100 134 L100 172" stroke={line} strokeWidth={1.6} />
          {[142, 152, 162].map((y) => <circle key={y} cx={104} cy={y} r={2} fill={T} stroke={line} strokeWidth={0.8} />)}
          {sleeves}
          <path d="M62 168 L74 168 M126 168 L138 168" stroke={T} strokeWidth={3} />
        </g>
      );
    case "apron_dress":
      return (
        <g>
          <path d="M76 132 Q100 126 124 132 L144 206 Q100 214 56 206 Z" fill={M} {...s} />
          {sleeves}
          <path d="M84 146 L116 146 L124 200 Q100 206 76 200 Z" fill={T} stroke={darken(T, 0.4)} strokeWidth={1.6} />
          <path d="M84 146 L76 140 M116 146 L124 140" stroke={T} strokeWidth={3} />
          <rect x={92} y={170} width={16} height={12} rx={2} fill={lighten(T, 0.15)} stroke={darken(T, 0.4)} strokeWidth={1} />
        </g>
      );
    default:
      return (
        <g>
          <path d="M76 132 Q100 126 124 132 L142 206 Q100 212 58 206 Z" fill={M} {...s} />
          {sleeves}
        </g>
      );
  }
}

function Boots({ id }: { id?: string }) {
  const a = useItemArt(id);
  const M = a?.colours[0] ?? "#3a2e2a";
  const T = a?.colours[1] ?? "#d9c9a3";
  const line = darken(M, 0.5);
  const one = (x: number) => {
    switch (a?.style) {
      case "lace_up":
        return (
          <g key={x}>
            <path d={`M${x} 198 L${x + 12} 198 L${x + 12} 222 L${x + 18} 224 Q${x + 18} 230 ${x + 10} 230 L${x - 2} 230 Q${x - 4} 224 ${x} 222 Z`} fill={M} stroke={line} strokeWidth={1.6} />
            {[204, 210, 216].map((y) => <path key={y} d={`M${x + 2} ${y} L${x + 10} ${y + 3} M${x + 10} ${y} L${x + 2} ${y + 3}`} stroke={T} strokeWidth={1.2} />)}
          </g>
        );
      case "buckled":
        return (
          <g key={x}>
            <path d={`M${x - 1} 196 L${x + 13} 196 L${x + 13} 222 L${x + 19} 224 Q${x + 19} 230 ${x + 10} 230 L${x - 3} 230 Q${x - 4} 224 ${x - 1} 222 Z`} fill={M} stroke={line} strokeWidth={1.6} />
            <rect x={x - 1} y={206} width={14} height={4} fill={T} />
            <rect x={x + 3} y={205} width={6} height={6} fill="none" stroke="#e2b64a" strokeWidth={1.6} />
          </g>
        );
      case "slippers":
        return <path key={x} d={`M${x - 3} 230 Q${x - 4} 220 ${x + 8} 220 Q${x + 20} 220 ${x + 19} 230 Z`} fill={M} stroke={line} strokeWidth={1.6} />;
      default:
        return (
          <g key={x}>
            <path d={`M${x} 212 L${x + 12} 212 L${x + 12} 222 L${x + 18} 224 Q${x + 18} 230 ${x + 10} 230 L${x - 2} 230 Q${x - 4} 224 ${x} 222 Z`} fill={M} stroke={line} strokeWidth={1.6} />
            <path d={`M${x} 214 L${x + 12} 214`} stroke={T} strokeWidth={2} />
          </g>
        );
    }
  };
  return (
    <g>
      <rect x={87} y={200} width={10} height={24} fill="#3a3040" />
      <rect x={103} y={200} width={10} height={24} fill="#3a3040" />
      {one(86)}
      {one(102)}
    </g>
  );
}

function HoodBack({ M }: { M: string }) {
  return <path d="M48 104 C42 34 158 34 152 104 C156 132 150 150 138 158 L62 158 C50 150 44 132 48 104 Z" fill={M} stroke={darken(M, 0.45)} strokeWidth={2} />;
}

function Hat({ id }: { id?: string }) {
  const a = useItemArt(id);
  if (!a) return null;
  const [M, T] = a.colours;
  const line = darken(M, 0.5);
  const s = { fill: M, stroke: line, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (a.style) {
    case "crown":
      return (
        <g transform={MER_HEAD}>
          <g transform="translate(100 40)">
            <Crown gold={M} gem={T} />
          </g>
        </g>
      );
    case "pointed":
      return (
        <g>
          <ellipse cx={100} cy={58} rx={64} ry={12} {...s} />
          <path d="M68 58 C76 40 90 18 124 -10 C114 16 122 40 132 58 Z" {...s} />
          <path d="M70 52 C90 58 110 58 130 52 L132 58 C110 64 90 64 68 58 Z" fill={T} stroke={line} strokeWidth={1.4} />
          <path d={starPath(112, 30, 5)} fill={T} />
        </g>
      );
    case "wide_brim":
      return (
        <g>
          <ellipse cx={100} cy={60} rx={74} ry={15} {...s} />
          <path d="M70 60 C70 28 130 28 130 60 Z" {...s} />
          <path d="M71 50 Q100 56 129 50 L130 58 Q100 64 70 58 Z" fill={T} stroke={line} strokeWidth={1.4} />
        </g>
      );
    case "hood":
      return <path d="M56 104 C54 56 146 56 144 104 C140 70 120 58 100 58 C80 58 60 70 56 104 Z" fill={T} stroke={line} strokeWidth={2} />;
    case "beret":
      return (
        <g>
          <ellipse cx={108} cy={54} rx={44} ry={15} transform="rotate(-8 108 54)" {...s} />
          <path d="M108 40 l2 -7" stroke={line} strokeWidth={3} strokeLinecap="round" />
          <path d="M70 62 Q104 70 142 56" stroke={T} strokeWidth={3} fill="none" />
        </g>
      );
    case "flower_crown":
      return (
        <g>
          <path d="M58 70 Q100 44 142 70" stroke="#5f7a43" strokeWidth={4} fill="none" />
          {[62, 76, 90, 104, 118, 132].map((x, i) => {
            const y = 70 - Math.sin(((x - 58) / 84) * Math.PI) * 13;
            return (
              <g key={x} transform={`translate(${x} ${y})`}>
                {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-4.5} rx={3.6} ry={5} fill={i % 2 ? T : M} stroke={line} strokeWidth={0.8} transform={`rotate(${r})`} />)}
                <circle r={2.4} fill="#e2b64a" />
              </g>
            );
          })}
        </g>
      );
    default:
      return null;
  }
}

const ACTION_CLASS: Partial<Record<AnimationKey, string>> = {
  dance: "anim-sway", play: "anim-hop", swim: "anim-sway", spell: "anim-hop", toast: "anim-hop", sing: "anim-sway",
  sleep: "anim-breathe", cuddle: "anim-breathe", bathe: "anim-breathe",
};

function Figure({ look, equipped, mood, petName, action }: WitchProps) {
  const skin = look.skin;
  const skinLine = darken(skin, 0.4);
  const { palette } = useArt();
  const hatArt = useItemArt(equipped.hat);
  const hood = hatArt?.style === "hood";
  const famItem = useItem(equipped.companion);
  // A tail replaces legs and boots.
  const tail = useItemArt(equipped.outfit)?.style === "mer_tail";
  return (
    <g transform="translate(0 12)">
      <ellipse cx={104} cy={231} rx={58} ry={7} fill="#000" opacity={0.14} />
      {hood && <HoodBack M={hatArt.colours[0]} />}
      {!hood && <HairBack style={look.hairStyle} c={look.hairColor} tie={palette.accent} />}
      {!tail && <Boots id={equipped.boots} />}
      <Outfit id={equipped.outfit} />
      <circle cx={66} cy={172} r={6} fill={skin} stroke={skinLine} strokeWidth={1.6} />
      <circle cx={134} cy={172} r={6} fill={skin} stroke={skinLine} strokeWidth={1.6} />
      <rect x={93} y={124} width={14} height={12} fill={skin} stroke={skinLine} strokeWidth={1.4} />
      <circle cx={58} cy={100} r={7} fill={skin} stroke={skinLine} strokeWidth={1.6} />
      <circle cx={142} cy={100} r={7} fill={skin} stroke={skinLine} strokeWidth={1.6} />
      <ellipse cx={100} cy={92} rx={41} ry={40} fill={skin} stroke={skinLine} strokeWidth={2} />
      <Earrings id={equipped.earrings} />
      <Face mood={mood} eye={look.eyeColor} skin={skin} freckles={look.freckles} />
      {hood ? <Hat id={equipped.hat} /> : <Fringe style={look.hairStyle} c={look.hairColor} />}
      {!hood && <Hat id={equipped.hat} />}
      <Necklace id={equipped.necklace} />
      <HairAcc id={equipped.hair_acc} />
      {famItem && (
        <g className={action ? undefined : "anim-float"}>
          <FamiliarInline
            x={140}
            y={168}
            size={64}
            species={famItem.art.style as FamiliarSpecies}
            colourway={look.familiarColour ?? "ink"}
            accessory={look.familiarAcc ?? "none"}
            accent={palette.accent}
            sleepy={mood === "sleepy"}
          />
          {petName && (
            <text x={172} y={244} textAnchor="middle" fontSize={11} fontWeight={700} fill={INK} style={{ fontFamily: "var(--font-body)" }}>
              {petName}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

const KIT_PARTS = { Hat, Necklace, Earrings, HairAcc };
// A witch in a mer tail is drawn with the original mer-witch figure (components/art/mer), same width as this one.
const useMer = (props: WitchProps) => useItemArt(props.equipped.outfit)?.style === "mer_tail";

export function Witch(props: WitchProps) {
  const { size = 220, animate = true, action = null, className, title } = props;
  const cls = action ? ACTION_CLASS[action] ?? "anim-hop" : animate ? "anim-idle" : undefined;
  const mer = useMer(props);
  if (mer) return <MerFigure {...props} size={size * 1.3} kit={{ ...KIT_PARTS, actionClass: action ? cls : undefined }} />;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 -2 210 262" className={className} role="img" aria-label={title ?? "A witch"}>
      <g className={cls} style={{ transformOrigin: "100px 230px", transformBox: "view-box" }}>
        <Figure {...props} />
      </g>
    </svg>
  );
}

// Head and shoulders, for chat, the roster and the map.
export function MiniWitch(props: WitchProps) {
  const { size = 48, className, title } = props;
  const mer = useMer(props);
  if (mer) return <MerFigure {...props} size={size} animate={false} crop kit={KIT_PARTS} />;
  return (
    <svg width={size} height={size} viewBox="22 -4 156 156" className={className} role="img" aria-label={title ?? "A witch"}>
      <Figure {...props} equipped={{ ...props.equipped, companion: undefined }} />
    </svg>
  );
}
