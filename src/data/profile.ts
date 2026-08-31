// Single source of truth for everything the site says about Shovin.
//
// The web pages, the in-page terminal, and the `curl shov.in` response all read
// from here. Without this the three surfaces drift and the terminal starts
// telling people something the about page no longer says.

export const IDENTITY = {
  name: "Shovin Jeson Dsouza",
  handle: "shovin",
  host: "portfolio",
  domain: "shov.in",
  role: "4th Year Engineering Student · Building stuff for fun",
  status: "Available · Summer 2026",
  bio: "I'm a 4th year engineering student who likes to play games and build projects for fun. These days I build the whole thing myself: infrastructure, backend and frontend.",
} as const;

export const CONTACT = {
  email: "shovindsouza27@gmail.com",
  github: { label: "PlatypusPus", url: "https://github.com/PlatypusPus" },
  linkedin: { label: "shovindsouza", url: "https://www.linkedin.com/in/shovindsouza/" },
  discord: { label: "mystic_mc", url: null },
  resume: "/ShovinJesonDsouza.pdf",
} as const;

export const NEOFETCH: { k: string; v: string; cursor?: boolean }[] = [
  { k: "OS", v: "Arch Linux x86_64 (btw)" },
  { k: "Host", v: "St Joseph Engineering College" },
  { k: "Kernel", v: "CS & Data-Science · year 4" },
  { k: "Uptime", v: "shipping since 2023" },
  { k: "Shell", v: "builds tools for fun" },
  { k: "Languages", v: "Python, C, JS, C#, Java" },
  { k: "Frameworks", v: "React, Node, FastAPI, .NET" },
  { k: "DevOps", v: "Git, Docker, Linux, Postgres" },
  { k: "Contact", v: "gh/PlatypusPus · in/shovindsouza", cursor: true },
];

export const TRAITS = [
  "ships fast",
  "breaks things on purpose",
  "self-hosts everything",
  "gamer first, dev second",
  "terminal > GUI",
  "builds things people actually use",
  "debugs at 2 AM",
];

export const STACK = [
  { label: "languages", items: ["Python", "C", "JavaScript", "C#", "Java"] },
  { label: "frameworks", items: ["React", "Node", "FastAPI", ".NET"] },
  { label: "tools", items: ["Git", "Docker", "Linux", "Postgres"] },
];

/** Tags the /about log filters by. */
export type LogKind = "role" | "edu" | "talk" | "work" | "award";

export interface TimelineEntry {
  title: string;
  place: string;
  period: string;
  detail: string;
  /**
   * Overrides the tag the log would otherwise take from the list this entry
   * lives in. ACHIEVEMENTS is mixed: organizing a hackathon is a role, not a
   * win, and contributing to ArduPilot is neither.
   */
  kind?: LogKind;
}

export const EDUCATION: TimelineEntry[] = [
  {
    title: "B.E. in Computer Engineering",
    place: "St Joseph Engineering College, Mangalore",
    period: "2023 - 2027",
    detail:
      "Computer Science and Data Science stream.",
  },
  {
    title: "Pre University",
    place: "St Aloysius Pre University College, Mangalore",
    period: "2020 - 2023",
    detail:
      "PCMC",
  },
];

export const TALKS: TimelineEntry[] = [
  {
    title: "Taking Control of your version control using Gitea",
    place: "MangaloreFOSS, Niveus Solutions, Udupi",
    period: "Feb 2026",
    detail:
      "A session on running your own Gitea: Docker deployment, customization, repository mirroring, and why you might want your Git infrastructure on a box you control.",
  },
  {
    title: "Linux 101",
    place: "SJEC",
    period: "Dec 2025",
    detail:
      "Co-ran a Linux workshop for students: the command line, file systems, permissions, and enough terminal to get around.",
  },
  {
    title: "Blender 101",
    place: "SJEC",
    period: "May 2025",
    detail:
      "A first Blender workshop for first-years. We modelled a ninja blade, put modifiers on it, and animated it.",
  },
  {
    title: "CS50x Puzzle Day SJEC",
    place: "SJEC",
    period: "Apr 2025",
    detail:
      "Built and ran an ARG in the style of Harvard's CS50x Puzzle Day: a multi-stage puzzle that taught cryptography by making people use it.",
  },
];

export const ACHIEVEMENTS: TimelineEntry[] = [
  {
    title: "Lead Organizer for HackToFuture 4.0",
    place: "SJEC",
    period: "2026",
    kind: "role",
    detail:
      "Ran a national-level hackathon end to end: logistics, volunteers, and operations. Over 3,000 people registered, from across India.",
  },
  {
    title: "ArduPilot Mission Planner Software Contributor",
    place: "SJEC × Kansas State University (USA)",
    period: "Oct 2024 - Apr 2025",
    kind: "work",
    detail:
      "Worked on ArduPilot's Mission Planner in a joint project between SJEC and Kansas State University. Fixed unit conversions, improved telemetry, tidied the UI, and rebuilt the gauge cluster.",
  },
  {
    title: "Winner of GDSC Tech Winter Break",
    place: "SJEC",
    period: "Dec 2024",
    kind: "award",
    detail:
      "",
  },
];

export const POSITIONS: TimelineEntry[] = [
  { title: "Vice President", place: "The Sceptix Club", period: "2025 - Present", detail: "" },
  { title: "Member", place: "The Sceptix Club", period: "2023 - 2024", detail: "" },
];
