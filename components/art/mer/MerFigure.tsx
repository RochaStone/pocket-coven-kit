"use client";
// The mer-witch: a witch wearing a mer tail is drawn with the original pocket coven figure, ported line for line,
// so the starter witch looks exactly like the original art. Her hair, skin, eyes and every piece still come from
// her look and her wardrobe, so she stays fully editable. Pieces from the kit's own wardrobe (a pointed hat,
// a moon pendant and so on) are drawn by the kit's parts, placed onto her head and neck.
import { useId, type CSSProperties, type ReactNode } from "react";
import type { FamiliarSpecies } from "@/lib/game/types";
import { useArt, useItem, useItemArt } from "../ArtContext";
import { FamiliarInline } from "../Familiar";
import type { WitchProps } from "../Witch";
import { Arm, Crown, Ear, Grad, MER_DEFAULTS, MerTop, Pearls, ShellClip, Tail } from "./Body";
import { darken, hairPalette, lighten, mix, safeId, skinPalette } from "./color";
import { EYE_D, FACE_D, MER_BUILD, mirror, torsoD } from "./geometry";
import { Brows, CSS, Eye, type EyeKind, HAIR_SHAPE, HairBack, hairExtra, HairFront, MoodFx, Mouth, ShellBack, ShellFront } from "./Head";

// Where the kit's own head and neck pieces land on her: the kit draws heads centred at (100, 92), hers at (100, 97.5).
const KIT_HEAD = "translate(100 97.5) scale(1.073) translate(-100 -92)";
const KIT_NECK = "translate(0 14)";

export interface KitParts {
  Hat: (p: { id?: string }) => ReactNode;
  Necklace: (p: { id?: string }) => ReactNode;
  Earrings: (p: { id?: string }) => ReactNode;
  HairAcc: (p: { id?: string }) => ReactNode;
  actionClass?: string;
}

export function MerFigure({ look, equipped, mood, size = 220, animate = true, action = null, className, title, petName, kit, crop = false }: WitchProps & { kit: KitParts; crop?: boolean }) {
  const u = safeId(useId());
  const b = MER_BUILD;
  const { palette } = useArt();
  const tailArt = useItemArt(equipped.outfit);
  const hatArt = useItemArt(equipped.hat);
  const neckArt = useItemArt(equipped.necklace);
  const earArt = useItemArt(equipped.earrings);
  const accArt = useItemArt(equipped.hair_acc);
  const famItem = useItem(crop ? undefined : equipped.companion);

  const hp = hairPalette(look.hairColor);
  const sp = skinPalette(look.skin);
  const offended = mood === "offended";
  const [tailMain, tailTrim] = tailArt?.colours ?? MER_DEFAULTS.mer_tail;
  const top = MerTop({ b, u, main: tailMain });
  const { shape, curly } = HAIR_SHAPE[look.hairStyle] ?? HAIR_SHAPE.long_waves;
  const sleeping = action === "sleep";

  let eye: EyeKind = "open";
  if (mood === "thriving") eye = "sparkle";
  else if (mood === "magical") eye = "star";
  else if (mood === "sleepy") eye = "closedDown";
  else if (mood === "bored") eye = "half";
  else if (mood === "offended") eye = "closedUp";
  else if (mood === "hungry") eye = "teary";
  if (sleeping) eye = "closedDown";
  const canBlink = eye === "open" || eye === "sparkle" || eye === "star" || eye === "teary";

  const headT = `translate(100 140) scale(${b.headScale}) ${offended ? "rotate(-5) " : ""}translate(-100 -140)`;
  const tilt = action === "swim" ? "rotate(-9 100 170)" : undefined;
  let hash = 0;
  for (const ch of u) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const blinkDelay = `${(hash % 40) / 10}s`;
  const eyeY = 107;
  const eyeDX = 21.5;
  const blushStrength = mood === "thriving" || mood === "offended" ? 0.75 : mood === "bored" || mood === "sleepy" ? 0.35 : 0.5;
  const label = title ?? `A mer-witch feeling ${mood}`;
  const fin = earArt?.style === "fins" ? earArt.colours[0] : undefined;

  return (
    <svg
      viewBox={crop ? "24 14 152 152" : "0 0 200 260"}
      width={crop ? size : (size * 200) / 260}
      height={size}
      role="img"
      aria-label={label}
      className={[animate ? "pcw-anim" : "", className ?? ""].join(" ").trim() || undefined}
      style={{ overflow: "visible" }}
      data-figure="mer"
    >
      <title>{label}</title>
      <style>{CSS}</style>
      <defs>
        <radialGradient id={`${u}-curl`} cx="0.38" cy="0.3" r="0.75">
          <stop offset="0" stopColor={hp.light} />
          <stop offset="0.55" stopColor={hp.base} />
          <stop offset="1" stopColor={hp.shade} />
        </radialGradient>
        <Grad id={`${u}-hair`} stops={[[0, hp.light], [0.5, hp.base], [1, hp.shade]]} />
        <Grad id={`${u}-hairb`} stops={[[0, hp.base], [0.6, hp.shade], [1, hp.deep]]} />
        <radialGradient id={`${u}-skin`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={sp.light} />
          <stop offset="0.55" stopColor={sp.base} />
          <stop offset="1" stopColor={mix(sp.base, sp.shade, 0.5)} />
        </radialGradient>
        <Grad id={`${u}-iris`} stops={[[0, darken(look.eyeColor, 0.45)], [0.45, look.eyeColor], [1, lighten(look.eyeColor, 0.45)]]} />
        <clipPath id={`${u}-eye`}>
          <path d={EYE_D} />
        </clipPath>
        <clipPath id={`${u}-face`}>
          <path d={FACE_D} />
        </clipPath>
      </defs>

      {offended && !crop && <ShellBack u={u} />}

      <g transform={offended ? "translate(0 28)" : undefined}>
        <g transform={tilt}>
          <g className={kit.actionClass} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" } as CSSProperties}>
            <g className="pcw-bob">
              {/* back hair */}
              <g transform={headT}>
                {shape === "space_buns" && hairExtra(shape, hp, u)}
                <g transform="translate(100 0) scale(0.87 1) translate(-100 0)">
                  <HairBack style={shape} p={hp} u={u} curly={curly} />
                </g>
              </g>

              {/* the tail */}
              {!offended && (
                <g className="pcw-sway" style={{ transformBox: "fill-box", transformOrigin: "50% 0%" } as CSSProperties}>
                  <Tail b={b} u={u} main={tailMain} trim={tailTrim} sway={animate} />
                </g>
              )}
              {!offended && top.lower}

              {/* torso */}
              <path d={`M 94 128 L 94 ${b.sY + 4} L 106 ${b.sY + 4} L 106 128 Z`} fill={sp.base} stroke={sp.line} strokeWidth={1.4} />
              <path d={torsoD(b)} fill={sp.base} stroke={sp.line} strokeWidth={1.4} strokeLinejoin="round" />
              <path d={`M 94 ${b.sY - 6} Q 100 ${b.sY - 1} 106 ${b.sY - 6} L 106 ${b.sY - 10} L 94 ${b.sY - 10} Z`} fill={sp.shade} opacity={0.6} />
              {top.upper}
              <Arm b={b} sp={sp} sleeveFill={top.sleeveFill} sleeveTrim={top.sleeveTrim} />
              <g transform={mirror}>
                <Arm b={b} sp={sp} sleeveFill={top.sleeveFill} sleeveTrim={top.sleeveTrim} />
              </g>
              {neckArt?.style === "pearls" ? (
                <g transform={`translate(100 ${b.sY + 1}) scale(1.15)`}>
                  <Pearls pearl={neckArt.colours[0]} line={neckArt.colours[1]} />
                </g>
              ) : (
                equipped.necklace && <g transform={KIT_NECK}>{kit.Necklace({ id: equipped.necklace })}</g>
              )}

              {/* head */}
              <g transform={headT}>
                {[1, -1].map((s) => (
                  <g key={s} transform={s === -1 ? mirror : undefined}>
                    <Ear fin={fin} sp={sp} />
                  </g>
                ))}
                <path d={FACE_D} fill={`url(#${u}-skin)`} stroke={sp.line} strokeWidth={1.8} />
                {offended && <path d="M 138 110 Q 151 118 140 132" fill={sp.base} stroke={sp.line} strokeWidth={1.6} />}
                <g opacity={blushStrength}>
                  <ellipse cx={100 - 27} cy={120} rx={offended ? 9 : 8.5} ry={5} fill={sp.blush} />
                  <ellipse cx={100 + 27 + (offended ? 3 : 0)} cy={120} rx={offended ? 10 : 8.5} ry={5} fill={sp.blush} />
                </g>
                {(mood === "thriving" || offended) && (
                  <g stroke="#e8507f" strokeWidth={0.9} strokeLinecap="round" opacity={0.7}>
                    <path d="M 69 118 l -2 3 M 73 118 l -2 3 M 77 118 l -2 3" />
                    <path d="M 125 118 l -2 3 M 129 118 l -2 3 M 133 118 l -2 3" />
                  </g>
                )}
                <path d="M 99 118.5 Q 100.4 119.6 101.6 118.4" stroke={sp.line} strokeWidth={1.1} fill="none" strokeLinecap="round" opacity={0.6} />
                <g className={canBlink ? "pcw-blink" : undefined} style={{ animationDelay: blinkDelay }}>
                  <Eye cx={100 + eyeDX} cy={eyeY} side={1} kind={eye} u={u} iris={look.eyeColor} soft={false} sp={sp} />
                  <Eye cx={100 - eyeDX} cy={eyeY} side={-1} kind={eye} u={u} iris={look.eyeColor} soft={false} sp={sp} />
                </g>
                <Mouth mood={sleeping ? "sleepy" : mood} sp={sp} />
                <HairFront style={shape} p={hp} u={u} sp={sp} curly={curly} />
                <Brows mood={mood} p={hp} andro={false} sleepy={sleeping} />
                {equipped.earrings && !fin && <g transform={KIT_HEAD}>{kit.Earrings({ id: equipped.earrings })}</g>}
                {accArt?.style === "shell_clip" ? (
                  <g transform="translate(140 64)">
                    <ShellClip shell={accArt.colours[0]} rib={accArt.colours[1]} />
                  </g>
                ) : (
                  equipped.hair_acc && <g transform={KIT_HEAD}>{kit.HairAcc({ id: equipped.hair_acc })}</g>
                )}
                {hatArt?.style === "crown" ? (
                  <g transform="translate(100 40)">
                    <Crown gold={hatArt.colours[0]} gem={hatArt.colours[1]} />
                  </g>
                ) : (
                  equipped.hat && <g transform={KIT_HEAD}>{kit.Hat({ id: equipped.hat })}</g>
                )}
              </g>
              {!crop && <MoodFx mood={sleeping ? "sleepy" : mood} b={b} />}
            </g>
          </g>
        </g>
      </g>

      {offended && !crop && <ShellFront u={u} />}

      {famItem && (
        <g className="pcw-pet" style={{ animationDelay: `${(hash % 13) / 10}s` }}>
          <FamiliarInline x={146} y={offended ? 196 : 186} size={52} species={famItem.art.style as FamiliarSpecies} colourway={look.familiarColour ?? "ink"} accessory={look.familiarAcc ?? "none"} accent={palette.accent} sleepy={mood === "sleepy"} />
          {petName && (
            <g transform="translate(172 248)">
              <rect x={-petName.length * 2.7 - 5} y={-6.5} width={petName.length * 5.4 + 10} height={12} rx={6} fill="#fff" stroke="#f7a8cf" strokeWidth={1} />
              <text textAnchor="middle" y={3} fontSize={8.5} fontWeight={700} fill="#c2457f" fontFamily="inherit">{petName}</text>
            </g>
          )}
        </g>
      )}
    </svg>
  );
}
