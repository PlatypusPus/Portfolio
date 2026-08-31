# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, both real, neither dominant:

- **Recruiters and internship screeners.** Arrive from a resume link or LinkedIn, scanning for fast evidence that Shovin can build and ship. They want the projects, the stack, and the resume without hunting. The site currently advertises availability for Summer 2026.
- **Peers and the dev community.** Students, Sceptix Club members, MangaloreFOSS attendees, people who found the site after a talk or from GitHub. They already believe he can build; they stay for the personality, the projects, and the fact that the site answers `curl`.

The site must serve a hiring scan and a peer visit from the same pages — there is no separate "recruiter version."

## Product Purpose

The personal portfolio of Shovin Jeson Dsouza, a 4th-year Computer Science & Data Science student at St Joseph Engineering College, Mangalore. It presents who he is, what he has built, where he has spoken, and how to reach him.

Success is a visitor leaving with an accurate, memorable picture of him — and, for the recruiter audience, enough evidence to take the next step.

## Positioning

A builder who ships full applications from scratch — infrastructure, backend and frontend — for friends, family, and anyone curious enough to ask: document retrieval, campus biodiversity data, multi-agent routing, emissions monitoring against BRSR Core. Self-hosts his own infrastructure, ships tools because they are fun rather than because they are portfolio material, and teaches what he learns (Gitea, Linux, Blender, a CS50x-style ARG he designed himself). Gamer first, dev second — stated on the site, not softened.

The site's own presentation is part of the claim: a hand-built terminal environment, not a template.

## Operating Context

- Read on desktop by recruiters mid-scan and on mobile by peers arriving from a link or a talk.
- Entry points are unpredictable — resume PDF, LinkedIn, GitHub, word of mouth after a workshop. Any page can be the first page.
- The résumé (`public/ShovinJesonDsouza.pdf`) is a parallel artifact; the site should not contradict it.

## Capabilities and Constraints

- Astro 7 on Vercel via `@astrojs/vercel`, `output: 'server'` so middleware runs. Pages are edge-cached (`s-maxage=3600`), so they behave like static but middleware still sees every request.
- Routes: `/`, `/about`, `/projects`, `/contact`, `/privacy`, `404`, plus `/tui` (plain-text render) and `/api/contact`.
- **`curl shov.in` returns an ANSI terminal render of the site.** `src/middleware.ts` detects terminal user agents on the site root only; browsers and every subpage fall through untouched. `/tui` returns the same output to any client.
- **In-page terminal** (`src/components/Terminal.astro`), mounted site-wide. Real commands, backtick to open, Esc to close.
- **Contact form** posts to `/api/contact`, which sends through Resend. Needs `RESEND_API_KEY`; optional `CONTACT_FROM` must be a Resend-verified domain. Honeypot field plus a per-instance 30s cooldown. Astro's CSRF origin check rejects cross-origin posts.
- No database and no accounts. The contact form is the only input on the site and nothing it collects is stored here.
- `src/data/profile.ts` is the single source of truth for every fact about Shovin. The pages, the in-page terminal, and the curl render all read from it, so the three surfaces cannot drift.
- `src/data/ascii.ts` holds the ASCII portrait at 56 columns (web) and 40 (terminal), generated from `src/assets/shovin.png`.
- The palette is a single source of truth in `src/tokens.ts`.
- Runtime dependencies: `astro`, `@astrojs/vercel`, `resend`.
- Fonts load from Google Fonts: JetBrains Mono and Press Start 2P.

**Removed 8 August 2026:** the guestbook, along with Clerk auth, Astro DB, and an unused Supabase client. Shovin's call - a guestbook is not something a portfolio needs, and it was the only thing forcing an authentication provider and a hosted database.

## Brand Commitments

- **The terminal / Arch Linux persona is binding.** Green-on-black, monospace type, `$` command prompts, neofetch-style info blocks, panel corner marks, the boot overlay, file-path labels. This is the identity, not a phase to grow out of.
- Name: Shovin Jeson Dsouza. Site identity: `shov.in`.
- Handles: GitHub `PlatypusPus`, LinkedIn `shovindsouza`, Discord `mystic_mc`, email `shovindsouza27@gmail.com`.
- Voice: lowercase, dry, self-aware, unpolished on purpose ("Arch Linux x86_64 (btw)", "breaks things on purpose", "builds for people, not portfolios"). Never corporate.
- Portrait: `src/assets/shovin.png`.

## Evidence on Hand

Real and verifiable:

- **Projects** (`src/data/projects.ts`) — Medical Image Reasoning (2026, repo + live demo), Schizo Chat (2024, repo + live demo).
- **Talks and workshops** — Gitea self-hosting at MangaloreFOSS/Niveus Solutions (Feb 2026), Linux 101 at SJEC (Dec 2025), Blender 101 at SJEC (May 2025), CS50x Puzzle Day ARG at SJEC (Apr 2025).
- **Achievements** — Lead Organizer, HackToFuture 4.0 (3,000+ registrations); ArduPilot Mission Planner contributor via SJEC × Kansas State University (Oct 2024 – Apr 2025); Winner, GDSC Tech Winter Break (Dec 2024).
- **Positions** — Vice President, The Sceptix Club (2025 – present); Member (2023 – 2024).
- **Education** — B.E. Computer Science & Data Science, SJEC (2023 – 2027); Pre-University, St Aloysius PU College (2020 – 2023).
- **Assets** — résumé PDF, portrait, favicons.

Deliberately absent — **never fabricate these**: testimonials, client or employer logos, user counts, traffic or performance metrics, awards not listed above, employment history, pricing or availability claims beyond the Summer 2026 status already on the site.

## Product Principles

1. **Only true things ship.** Every credential, number, and demo on the site is real and checkable. No invented proof, no borrowed credibility, no placeholder content left standing.
2. **Serve the scan and the stay.** A recruiter must reach projects, stack, and résumé fast; a peer must find something worth lingering on. Neither audience gets a degraded version.
3. **The terminal is the identity.** Personality is not decoration layered on a generic portfolio — it is the reason the site is memorable. Preserve it under every change.
4. **Collect as little as possible, and say so exactly.** No accounts, no analytics, no database. The contact form is the single exception and `src/pages/privacy.astro` describes it precisely. Any change to what the site collects updates that page in the same commit.
5. **Any page can be the first page.** Entry is unpredictable; every route stands on its own.
