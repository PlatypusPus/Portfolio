// ── Single source of truth for the palette ──
// Layout.astro emits both themes onto :root as CSS custom properties. Nothing
// else hardcodes a colour; every component reads var(--role), which is what lets
// one attribute on <html> repaint the whole site.
//
// The two palettes mirror each other by *contrast ratio*, not by hue. Each role
// lands within ~0.1 of its counterpart against its own --bg, so a component tuned
// against one theme is already tuned against the other and nothing needs a
// per-theme override. Ratios below are measured, not estimated.
//
// Roles, faintest to strongest:
//   surface        elevated surfaces: project cards
//   border         decorative hairline: panel frames, corner brackets
//   text-faint     decorative only, aria-hidden rails
//   border-strong  interactive boundary: inputs, buttons      AA 1.4.11 (3:1)
//   text-dim       secondary text: prose, meta, nav           AA 1.4.3  (4.5:1)
//   text           primary text
//   text-bright    boot log headers
//   accent         action · focus · active · links
//   amber          secondary accent: metadata keys
//   error          invalid input

/** Phosphor-on-black. Neutrals carry a faint green bias rather than being pure
 *  grey — the cast a real CRT blooms into its greys. */
export const DARK = {
  bg: "#0d0d0d", //            —
  surface: "#131613", //     1.07
  border: "#202421", //      1.24
  "text-faint": "#3e423f", //1.90
  "border-strong": "#606461", // 3.23
  "text-dim": "#8a8e8b", //  5.85
  text: "#c6cac7", //       11.73
  "text-bright": "#e8ece9", //15.94
  accent: "#00ff41", //     14.23
  "accent-rgb": "0 255 65", // same accent, for rgb(… / alpha)
  amber: "#ffb700", //      11.13
  error: "#ff5f56", //       6.50
  // Phosphor bloom behind the display titles. Not a colour — the alpha the
  // accent glow is drawn at, so the two themes can disagree about it.
  bloom: "0.25",
  // Alpha of the terminal grid behind the panels. A light accent on a dark
  // ground carries further than the reverse, so light needs more than this.
  grid: "0.07",
} as const;

/** Ink-on-paper, with the accent carried over as pink. The neutrals take the
 *  same bias treatment in reverse — a touch of red/magenta rather than pure
 *  grey — so the paper reads warm instead of clinical. */
export const LIGHT: Record<keyof typeof DARK, string> = {
  bg: "#fdf7f9", //            —
  surface: "#f7eef2", //     1.07
  border: "#ecdde4", //      1.24
  "text-faint": "#cbb3bd", //1.85
  "border-strong": "#9c8590", // 3.22
  "text-dim": "#6d5c65", //  5.89
  text: "#2a2126", //       14.77
  "text-bright": "#150f13", //17.89
  accent: "#c2185b", //      5.55
  "accent-rgb": "194 24 91", //same accent, for rgb(… / alpha)
  amber: "#8a5300", //       5.98
  error: "#c62828", //       5.31
  // Off. A glow around dark text on a light ground is not bloom, it is a
  // smudge — the effect only reads as light when the room is dark.
  bloom: "0",
  // Higher than dark's: a dark line on paper reads far weaker at the same
  // alpha than a bright line on black does.
  grid: "0.10",
};

/** The swatch row on /about renders these keys as live var() blocks, so it
 *  repaints with the theme instead of pinning one palette's hexes. */
export const SWATCH_KEYS = [
  "bg", "border", "text-faint", "border-strong",
  "text-dim", "text", "accent", "amber",
] as const;

/**
 * The custom pointer, as a data URI. It has to be generated rather than written
 * out twice, because a url() cannot hold a var() — the colours have to be baked
 * into the SVG, so each theme needs its own copy of the whole cursor.
 *
 * The arrow is accent-filled with a background-coloured outline; the pointer
 * variant swaps the two. Either way the outline is the page's own background,
 * which is what keeps the arrow legible over text.
 */
const cursor = (fill: string, stroke: string, width: number) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='24' viewBox='0 0 16 24'%3E%3Cpath d='M1 1 L1 17 L5 13 L8 19 L10 18 L7 12 L13 12 Z' fill='%23${fill.slice(1)}' stroke='%23${stroke.slice(1)}' stroke-width='${width}' stroke-linejoin='round'/%3E%3C/svg%3E") 1 1`;

const decl = (vars: Record<string, string>, scheme: "dark" | "light") =>
  Object.entries(vars).map(([k, v]) => `--${k}:${v}`).join(";") +
  `;--cursor:${cursor(vars.accent, vars.bg, 1)}` +
  `;--cursor-pointer:${cursor(vars.bg, vars.accent, 1.4)}` +
  // Tells form controls, scrollbars and the UA's own default colours which way
  // round we are, so they never end up dark-on-dark.
  `;color-scheme:${scheme}`;

/**
 * Dark is the base, so a visitor with no stored choice and no system preference
 * gets the terminal. Light arrives two ways:
 *
 *   1. the system asks for it — unless the visitor has explicitly pinned dark
 *   2. the visitor picked it, as [data-theme="light"]
 *
 * (2) outranks (1) on specificity: `:where()` holds the media rule down at
 * :root's weight (0,1,0) while the attribute selector is (0,2,0). Pinning dark
 * needs no rule of its own — the :not() drops (1), leaving the base.
 */
export const themeCss = [
  `:root{${decl(DARK, "dark")}}`,
  `@media (prefers-color-scheme: light){:root:where(:not([data-theme="dark"])){${decl(LIGHT, "light")}}}`,
  `:root[data-theme="light"]{${decl(LIGHT, "light")}}`,
].join("");
