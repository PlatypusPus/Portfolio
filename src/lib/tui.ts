// The `curl shov.in` response. Same facts as the site, rendered for an 80-column
// terminal with real ANSI colour.
//
// Kept separate from the middleware so it stays testable and so the /tui route
// can reuse it verbatim.

import {
  IDENTITY, CONTACT, NEOFETCH, STACK, TALKS, ACHIEVEMENTS, EDUCATION, POSITIONS,
} from "../data/profile";
import { PROJECTS } from "../data/projects";

const E = "\x1b[";
const C = {
  reset: `${E}0m`,
  green: `${E}38;5;46m`,
  amber: `${E}38;5;214m`,
  dim: `${E}38;5;245m`,
  bold: `${E}1m`,
} as const;

/** Wrap `text` to `width`, indenting continuation lines by `indent` spaces. */
function wrap(text: string, width: number, indent = 0): string[] {
  const pad = " ".repeat(indent);
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if (line && line.length + 1 + w.length > width) {
      lines.push(pad + line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) lines.push(pad + line);
  return lines;
}

const WIDTH = 76;

function rule(): string {
  return `${C.dim}${"-".repeat(WIDTH)}${C.reset}`;
}

function heading(label: string): string[] {
  return ["", `${C.amber}${label}${C.reset}`, rule()];
}

function entries(rows: typeof TALKS, color = false): string[] {
  const out: string[] = [];
  for (const r of rows) {
    out.push(`  ${C.green}${r.title}${C.reset}`);
    out.push(`  ${C.dim}${r.place} - ${r.period}${C.reset}`);
    if (r.detail) out.push(...wrap(r.detail, WIDTH - 4, 4).map((l) => `${C.dim}${l}${C.reset}`));
    out.push("");
  }
  return out;
}

/** ANSI-coloured output for curl / wget / httpie. */
export function renderTui(): string {
  const L: string[] = [];

  // Header: the neofetch block, no art. A photo-derived ASCII portrait was tried
  // and cut; a real designed wordmark would be the thing to add here, not a
  // luminance-ramped JPEG.
  L.push("");
  L.push(`  ${C.bold}${C.green}${IDENTITY.handle}@${IDENTITY.host}${C.reset}`);
  L.push(`  ${C.dim}${"-".repeat(30)}${C.reset}`);
  for (const r of NEOFETCH) {
    L.push(`  ${C.amber}${r.k.padEnd(11)}${C.reset} ${r.v}`);
  }

  L.push(...heading("ABOUT"));
  L.push(...wrap(IDENTITY.bio, WIDTH, 2));
  L.push("");
  L.push(`  ${C.dim}${IDENTITY.role}${C.reset}`);
  L.push(`  ${C.green}${IDENTITY.status}${C.reset}`);

  L.push(...heading("STACK"));
  for (const row of STACK) {
    L.push(`  ${C.amber}${(row.label + "/").padEnd(13)}${C.reset}${row.items.join("  ")}`);
  }

  L.push(...heading("PROJECTS"));
  for (const p of PROJECTS) {
    L.push(`  ${C.green}${p.name}${C.reset} ${C.dim}(${p.year})${C.reset}`);
    L.push(...wrap(p.desc, WIDTH - 4, 4).map((l) => `${C.dim}${l}${C.reset}`));
    L.push(`    ${C.amber}[${p.tags.join(", ")}]${C.reset}`);
    if (p.repo) L.push(`    ${C.dim}repo: ${p.repo}${C.reset}`);
    if (p.live) L.push(`    ${C.dim}live: ${p.live}${C.reset}`);
    L.push("");
  }

  L.push(...heading("TALKS & WORKSHOPS"));
  L.push(...entries(TALKS));

  L.push(...heading("ACHIEVEMENTS"));
  L.push(...entries(ACHIEVEMENTS));

  L.push(...heading("EDUCATION & POSITIONS"));
  L.push(...entries([...EDUCATION, ...POSITIONS]));

  L.push(...heading("CONTACT"));
  L.push(`  ${C.amber}${"email".padEnd(11)}${C.reset}${CONTACT.email}`);
  L.push(`  ${C.amber}${"github".padEnd(11)}${C.reset}github.com/${CONTACT.github.label}`);
  L.push(`  ${C.amber}${"linkedin".padEnd(11)}${C.reset}linkedin.com/in/${CONTACT.linkedin.label}`);
  L.push(`  ${C.amber}${"discord".padEnd(11)}${C.reset}${CONTACT.discord.label}`);
  L.push(`  ${C.amber}${"resume".padEnd(11)}${C.reset}https://${IDENTITY.domain}${CONTACT.resume}`);

  L.push("");
  L.push(rule());
  L.push(`${C.dim}  Rendered for your terminal. The browser version lives at${C.reset} ${C.green}https://${IDENTITY.domain}${C.reset}`);
  L.push("");

  return L.join("\n") + "\n";
}

/** True when the request came from a terminal HTTP client rather than a browser. */
export function isTerminalClient(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return /\b(curl|wget|httpie|HTTPie|lwp-request|libwww-perl|python-requests|got|powershell)\b/i
    .test(userAgent);
}
