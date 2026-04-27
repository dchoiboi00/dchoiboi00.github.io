# Portfolio Site + GitHub Profile — Design Spec

**Date:** 2026-04-27
**Owner:** Daniel Choi
**Scope:** Redesign of dchoiboi00.github.io and the GitHub profile (`@dchoiboi00`) to support a long-term personal brand as a mid-level full-stack engineer who ships AI/LLM-integrated products.

---

## 1. Brand positioning

**Tagline:** *Engineer turning AI into shipped products.*

**Audience:** Recruiters, hiring managers, and peers in the SWE/AI space. Currently passive — we are not signaling "available for hire."

**Voice:** Craft and substance. Quietly impressive. Looks like someone who ships and cares about the work, not someone marketing themselves.

**Anti-patterns to avoid:**
- Dark-mode + gradient hero treatments that read as "AI startup landing page"
- Lorem ipsum or placeholder content
- Stats cards, GitHub trophies, animated badges, language pie charts
- "Available for hire" / job-seeker language
- Pinning repos that don't yet exist or aren't representative

---

## 2. Site information architecture

```
/                         homepage — masthead, hero, intro, featured project, recent writing
/work                     project index (list of 3–5 projects)
/writing                  writing index (reverse-chronological)
/writing/<slug>           individual post or case study (shared template)
/about                    fuller bio, photo, "currently" block, elsewhere links
```

**Principle:** Long-form substance lives in `/writing/<slug>`. Project pages stay minimal (metadata + GitHub link + link to a case-study post). Writing is the gravity well.

---

## 3. Visual system

### Palette

- **Background:** warm off-white `#f7f4ee`
- **Primary text:** near-black `#1a1a1a`
- **Secondary text (sans):** muted brown-gray `#3d3a35` / `#5d574e`
- **Tertiary metadata:** warm gray `#7a7368`
- **Accent (single, restrained):** deep terracotta `#8b3a2f`
  - Used for: italic accent line in hero, link hover, callout left rules, occasional date or label highlights
  - **No gradients, no dark mode**
- **Hairline rule:** `#d8d2c2` (warm beige)
- **Code block background:** `#1f1d1a` with text `#e8e3d6` (warm dark)

### Typography

- **Display / serif:** Georgia (system serif fallback) for headlines, dek/subtitles, body of long-form posts. Substitute with a warmer serif (e.g., Source Serif Pro, Newsreader, Cormorant) if a custom font is used.
- **UI / sans:** system sans (`-apple-system`, "Inter") for nav, metadata strips, project metadata, "Currently" / "Elsewhere" sections.
- **Italic + accent color** is the signature move on the hero ("*into shipped products.*"). Use sparingly elsewhere.
- Body copy in posts: 16–17px serif, line-height 1.7, max column width ~620px.

### Layout

- Single column, narrow (~640px content width). No sidebars. Generous whitespace.
- Section dividers: hairline rules, never thick borders.

---

## 4. Page specs

### 4.1 Homepage (`/`)

**Above the fold (in order):**

1. **Masthead byline strip** (sans, top of page)
   - Photo (44px circle) + Name (bold) + Role/Location (muted) on the left
   - Nav links on the right: `WORK · WRITING · ABOUT` (uppercase, letter-spaced sans, ~10px)
   - Hairline rule below the strip
2. **Hero** (Georgia serif, 38px on desktop, line-height 1.15)
   - Two lines: `Engineer turning AI` / `*into shipped products.*` — second line italic in accent color
3. **Intro paragraph** (sans, 15px, max ~92% width)
   - Two-sentence intro mentioning current work and the kind of problems pursued.
4. **`FEATURED PROJECT`** strip (uppercase sans label) followed by a project block bordered top + bottom with hairline rules
   - Project block: name (sans, 16px, semibold) + GitHub link (terracotta) on the right; description (13px sans); tag line below (`TypeScript · OpenAI · Zod`)
5. **`RECENT WRITING`** strip + 2–3 line list of recent posts with year on the right.

**Note on the photo:** Use a single real photo (B&W or muted color works best with the palette). Avoid stock or AI-generated portraits. A small portrait taken in natural light is enough.

### 4.2 Post / case-study template (`/writing/<slug>`)

**In order:**

1. Top byline strip (smaller version of homepage masthead; includes "← BACK · WRITING · WORK" on right)
2. Metadata strip: `CASE STUDY · APRIL 2026 · 8 MIN READ` (uppercase, letter-spaced sans, ~10px, terracotta-tinted)
3. Title (Georgia, 32px, weight 500)
4. Italic dek/subtitle (Georgia italic, 17px, line-height 1.4) — one sentence framing the post
5. Body in serif (16px, line-height 1.7)
   - Inline accents: italic in terracotta for emphasis ("*sometimes well-formatted, often not.*")
   - H3 section breaks (Georgia, 19px, weight 600)
6. Code blocks: dark background (`#1f1d1a`), monospaced (`SF Mono`), 12px, soft warm tones for syntax highlighting
7. Callouts: 3px terracotta left rule, light beige background (`#f1ebdc`), sans-serif text, used for "Lesson:" or "Note:" insets
8. Footer (not shown in mockup): "← all writing" link + RSS link

### 4.3 `/work`

- Top masthead byline (same as homepage)
- Page title: serif "Work" + italic dek "Selected projects, mostly around production AI."
- List of project rows separated by hairline rules. Each row contains:
  - **Title** (sans, 13px, semibold) on left + **links** on right (`↗ github · ↗ case study` in terracotta)
  - **Description** (sans, 11px, muted) — one sentence
  - **Tag line** (sans, 9px, letter-spaced, gray) — `2026 · TYPESCRIPT · OSS · ACTIVE`
- **Status tags:** `ACTIVE`, `ARCHIVED`, `CLOSED-SOURCE`. Honesty signal — don't hide that some projects are dormant.

### 4.4 `/writing`

- Top masthead byline.
- Page title: serif "Writing" + italic dek "Notes on shipping AI, engineering practice, and things I'm figuring out."
- Reverse-chronological list. Each entry:
  - Type label + date strip (uppercase sans, terracotta-tinted): `CASE STUDY · APR 2026`, `ESSAY · MAR 2026`, `NOTE · FEB 2026`
  - Title (Georgia, 16px)
  - Italic dek/subtitle (Georgia italic, 12px) — one-sentence summary
- **Three post types:**
  - `CASE STUDY` — long-form, project retrospectives (e.g., CatalogIt auto-mapper)
  - `ESSAY` — opinion / craft pieces
  - `NOTE` — short observations; lower-stakes publishing format
  
  Type labels let short notes coexist with serious case studies without competing visually.

### 4.5 `/about`

- Top masthead byline.
- Two-column header: portrait photo (~92×110px, plain rectangle, no border) on left, page title + dek on right.
- Body in serif (14px): two short paragraphs — what you do, what you do outside work.
- Two strip blocks at the bottom, separated by hairline rules:
  - **`ELSEWHERE`** — `github · linkedin · email · rss`
    - GitHub: `@dchoiboi00`
    - LinkedIn: `linkedin.com/in/danielyoochoi`
    - Email: (your choice — direct or contact form)
    - RSS: `/rss.xml` (auto-generated from /writing)
  - **`CURRENTLY`** — short one-line current focus (mini /now). Update quarterly.
- **No Twitter** (no professional account).
- **No "available for hire" or "open to opportunities" language.**

---

## 5. GitHub profile (`github.com/dchoiboi00`)

### 5.1 Profile README (B — Editorial)

The README lives in `dchoiboi00/dchoiboi00` repo as `README.md`.

**Structure:**

```
# Daniel Choi

Full-stack engineer focused on the messy work of turning AI into shipped products.
Currently at [CatalogIt](https://catalogit.com), building LLM-powered features for collection
management software.

## Currently

- Shipping production AI features at CatalogIt
- Building [schema-mapper](https://github.com/dchoiboi00/schema-mapper) — open-source CSV→schema mapping
- Writing about evals and shipping LLM apps

## Elsewhere

[Site](https://dchoiboi00.github.io) · [Writing](https://dchoiboi00.github.io/writing) · [LinkedIn](https://linkedin.com/in/danielyoochoi)
```

**Mirrors the site's voice exactly.** Update "Currently" once a quarter. The "Elsewhere" links push curious visitors back to the site.

**Skip:** stats cards, language charts, GitHub Trophies, badges, visitor counters, animated GIFs.

### 5.2 Pinned repos strategy

**Now (state B — most ruthless, 2 pins):**
1. `dchoiboi00.github.io` — the personal site
2. `WGAN-Image-Generation` — ML breadth

**Target (state C — 6 pins, fully built out):**
1. `schema-mapper` ⭐ HERO — open-source TS library, CSV→JSON schema with LLMs
2. `dchoiboi00.github.io`
3. `prompt-eval` — eval harness for prompt regression testing
4. `receipt-parser` — vision LLM for receipts → structured JSON
5. `OnlinePoker` (with AI coach extension) — multiplayer poker + hand-history analyzer
6. `WGAN-Image-Generation`

**Path from B → C:** add a pin only when the project has a real, polished README and demoable state. No placeholder pins.

**One-time profile cleanup actions** (not part of this spec's implementation, but to be done in parallel):
- Unpin: `marvel-platform`, `Grammar-Parsing`, `Get-Rich-`, `Street-Mapping`, `OnlinePoker` (until AI coach version is real)
- Pin: `dchoiboi00.github.io`, `WGAN-Image-Generation`
- Do **not** delete the unpinned repos. Orphaned-but-existing reads as honest history; deletion looks like hiding.

### 5.3 Hero repo: `schema-mapper` README structure (advisory)

Not in scope of this design spec, but the design only works if the hero repo's README is polished. When the project is built, its README must include:

- One-sentence description (what it does, who it's for)
- Live demo link (deployed somewhere — Vercel, Cloudflare Pages)
- Quick install + minimal usage example
- A real "before/after" example (input CSV + output mapping)
- Confidence-score / explanation feature highlight
- Architecture brief (which LLMs supported, evaluation strategy)
- Link to the case study on the personal site
- License + contributing notes

---

## 6. Content roadmap

### 6.1 Phase 1: site launch (this spec)

What ships when this design is implemented:

- Homepage with **no `FEATURED PROJECT` block until `schema-mapper` is real.** Until then, the homepage shows masthead → hero → intro → `RECENT WRITING`. This avoids the "vaporware" feel of pinning a project that doesn't exist yet.
- One real case study post: **"Building a CSV-to-schema mapper with LLMs at CatalogIt"** (the production work, written without leaking proprietary code; clear with manager first)
- `/about` page with photo
- GitHub README B + cleaned-up pinned repos (B state)

### 6.2 Phase 2: hero project

- Build and ship `schema-mapper` as an open-source TypeScript library
- Polish its repo README per 5.3
- Add as featured project on homepage and as the third pinned repo

### 6.3 Phase 3: portfolio expansion

Build (in order of priority):

1. **`prompt-eval`** — Jest-style harness for prompt regression testing. Strong dev-tools signal.
2. **`receipt-parser`** — vision LLM extracting line items from receipts. Polished UI, demoable in 10s.
3. **`OnlinePoker` + AI coach** — paste a hand history, get plain-English GTO analysis. Differentiated and personal.

Each project ships with: working live demo, polished README, and a writing post on the personal site.

### 6.4 Writing cadence

Aim for: one substantial post per month (case study or essay), supplemented by short notes ad hoc. Type labels (CASE STUDY / ESSAY / NOTE) let lighter content coexist with deeper pieces.

---

## 7. Tech stack considerations (for implementation plan)

The current site (`dchoiboi00.github.io`) uses an unknown template — needs investigation as the first implementation step. Options for the redesign, in order of fit:

- **Astro** *(recommended)* — first-class Markdown/MDX support for posts, easy custom HTML/CSS for the design, fast static output, deploys cleanly to GitHub Pages. Best fit for editorial sites where typography and content are central.
- **Eleventy (11ty)** — simpler than Astro, no JS framework, full control over templates. Strong choice if Astro's component model feels like overkill.
- **Next.js (static export)** — overkill for this site; only choose if there's a future plan for dynamic features.
- **Plain HTML + CSS** — viable if you'll only have 5–10 pages and don't expect to add posts often. Fast to build, painful at scale.

The implementation plan should make this decision based on:
- How much content (posts) you expect over the first year
- Whether you want Markdown authoring for posts
- Whether GitHub Pages is the deploy target (all options support it)

---

## 8. Out of scope

- Comments / interactivity on posts (use a link to your email for feedback if desired)
- Newsletter integration (consider adding only after writing cadence is established)
- Dark mode (intentionally avoided — a single warm light palette is the brand)
- Search (small site; OS-level browser search is enough for now)
- Analytics platform choice (mentioned during implementation; recommend Plausible or none)

---

## 9. Open questions — resolved

1. **Photo:** ✅ Has a portrait photo ready to use.
2. **CatalogIt case-study NDA check:** ✅ Safe to publish.
3. **Tech stack pick:** ✅ **Astro.** Existing site is plain HTML (2 files, no framework, no content) — starting fresh. Astro adds Markdown post authoring, shared component layout for the masthead, and static output for GitHub Pages.
4. **Domain:** ✅ Keep `dchoiboi00.github.io` for now. Custom domain is a future option (e.g., `danielchoi.dev`) — Astro + GitHub Pages supports this with a `CNAME` file and no other changes.
5. **Existing site repo state:** ✅ Plain HTML/CSS only (`index.html` + `portfolio-item.html`). Starting fresh — no migration needed.

---

## 10. Next step

Once this spec is approved, the next step is to invoke the **`writing-plans`** skill to produce a detailed implementation plan covering: tech stack pick, file/folder layout, component structure, content migration steps, and a build/deploy checklist for GitHub Pages.
