// ── Single source of truth for the palette ──
// Layout.astro emits these onto <html> as CSS custom properties, and about.astro
// reads them to render the neofetch swatch row from the real values rather than
// a hand-copied list. Two consumers, one definition.
//
// Contrast ratios are against --bg (#0d0d0d). Roles, darkest to lightest:
export const COLORS = {
  bg: "#0d0d0d", //            canvas
  surface: "#131613", //       elevated surfaces: project cards        1.07
  border: "#202421", //        decorative hairline: panel frames       1.24
  "text-faint": "#3e423f", //  decorative only, aria-hidden rails      1.90
  "border-strong": "#606461", //interactive boundary: inputs, buttons  3.23  AA 1.4.11
  "text-dim": "#8a8e8b", //    secondary text: prose, meta, nav        5.85  AA 1.4.3
  text: "#c6cac7", //          primary text                           11.73
  "text-bright": "#e8ece9", // boot log headers                       15.94
  green: "#00ff41", //         accent · action · focus · active       14.23
  "green-rgb": "0 255 65", //  same green, for rgb(… / alpha)
  amber: "#ffb700", //         secondary accent: metadata keys        11.13
  error: "#ff5f56", //         invalid input                           6.50
} as const;

// Neutrals carry a faint phosphor bias (green channel up, red down) rather than
// being pure grey — the same cast a real CRT terminal blooms into its greys.
export const rootVars = Object.entries(COLORS)
  .map(([k, v]) => `--${k}:${v}`)
  .join(";");
