"use client";
// The compact: the little case the whole world opens out of. Three motif families share one component:
//   analog     a round enamel compact on cream paper, washi tape label, date stamp
//   cyberpunk  a plum cyberdeck bezel with gold screws, a soft-scanline screen and a blinking prompt
//   y2k-blog   a cream OS-9 window with a plum title bar, three gold buttons and a hit counter
// Colours come from the world's chrome (style.json), the structure from WORLD.motif (coven.config.json).
import type { ReactNode } from "react";
import { useArt } from "./ArtContext";
import type { Chrome, Motif } from "@/lib/game/types";
import { darken, lighten, starPath } from "./colour";

function Lid({ chrome, size = 220 }: { chrome: Chrome; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden>
      <circle cx={100} cy={100} r={96} fill={chrome.rim} />
      <circle cx={100} cy={100} r={88} fill={chrome.case} />
      <circle cx={100} cy={100} r={74} fill="none" stroke={chrome.rim} strokeWidth={1.4} strokeDasharray="2 5" />
      <path d="M118 62 A42 42 0 1 0 118 138 A33 33 0 1 1 118 62 Z" fill={chrome.rim} />
      {[[140, 70, 6], [150, 104, 4], [132, 136, 5], [64, 58, 3.4]].map(([x, y, r]) => <path key={`${x}${y}`} d={starPath(x, y, r, 0.4)} fill={chrome.rim} />)}
      <circle cx={100} cy={196} r={6} fill={darken(chrome.rim, 0.25)} />
    </svg>
  );
}

function Screws({ colour }: { colour: string }) {
  return (
    <>
      {["left-2 top-2", "right-2 top-2", "left-2 bottom-2", "right-2 bottom-2"].map((pos) => (
        <span key={pos} aria-hidden className={`absolute ${pos} grid h-3 w-3 place-items-center rounded-full`} style={{ background: colour }}>
          <span className="block h-[1.5px] w-2 rotate-45" style={{ background: darken(colour, 0.5) }} />
        </span>
      ))}
    </>
  );
}

export function Compact({
  open,
  onToggle,
  children,
  motif,
  chrome,
  title,
  slug,
}: {
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  motif?: Motif;
  chrome?: Chrome;
  title?: string;
  slug?: string;
}) {
  const art = useArt();
  motif ??= art.motif;
  chrome ??= art.chrome;
  title ??= art.name;
  slug ??= art.slug;
  if (motif === "cyberpunk") {
    return (
      <div className="relative w-full rounded-[22px] p-3 pb-4" data-motif="cyberpunk" style={{ background: chrome.case, boxShadow: `0 14px 30px -14px ${darken(chrome.case, 0.6)}` }}>
        <Screws colour={chrome.rim} />
        <button type="button" onClick={onToggle} className="mb-2 flex w-full items-center justify-between px-3 pt-1 text-left" aria-expanded={open} aria-label={open ? "Close the world" : "Open the world"}>
          <span className="font-pixel text-[11px] tracking-wide" style={{ color: chrome.lining }}>
            {slug}:~$ {open ? "world --open" : "wake"}
            <span className="cursor-block ml-1 inline-block h-3 w-2 align-middle" style={{ background: chrome.accent }} />
          </span>
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2 w-2 rounded-full" style={{ background: chrome.accent }} />
            <span className="h-2 w-2 rounded-full" style={{ background: chrome.rim }} />
          </span>
        </button>
        <div className="crt relative overflow-hidden rounded-[14px] p-1" style={{ background: darken(chrome.case, 0.55), border: `2px solid ${darken(chrome.case, 0.3)}`, color: chrome.lining }}>
          {open ? children : (
            <button type="button" onClick={onToggle} className="grid h-56 w-full place-items-center">
              <span className="font-pixel text-sm" style={{ color: chrome.lining }}>press to wake {title}</span>
            </button>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1 px-3" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => <span key={i} className="h-1.5 flex-1 rounded-[1px]" style={{ background: i < 9 ? chrome.rim : lighten(chrome.case, 0.2) }} />)}
        </div>
      </div>
    );
  }

  if (motif === "y2k-blog") {
    return (
      <div className="w-full overflow-hidden rounded-[6px]" data-motif="y2k-blog" style={{ background: chrome.lining, border: `2px solid ${chrome.ink}`, boxShadow: `4px 4px 0 ${darken(chrome.case, 0.2)}` }}>
        <button type="button" onClick={onToggle} className="flex w-full items-center gap-2 px-2 py-1.5" style={{ background: chrome.case }} aria-expanded={open} aria-label={open ? "Close the world" : "Open the world"}>
          <span className="flex gap-1" aria-hidden>
            {[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-full" style={{ background: chrome.rim, border: `1px solid ${darken(chrome.rim, 0.4)}` }} />)}
          </span>
          <span className="font-pixel flex-1 truncate text-center text-[11px]" style={{ color: chrome.lining }}>{slug}.exe</span>
          <span className="w-10" aria-hidden />
        </button>
        <div className="p-2" style={{ color: chrome.ink }}>
          {open ? children : (
            <button type="button" onClick={onToggle} className="grid h-56 w-full place-items-center rounded" style={{ background: lighten(chrome.accent, 0.6) }}>
              <span className="font-pixel text-sm" style={{ color: chrome.ink }}>double-click to open {title} ✧</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 border-t px-2 py-1 font-mono text-[10px]" style={{ borderColor: chrome.ink, color: chrome.ink }}>
          <span>you are visitor no. 000,777</span>
          <span>mood: witchy ✧</span>
        </div>
      </div>
    );
  }

  // analog
  return (
    <div className="relative flex w-full flex-col items-center" data-motif="analog">
      <button type="button" onClick={onToggle} className={`relative z-10 transition-transform duration-500 ${open ? "-mb-24 scale-[0.55]" : ""}`} aria-expanded={open} aria-label={open ? "Close the world" : "Open the world"}>
        <Lid chrome={chrome} />
        <span className="washi absolute -bottom-1 left-1/2 -translate-x-1/2 -rotate-3 whitespace-nowrap px-3 py-0.5 font-mono text-[11px]" style={{ background: lighten(chrome.accent, 0.35), color: chrome.ink }}>
          {title}
        </span>
      </button>
      {open && (
        <div className="paper relative w-full rounded-[28px] p-3 pt-20" style={{ background: chrome.lining, border: `5px solid ${chrome.rim}`, boxShadow: `0 16px 30px -18px ${darken(chrome.case, 0.5)}` }}>
          {children}
          <span className="absolute right-4 top-4 rotate-6 rounded-sm border px-1.5 font-mono text-[10px]" style={{ borderColor: chrome.case, color: chrome.case }}>
            EST. {new Date().getFullYear()}
          </span>
        </div>
      )}
    </div>
  );
}
