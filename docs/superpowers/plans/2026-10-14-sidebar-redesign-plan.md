# Sidebar Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every page of dchoiboi00.github.io in the approved Sidebar + Plain index design, with Projects replacing Work and Writing.

**Architecture:** Project facts move into one data file (`src/data/projects.ts`) that the home page, the Projects page, and the case study layout all read. Two layouts: `SidebarLayout` (home and Projects) and `CaseStudy` (one reading column). Old URLs forward through Astro's `redirects` setting, which writes meta refresh pages on a static build.

**Tech Stack:** Astro 6 (static output), TypeScript, plain CSS, Google Fonts (Schibsted Grotesk, Literata), `node --test` with Node 24's built-in TypeScript support (no new packages).

**Spec:** `docs/superpowers/specs/2026-10-14-sidebar-redesign-design.md`

## Global Constraints

- Colors: `--paper #ffffff`, `--ink #1d1e20`, `--ink-soft #565b62`, `--rule #e2e4e8`, `--link #1a4fd0`, `--visited #6a3d9a`. No other accent colors.
- Fonts: Schibsted Grotesk 400–900 for name, headings, nav, labels, facts; Literata 400/600 + italic for bio, summaries, About, case study body. Drop Lora, Newsreader, Source Sans 3.
- Role line is two lines, each kept on one line: "Full Stack Software Engineer at CatalogIt", then "Los Angeles".
- Bio: "I take product features from idea to production, lately with a lot of AI in them."
- No word splits across lines, including at hyphens: template strings go through `keepHyphenatedWords`, Markdown through the existing rehype plugin.
- Links are blue and underlined, purple once visited. No uppercase letter-spaced labels, no middle-dot strings, no arrows appended to links, no visual timeline, no highlighter.
- Diagrams in `public/work/*.svg` are not restyled.
- Case study slugs stay the same. `/work`, `/writing`, `/writing/[slug]`, `/about` forward to `/projects`, `/projects`, `/projects/[slug]`, `/#about`.
- The user approves every commit (file list and message) before it's made. Tasks end with a proposed commit, not a commit.

## Review Focus

1. Someone opens an old shared link like `/writing/csv-schema-mapper-at-catalogit` and lands on the same case study at `/projects/...`. Pinned by `scripts/check-links.mjs` in Task 6.
2. A project in `projects.ts` without a matching Markdown file, or the reverse, fails the build or the tests instead of rendering a broken page. Pinned by `projects.test.ts` in Task 1 and `findProject` throwing in Task 4.
3. A reader scrolls to the bottom of a tall screen and the About link becomes current even though the About section never reaches the trigger band. Pinned by the bottom-of-page rule in the sidebar script in Task 3, checked in Task 6.
4. At 320px wide, the role lines, email, and long project names stay on one line each with no sideways scrolling. Checked by the broken-word script in Task 6.
5. A project name or summary containing `&` or `<` renders as text, not markup, when passed through `set:html`. Pinned by the escaping test in Task 1.

---

## File Map

```
src/
├── data/
│   ├── projects.ts              # NEW: one record per project, plus helpers
│   └── projects.test.ts         # NEW: data checks (slugs, dates, files exist)
├── lib/
│   ├── keep-hyphenated-words.mjs        # existing
│   ├── keep-hyphenated-words.test.mjs   # NEW
│   ├── project-dates.ts         # NEW: "Apr – Jun 2026", "2 months"
│   └── project-dates.test.ts    # NEW
├── components/
│   ├── Facts.astro              # NEW: Result / Built with / When rows
│   ├── Sidebar.astro            # NEW: photo, name, role, bio, nav, contact
│   ├── ProjectFeature.astro     # NEW: the large featured project
│   ├── ProjectRows.astro        # NEW: thumbnail + dates + title + summary + result
│   └── Masthead.astro           # DELETE
├── layouts/
│   ├── Base.astro               # MODIFY: new fonts, no footer
│   ├── SidebarLayout.astro      # NEW: sidebar + main column
│   ├── CaseStudy.astro          # NEW: replaces Post.astro
│   └── Post.astro               # DELETE
├── pages/
│   ├── index.astro              # REWRITE
│   ├── 404.astro                # REWRITE
│   ├── projects/index.astro     # NEW
│   ├── projects/[slug].astro    # NEW (moved from writing/[slug].astro)
│   ├── work.astro               # DELETE (redirect)
│   ├── about.astro              # DELETE (redirect)
│   └── writing/                 # DELETE both files (redirects)
├── content/writing/*.md         # MODIFY: remove the first image line
└── styles/global.css            # REWRITE
scripts/check-links.mjs          # NEW
public/favicon.svg               # REWRITE
astro.config.mjs                 # MODIFY: redirects
package.json                     # MODIFY: test and check:links scripts
README.md                        # MODIFY: where things live
```

---

### Task 1: Project data, date helpers, and tests

**Files:**
- Create: `src/lib/project-dates.ts`, `src/lib/project-dates.test.ts`
- Create: `src/data/projects.ts`, `src/data/projects.test.ts`
- Create: `src/lib/keep-hyphenated-words.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `formatPeriod(start: string, end: string): string`, `formatLength(start: string, end: string): string` from `src/lib/project-dates.ts`.
- Produces: `interface Project`, `projects: Project[]`, `projectWhen(p: Project): string`, `newestFirst(a: Project, b: Project): number`, `findProject(slug: string): Project` from `src/data/projects.ts`.

- [ ] **Step 1: Add the test script**

In `package.json` `scripts`, add:

```json
"test": "node --test \"src/**/*.test.*\"",
"check:links": "node scripts/check-links.mjs"
```

- [ ] **Step 2: Write the failing date tests**

`src/lib/project-dates.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatLength, formatPeriod } from './project-dates.ts';

test('formatLength counts short projects in weeks', () => {
  assert.equal(formatLength('2026-06-26', '2026-07-08'), '2 weeks');
  assert.equal(formatLength('2026-09-08', '2026-09-30'), '3 weeks');
  assert.equal(formatLength('2026-01-01', '2026-01-03'), '1 week');
});

test('formatLength counts longer projects in months', () => {
  assert.equal(formatLength('2026-04-14', '2026-06-05'), '2 months');
  assert.equal(formatLength('2025-10-08', '2026-02-05'), '4 months');
});

test('formatPeriod shortens the range when the year or month repeats', () => {
  assert.equal(formatPeriod('2025-10-08', '2026-02-05'), 'Oct 2025 – Feb 2026');
  assert.equal(formatPeriod('2026-04-14', '2026-06-05'), 'Apr – Jun 2026');
  assert.equal(formatPeriod('2026-09-08', '2026-09-30'), 'Sep 2026');
});

test('both reject an end date before the start date', () => {
  assert.throws(() => formatLength('2026-02-01', '2026-01-01'), /ends before it starts/);
  assert.throws(() => formatPeriod('2026-02-01', '2026-01-01'), /ends before it starts/);
});
```

- [ ] **Step 3: Run it to confirm it fails**

Run: `npm test`
Expected: FAIL, cannot find module `./project-dates.ts`.

- [ ] **Step 4: Write the date helpers**

`src/lib/project-dates.ts`:

```ts
// Project dates are 'YYYY-MM-DD' strings so the data file stays readable.
// Parsing in UTC keeps the day count the same in every time zone.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 24 * 60 * 60 * 1000;

const parse = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, time: Date.UTC(year, month - 1, day) };
};

const checkOrder = (start: string, end: string) => {
  if (parse(end).time < parse(start).time) {
    throw new Error(`Project ends before it starts: ${start} to ${end}`);
  }
};

/** "Oct 2025 – Feb 2026", "Apr – Jun 2026", or "Sep 2026". */
export function formatPeriod(start: string, end: string): string {
  checkOrder(start, end);
  const from = parse(start);
  const to = parse(end);
  const fromMonth = MONTHS[from.month - 1];
  const toMonth = MONTHS[to.month - 1];
  if (from.year !== to.year) return `${fromMonth} ${from.year} – ${toMonth} ${to.year}`;
  if (from.month !== to.month) return `${fromMonth} – ${toMonth} ${to.year}`;
  return `${toMonth} ${to.year}`;
}

/** Weeks for projects under six weeks ("3 weeks"), months otherwise ("4 months"). */
export function formatLength(start: string, end: string): string {
  checkOrder(start, end);
  const days = (parse(end).time - parse(start).time) / DAY_MS;
  if (days < 42) {
    const weeks = Math.max(1, Math.round(days / 7));
    return weeks === 1 ? '1 week' : `${weeks} weeks`;
  }
  const months = Math.round(days / 30.44);
  return months === 1 ? '1 month' : `${months} months`;
}
```

- [ ] **Step 5: Run the date tests**

Run: `npm test`
Expected: the four date tests PASS.

- [ ] **Step 6: Write the failing project data tests**

`src/data/projects.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { findProject, newestFirst, projects } from './projects.ts';

const root = new URL('../../', import.meta.url);

test('every project has a case study and a diagram on disk', () => {
  for (const project of projects) {
    assert.ok(existsSync(new URL(`src/content/writing/${project.slug}.md`, root)), `missing Markdown for ${project.slug}`);
    assert.ok(existsSync(new URL(`public${project.diagram}`, root)), `missing diagram ${project.diagram}`);
  }
});

test('slugs are unique and exactly one project is featured', () => {
  assert.equal(new Set(projects.map((p) => p.slug)).size, projects.length);
  assert.equal(projects.filter((p) => p.featured).length, 1);
});

test('each result starts with the part set in bold', () => {
  for (const project of projects) {
    assert.ok(project.result.startsWith(project.resultLead), project.slug);
  }
});

test('newestFirst orders by end date', () => {
  const ends = [...projects].sort(newestFirst).map((p) => p.end);
  assert.deepEqual(ends, [...ends].sort().reverse());
});

test('findProject throws for a slug with no project', () => {
  assert.throws(() => findProject('no-such-post'), /No project in src\/data\/projects.ts/);
});
```

- [ ] **Step 7: Write the project data**

`src/data/projects.ts`:

```ts
// One record per project. The home page, the Projects page, and each case
// study read from here, so a date or result is written once.
import { formatLength, formatPeriod } from '../lib/project-dates.ts';

export interface Project {
  /** Matches a Markdown file in src/content/writing. */
  slug: string;
  name: string;
  summary: string;
  /** Shown as a fact on the featured project and the case study. */
  result: string;
  /** The start of `result` that's set in bold on project rows. */
  resultLead: string;
  builtWith: string[];
  /** 'YYYY-MM-DD', from the first substantial PR to the last one merged. */
  start: string;
  end: string;
  diagram: string;
  diagramAlt: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    slug: 'csv-schema-mapper-at-catalogit',
    name: 'CSV auto-mapper',
    summary:
      "An LLM pipeline that maps the columns of a customer's spreadsheet to CatalogIt's fields, so museums can import decades of records without a setup call. The model writes a short profile of each column, and embedding search and past imports do the matching.",
    result: 'A full CSV mapped in 15–30 seconds',
    resultLead: 'A full CSV mapped in 15–30 seconds',
    builtWith: ['TypeScript', 'LLMs', 'embeddings', 'Redis'],
    start: '2025-10-08',
    end: '2026-02-05',
    diagram: '/work/csv-mapper-diagram.svg',
    diagramAlt: 'Spreadsheet columns on the left, each connected to the CatalogIt field it maps to on the right',
    featured: true,
  },
  {
    slug: 'zero-downtime-billing-migration-at-catalogit',
    name: 'Billing migration',
    summary:
      'Moved every account from per-user to per-account Stripe billing, with webhooks upgraded in phases and a staged rollout.',
    result: '$800K ARR across 3,000 paying accounts, zero downtime',
    resultLead: '$800K ARR',
    builtWith: ['TypeScript', 'Stripe'],
    start: '2026-04-14',
    end: '2026-06-05',
    diagram: '/work/billing-migration-diagram.svg',
    diagramAlt: 'The migration in order: run both webhook endpoints, cut over, backfill 1,535 accounts, roll out in stages',
    featured: false,
  },
  {
    slug: 'account-capacity-enforcement-at-catalogit',
    name: 'Plan limit enforcement',
    summary:
      'A 15-day countdown for 600 over-limit accounts, ending in a read-only freeze that lifts the moment they pay.',
    result: '+15% MRR in the first month',
    resultLead: '+15% MRR',
    builtWith: ['TypeScript', 'scheduled jobs'],
    start: '2026-09-08',
    end: '2026-09-30',
    diagram: '/work/capacity-enforcement-diagram.svg',
    diagramAlt: 'A daily scan feeds a 15-day countdown of in-app notices and emails, then a freeze on day 15 that lifts on payment',
    featured: false,
  },
  {
    slug: 'adjust-plan-wizard-xstate-at-catalogit',
    name: 'Adjust Plan wizard',
    summary:
      'The plan-change checkout, rebuilt as one XState state machine with four steps and three async calls.',
    result: '7 stacked PRs, one state machine that never changed',
    resultLead: '7 stacked PRs',
    builtWith: ['TypeScript', 'React', 'XState', 'Stripe'],
    start: '2026-06-26',
    end: '2026-07-08',
    diagram: '/work/xstate-wizard-diagram.svg',
    diagramAlt: 'Statechart of the wizard: adjust, preview, payment, committing, success, with a shortcut that skips payment',
    featured: false,
  },
];

/** "Apr – Jun 2026, 2 months" */
export const projectWhen = (project: Project) =>
  `${formatPeriod(project.start, project.end)}, ${formatLength(project.start, project.end)}`;

export const newestFirst = (a: Project, b: Project) => b.end.localeCompare(a.end);

export function findProject(slug: string): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`No project in src/data/projects.ts for case study "${slug}"`);
  return project;
}
```

- [ ] **Step 8: Write the keepHyphenatedWords tests**

`src/lib/keep-hyphenated-words.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keepHyphenatedWords, rehypeKeepHyphenatedWords } from './keep-hyphenated-words.mjs';

test('wraps words joined by a hyphen or en dash', () => {
  assert.equal(
    keepHyphenatedWords('A CSV-to-schema mapper, 15–30 seconds'),
    'A <span class="nowrap">CSV-to-schema</span> mapper, <span class="nowrap">15–30</span> seconds',
  );
});

test('leaves a dash with spaces around it alone', () => {
  assert.equal(keepHyphenatedWords('Apr – Jun 2026'), 'Apr – Jun 2026');
});

test('escapes markup so names render as text', () => {
  assert.equal(keepHyphenatedWords('Tom & <Jerry>'), 'Tom &amp; &lt;Jerry&gt;');
});

test('the rehype plugin wraps text but skips code', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'element', tagName: 'p', properties: {}, children: [{ type: 'text', value: 'a dry-run first' }] },
      { type: 'element', tagName: 'code', properties: {}, children: [{ type: 'text', value: 'user-id' }] },
    ],
  };
  rehypeKeepHyphenatedWords()(tree);
  const [paragraph, code] = tree.children;
  assert.equal(paragraph.children[1].tagName, 'span');
  assert.equal(paragraph.children[1].children[0].value, 'dry-run');
  assert.deepEqual(code.children, [{ type: 'text', value: 'user-id' }]);
});
```

- [ ] **Step 9: Run all tests**

Run: `npm test`
Expected: all tests PASS (4 date, 5 data, 4 hyphen).

- [ ] **Step 10: Propose the commit**

Files: `package.json`, `src/lib/project-dates.ts`, `src/lib/project-dates.test.ts`, `src/data/projects.ts`, `src/data/projects.test.ts`, `src/lib/keep-hyphenated-words.test.mjs`. Message: "Add project data with dates, and tests".

---

### Task 2: New tokens, fonts, base layout, favicon

**Files:**
- Rewrite: `src/styles/global.css`
- Modify: `src/layouts/Base.astro`
- Rewrite: `public/favicon.svg`

**Interfaces:**
- Produces: CSS variables `--paper --ink --ink-soft --rule --link --visited --grotesk --text`; global classes `.nowrap` and `.site-foot`.
- Produces: `Base.astro` props `{ title?: string; description?: string; ogType?: 'website' | 'article' }`, renders `<slot />` only (no footer).

- [ ] **Step 1: Rewrite `src/styles/global.css`**

```css
/* src/styles/global.css
   White page, ink text, blue underlined links. Schibsted Grotesk for names,
   headings, and UI; Literata for reading text. */

:root {
  --paper: #ffffff;
  --ink: #1d1e20;
  --ink-soft: #565b62;
  --rule: #e2e4e8;
  --link: #1a4fd0;
  --visited: #6a3d9a;

  --grotesk: "Schibsted Grotesk", "Helvetica Neue", Arial, sans-serif;
  --text: "Literata", Georgia, serif;
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--grotesk);
  font-size: 18px;
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; height: auto; }

a { color: var(--link); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:visited { color: var(--visited); }
a:hover { text-decoration-thickness: 2px; }
a:focus-visible { outline: 2px solid var(--link); outline-offset: 2px; border-radius: 2px; }

h1, h2, h3 { text-wrap: balance; }
p { text-wrap: pretty; }

.nowrap { white-space: nowrap; }

.site-foot { margin: 80px 0 0; color: var(--ink-soft); font-size: 15px; }
```

- [ ] **Step 2: Update `src/layouts/Base.astro`**

Keep the props, title logic, canonical URL, and link-preview tags as they are. Replace the font `<link>` and the body:

```astro
    <link
      href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&family=Schibsted+Grotesk:wght@400..900&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Rewrite `public/favicon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#1d1e20"/>
  <text x="16" y="23" text-anchor="middle" font-family="'Helvetica Neue', Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">D</text>
</svg>
```

- [ ] **Step 4: Check it builds**

Run: `npm run build`
Expected: builds. Pages still use the old components, so they look unstyled; that's fixed in Tasks 3–5.

- [ ] **Step 5: Propose the commit** (can be folded into Task 3's commit, since the site looks broken between them)

---

### Task 3: Sidebar layout and home page

**Files:**
- Create: `src/components/Sidebar.astro`, `src/components/Facts.astro`, `src/components/ProjectFeature.astro`, `src/components/ProjectRows.astro`
- Create: `src/layouts/SidebarLayout.astro`
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Consumes: `Project`, `projects`, `projectWhen`, `newestFirst` (Task 1); `keepHyphenatedWords` (existing).
- Produces: `SidebarLayout` props `{ title?: string; description?: string; links: { href: string; label: string; current?: boolean }[]; trackSections?: boolean; nameIsHeading?: boolean }`. `Sidebar` takes the same `links` shape, written out in both files.
- Produces: `Facts` props `{ items: { label: string; value: string }[] }`; `ProjectRows` props `{ projects: Project[] }`; `ProjectFeature` props `{ project: Project }`.

- [ ] **Step 1: `src/components/Facts.astro`**

```astro
---
// src/components/Facts.astro
import { keepHyphenatedWords } from '../lib/keep-hyphenated-words.mjs';

interface Props {
  items: { label: string; value: string }[];
}

const { items } = Astro.props;
---

<dl class="facts">
  {items.map((item) => (
    <div>
      <dt>{item.label}</dt>
      <dd set:html={keepHyphenatedWords(item.value)} />
    </div>
  ))}
</dl>

<style>
  .facts {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    margin: 0 0 18px;
    font-size: 15.5px;
  }
  dt { color: var(--ink-soft); }
  dd { margin: 0; font-weight: 600; }

  @media (max-width: 640px) {
    .facts { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  }
</style>
```

- [ ] **Step 2: `src/components/Sidebar.astro`**

```astro
---
// src/components/Sidebar.astro
interface Props {
  links: { href: string; label: string; current?: boolean }[];
  /** Mark the link for the section in view as the reader scrolls (home page). */
  trackSections?: boolean;
  /** Render the name as the page's h1 (home page). */
  nameIsHeading?: boolean;
}

const { links, trackSections = false, nameIsHeading = false } = Astro.props;
const Name = nameIsHeading ? 'h1' : 'p';
---

<aside class="side">
  <img src="/photo.jpg" alt="Portrait of Daniel Choi" width="80" height="80" />
  <Name class="name"><a href="/">Daniel Choi</a></Name>
  <p class="role">
    <span>Full Stack Software Engineer at CatalogIt</span>
    <span>Los Angeles</span>
  </p>
  <p class="bio">I take product features from idea to production, lately with a lot of AI in them.</p>
  <nav aria-label="Sections" data-track-sections={trackSections ? '' : undefined}>
    {links.map((link) => (
      <a href={link.href} aria-current={link.current ? (trackSections ? 'true' : 'page') : undefined}>
        {link.label}
      </a>
    ))}
  </nav>
  <dl class="reach">
    <div><dt>GitHub</dt><dd><a href="https://github.com/dchoiboi00">dchoiboi00</a></dd></div>
    <div><dt>LinkedIn</dt><dd><a href="https://linkedin.com/in/danielyoochoi">danielyoochoi</a></dd></div>
    <div><dt>Email</dt><dd>dchoiboi00@gmail.com</dd></div>
  </dl>
</aside>

{trackSections && (
  <script is:inline>
    // Mark the sidebar link for the section in view. The last section may
    // never reach the trigger band on a tall screen, so the bottom of the
    // page always marks the last link.
    (() => {
      const nav = document.querySelector('[data-track-sections]');
      const links = [...nav.querySelectorAll('a[href^="#"]')];
      const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
      if (!('IntersectionObserver' in window) || sections.length === 0) return;

      const mark = (id) => {
        for (const a of links) {
          if (a.getAttribute('href') === `#${id}`) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        }
      };

      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) if (entry.isIntersecting) mark(entry.target.id);
      }, { rootMargin: '-30% 0px -60% 0px' });
      sections.forEach((section) => observer.observe(section));

      addEventListener('scroll', () => {
        if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) {
          mark(sections[sections.length - 1].id);
        }
      }, { passive: true });
    })();
  </script>
)}

<style>
  .side {
    position: sticky;
    top: env(safe-area-inset-top, 0px);
    align-self: start;
    padding-block: 56px 32px;
  }
  img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 18px; }
  .name { margin: 0; font-size: 30px; font-weight: 800; line-height: 1.1; letter-spacing: -0.015em; }
  .name a, .name a:visited { color: var(--ink); text-decoration: none; }
  .role { margin: 6px 0 16px; color: var(--ink-soft); font-size: 15.5px; line-height: 1.45; }
  .role span { display: block; white-space: nowrap; }
  .bio { margin: 0 0 28px; font-family: var(--text); font-size: 17px; line-height: 1.6; }
  nav { display: grid; gap: 6px; margin-bottom: 28px; font-size: 18px; font-weight: 500; }
  nav a[aria-current] { color: var(--ink); font-weight: 700; text-decoration: none; }
  .reach { display: grid; gap: 4px; margin: 0; font-size: 15.5px; }
  .reach div { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 8px; }
  .reach dt { color: var(--ink-soft); }
  .reach dd { margin: 0; }

  @media (max-width: 960px) {
    .side { position: static; padding-bottom: 8px; }
    nav { grid-auto-flow: column; justify-content: start; gap: 20px; }
  }
</style>
```

- [ ] **Step 3: `src/layouts/SidebarLayout.astro`**

```astro
---
// src/layouts/SidebarLayout.astro
import Base from './Base.astro';
import Sidebar from '../components/Sidebar.astro';

interface Props {
  title?: string;
  description?: string;
  links: { href: string; label: string; current?: boolean }[];
  trackSections?: boolean;
  nameIsHeading?: boolean;
}

const { title, description, links, trackSections, nameIsHeading } = Astro.props;
---

<Base title={title} description={description}>
  <div class="shell">
    <Sidebar links={links} trackSections={trackSections} nameIsHeading={nameIsHeading} />
    <main class="main">
      <slot />
      <p class="site-foot">Daniel Choi, 2026</p>
    </main>
  </div>
</Base>

<style>
  .shell {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 320px minmax(0, 1fr);
    gap: clamp(40px, 6vw, 88px);
    padding-inline: clamp(16px, 4vw, 48px);
  }
  .main { padding-block: 56px 80px; min-width: 0; max-width: 760px; }

  @media (max-width: 960px) {
    .shell { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .main { padding-top: 32px; }
  }
</style>
```

- [ ] **Step 4: `src/components/ProjectFeature.astro`**

```astro
---
// src/components/ProjectFeature.astro
import { getEntry } from 'astro:content';
import Facts from './Facts.astro';
import { type Project, projectWhen } from '../data/projects.ts';
import { keepHyphenatedWords } from '../lib/keep-hyphenated-words.mjs';

interface Props {
  project: Project;
}

const { project } = Astro.props;
const href = `/projects/${project.slug}`;
const post = await getEntry('writing', project.slug);
const readTime = post?.data.readTime;
---

<article class="feature">
  <h3><a href={href} set:html={keepHyphenatedWords(project.name)} /></h3>
  <p set:html={keepHyphenatedWords(project.summary)} />
  <a href={href} class="figure" aria-hidden="true" tabindex="-1">
    <img src={project.diagram} alt="" />
  </a>
  <Facts
    items={[
      { label: 'Result', value: project.result },
      { label: 'Built with', value: project.builtWith.join(', ') },
      { label: 'When', value: projectWhen(project) },
    ]}
  />
  <a href={href}>Read the case study{readTime && ` (${readTime})`}</a>
</article>

<style>
  .feature { border-top: 2px solid var(--ink); padding-top: 22px; }
  h3 { margin: 0 0 8px; font-size: 28px; font-weight: 800; line-height: 1.2; letter-spacing: -0.01em; }
  p { margin: 0 0 20px; max-width: 62ch; font-family: var(--text); font-size: 18px; line-height: 1.65; }
  .figure { display: block; margin: 0 0 22px; }
</style>
```

- [ ] **Step 5: `src/components/ProjectRows.astro`**

```astro
---
// src/components/ProjectRows.astro
import { type Project, projectWhen } from '../data/projects.ts';
import { keepHyphenatedWords } from '../lib/keep-hyphenated-words.mjs';

interface Props {
  projects: Project[];
}

const { projects } = Astro.props;
---

<ul class="rows">
  {projects.map((project) => {
    const href = `/projects/${project.slug}`;
    const resultRest = project.result.slice(project.resultLead.length);
    return (
      <li>
        <a href={href} class="thumb" aria-hidden="true" tabindex="-1">
          <img src={project.diagram} alt="" loading="lazy" />
        </a>
        <div>
          <p class="when">{projectWhen(project)}</p>
          <h3><a href={href} set:html={keepHyphenatedWords(project.name)} /></h3>
          <p class="summary" set:html={keepHyphenatedWords(project.summary)} />
          <p class="result">
            <b set:html={keepHyphenatedWords(project.resultLead)} />
            <Fragment set:html={keepHyphenatedWords(resultRest)} />
          </p>
        </div>
      </li>
    );
  })}
</ul>

<style>
  .rows { list-style: none; margin: 40px 0 0; padding: 0; border-top: 1px solid var(--rule); }
  li {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 24px;
    padding-block: 24px;
    border-bottom: 1px solid var(--rule);
    align-items: start;
  }
  .when { margin: 0 0 4px; color: var(--ink-soft); font-size: 15px; }
  h3 { margin: 0 0 6px; font-size: 21px; font-weight: 700; line-height: 1.25; }
  .summary { margin: 0 0 8px; font-family: var(--text); color: var(--ink-soft); font-size: 16.5px; line-height: 1.6; }
  .result { margin: 0; font-size: 16px; }

  @media (max-width: 640px) {
    li { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  }
</style>
```

- [ ] **Step 6: Rewrite `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
import SidebarLayout from '../layouts/SidebarLayout.astro';
import ProjectFeature from '../components/ProjectFeature.astro';
import ProjectRows from '../components/ProjectRows.astro';
import { newestFirst, projects } from '../data/projects.ts';

const featured = projects.filter((p) => p.featured);
const others = projects.filter((p) => !p.featured).sort(newestFirst);
---

<SidebarLayout
  links={[
    { href: '#projects', label: 'Projects', current: true },
    { href: '#about', label: 'About' },
  ]}
  trackSections
  nameIsHeading
>
  <section id="projects">
    <h2>Featured projects</h2>
    {featured.map((project) => <ProjectFeature project={project} />)}
    <ProjectRows projects={others} />
  </section>

  <section id="about" class="about">
    <h2>About</h2>
    <p>
      I'm a full stack software engineer at CatalogIt, which makes collection management
      software for museums, galleries, and collectors. I take product features from idea to
      production, lately with a lot of AI in them, like the LLM pipeline behind our CSV importer.
    </p>
    <p>
      I care most about the parts of a product that don't fit in a demo: error handling,
      fallbacks, and making sure the numbers match. Outside of work, I read more than I write
      (working on it).
    </p>
  </section>
</SidebarLayout>

<style>
  h2 { font-size: 22px; font-weight: 700; margin: 0 0 20px; line-height: 1.25; }
  .about { margin-top: 80px; }
  .about p { margin: 0 0 16px; max-width: 62ch; font-family: var(--text); line-height: 1.65; }
</style>
```

- [ ] **Step 7: Check the home page**

Run: `npm run build && npm run dev`, open http://localhost:4321.
Expected: sidebar on the left with the two-line role; Featured projects with the auto-mapper, then Plan limit enforcement, Adjust Plan wizard, Billing migration; About below. Scrolling to the bottom bolds About in the sidebar.

- [ ] **Step 8: Propose the commit** (Tasks 2 and 3 together): "Rebuild the home page with a sidebar layout and new type".

---

### Task 4: Projects page, case study pages, and redirects

**Files:**
- Create: `src/pages/projects/index.astro`, `src/pages/projects/[slug].astro`, `src/layouts/CaseStudy.astro`
- Modify: `astro.config.mjs`
- Modify: each file in `src/content/writing/` (remove the first image line)
- Delete: `src/pages/work.astro`, `src/pages/about.astro`, `src/pages/writing/index.astro`, `src/pages/writing/[slug].astro`, `src/layouts/Post.astro`, `src/components/Masthead.astro`

**Interfaces:**
- Consumes: `findProject`, `projectWhen`, `newestFirst`, `projects` (Task 1); `SidebarLayout`, `ProjectRows`, `Facts` (Task 3).

- [ ] **Step 1: `src/pages/projects/index.astro`**

```astro
---
// src/pages/projects/index.astro
import SidebarLayout from '../../layouts/SidebarLayout.astro';
import ProjectRows from '../../components/ProjectRows.astro';
import { newestFirst, projects } from '../../data/projects.ts';
import { keepHyphenatedWords } from '../../lib/keep-hyphenated-words.mjs';
---

<SidebarLayout
  title="Projects"
  links={[
    { href: '/projects', label: 'Projects', current: true },
    { href: '/#about', label: 'About' },
  ]}
>
  <h1>Projects</h1>
  <p class="dek" set:html={keepHyphenatedWords('Selected projects from my work at CatalogIt. The code is closed source, so each one links to a write-up.')} />
  <ProjectRows projects={[...projects].sort(newestFirst)} />
</SidebarLayout>

<style>
  h1 { margin: 0 0 8px; font-size: 34px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.1; }
  .dek { margin: 0; max-width: 60ch; font-family: var(--text); color: var(--ink-soft); font-size: 18px; line-height: 1.6; }
</style>
```

- [ ] **Step 2: `src/layouts/CaseStudy.astro`**

```astro
---
// src/layouts/CaseStudy.astro
import type { CollectionEntry } from 'astro:content';
import Base from './Base.astro';
import Facts from '../components/Facts.astro';
import { type Project, projectWhen } from '../data/projects.ts';
import { keepHyphenatedWords } from '../lib/keep-hyphenated-words.mjs';

interface Props {
  post: CollectionEntry<'writing'>['data'];
  project: Project;
}

const { post, project } = Astro.props;
const facts = [
  { label: 'Result', value: project.result },
  { label: 'When', value: projectWhen(project) },
  ...(post.readTime ? [{ label: 'Reading time', value: post.readTime }] : []),
];
---

<Base title={post.title} description={post.dek} ogType="article">
  <div class="col">
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="/">Daniel Choi</a><span aria-hidden="true">/</span><a href="/projects">Projects</a><span aria-hidden="true">/</span><span set:html={keepHyphenatedWords(project.name)} />
    </nav>
    <h1 set:html={keepHyphenatedWords(post.title)} />
    {post.dek && <p class="dek" set:html={keepHyphenatedWords(post.dek)} />}
    <Facts items={facts} />
  </div>

  <figure class="wide">
    <img src={project.diagram} alt={project.diagramAlt} />
  </figure>

  <div class="col tail">
    <article class="prose">
      <slot />
    </article>
    <p class="site-foot">Daniel Choi, 2026</p>
  </div>
</Base>

<style>
  .col { max-width: 720px; margin: 0 auto; padding-inline: clamp(16px, 5vw, 32px); }
  .crumbs { padding-top: 40px; font-size: 16px; color: var(--ink-soft); }
  .crumbs span[aria-hidden] { margin-inline: 6px; }
  h1 { margin: 28px 0 12px; font-size: clamp(32px, 4.8vw, 44px); font-weight: 800; line-height: 1.1; letter-spacing: -0.015em; }
  .dek { margin: 0 0 24px; font-family: var(--text); font-size: 21px; color: var(--ink-soft); line-height: 1.5; }
  .wide { max-width: 1040px; margin: 8px auto 36px; padding-inline: clamp(16px, 5vw, 32px); }
  .tail { padding-bottom: 80px; }
</style>

<style is:global>
  /* Markdown body. Global because the content comes in through <slot />. */
  .prose { font-family: var(--text); font-size: 19px; line-height: 1.7; }
  .prose p, .prose ul, .prose ol { margin: 0 0 1.1em; }
  .prose ul, .prose ol { padding-left: 1.3em; }
  .prose li { margin-bottom: 0.4em; }
  .prose h2 { font-family: var(--grotesk); font-size: 24px; font-weight: 800; letter-spacing: -0.01em; margin: 40px 0 10px; }
  .prose h3 { font-family: var(--grotesk); font-size: 20px; font-weight: 700; margin: 32px 0 8px; }
  .prose strong { font-weight: 600; }
  .prose code { font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 0.85em; background: #f4f5f7; padding: 1px 5px; border-radius: 4px; }
  .prose pre { background: #f4f5f7; padding: 16px 18px; border-radius: 6px; overflow-x: auto; font-size: 15px; line-height: 1.55; }
  .prose pre code { background: none; padding: 0; }
  .prose blockquote { margin: 0 0 1.1em; padding-left: 18px; border-left: 3px solid var(--rule); color: var(--ink-soft); }
  .prose img { margin: 8px 0 32px; }
</style>
```

- [ ] **Step 3: `src/pages/projects/[slug].astro`**

```astro
---
// src/pages/projects/[slug].astro
import { getCollection, render } from 'astro:content';
import CaseStudy from '../../layouts/CaseStudy.astro';
import { findProject } from '../../data/projects.ts';

export async function getStaticPaths() {
  const posts = await getCollection('writing');
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

const { post } = Astro.props;
const project = findProject(post.id);
const { Content } = await render(post);
---

<CaseStudy post={post.data} project={project}>
  <Content />
</CaseStudy>
```

- [ ] **Step 4: Remove the first image line from each case study**

The layout now shows the diagram from `projects.ts`, so delete the `![...](/work/...svg)` line (and the blank line after it) at the top of the body in each of the four files in `src/content/writing/`.

- [ ] **Step 5: Add redirects to `astro.config.mjs`**

```js
export default defineConfig({
  site: 'https://dchoiboi00.github.io',
  redirects: {
    '/work': '/projects',
    '/writing': '/projects',
    '/writing/[slug]': '/projects/[slug]',
    '/about': '/#about',
  },
  markdown: {
    rehypePlugins: [rehypeKeepHyphenatedWords],
  },
});
```

- [ ] **Step 6: Delete the old pages and components**

```bash
rm src/pages/work.astro src/pages/about.astro src/pages/writing/index.astro "src/pages/writing/[slug].astro" src/layouts/Post.astro src/components/Masthead.astro
```

- [ ] **Step 7: Build and check redirects**

Run: `npm run build && grep -o 'url=[^"]*' dist/writing/csv-schema-mapper-at-catalogit/index.html dist/work/index.html dist/about/index.html`
Expected: `url=/projects/csv-schema-mapper-at-catalogit`, `url=/projects`, `url=/#about`.

- [ ] **Step 8: Propose the commit**: "Add the Projects page and case study layout, and forward old URLs".

---

### Task 5: 404 page and README

**Files:**
- Rewrite: `src/pages/404.astro`
- Modify: `README.md`

- [ ] **Step 1: Rewrite `src/pages/404.astro`**

```astro
---
// src/pages/404.astro
import Base from '../layouts/Base.astro';
---

<Base title="Page not found">
  <main class="col">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="/">Daniel Choi</a></nav>
    <h1>Page not found</h1>
    <p>There's nothing at this address. Try the <a href="/">home page</a> or the <a href="/projects">list of projects</a>.</p>
    <p class="site-foot">Daniel Choi, 2026</p>
  </main>
</Base>

<style>
  .col { max-width: 720px; margin: 0 auto; padding: 40px clamp(16px, 5vw, 32px) 80px; }
  .crumbs { font-size: 16px; }
  h1 { margin: 28px 0 12px; font-size: clamp(32px, 4.8vw, 44px); font-weight: 800; letter-spacing: -0.015em; }
  p { font-family: var(--text); max-width: 60ch; }
</style>
```

- [ ] **Step 2: Update the README's "Where things live"**

```markdown
## Where things live

- `src/data/projects.ts`: one record per project (name, summary, result, dates, diagram). Change a date or result here.
- `src/content/writing/`: the case studies, as Markdown. Each file's name is the project's slug.
- `src/pages/`: the home page, `/projects`, `/projects/<slug>`, and 404. Old URLs forward through `redirects` in `astro.config.mjs`.
- `src/layouts/` and `src/components/`: the sidebar layout, the case study layout, and their parts.
- `public/work/`: the project diagrams.

Run the tests with `npm test` and check internal links after a build with `npm run check:links`.
```

- [ ] **Step 3: Propose the commit**: "Restyle the 404 page and update the README".

---

### Task 6: Link check and full verification

**Files:**
- Create: `scripts/check-links.mjs`

- [ ] **Step 1: Write `scripts/check-links.mjs`**

```js
// Fails if any internal link, image, or redirect in dist/ points at
// something the build didn't produce. Run after `npm run build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

const htmlFiles = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html')) htmlFiles.push(path);
  }
})(dist);

const resolves = (href) => {
  const path = decodeURI(href.split('#')[0].split('?')[0]);
  if (path === '' || path === '/') return true;
  const target = join(dist, path);
  return (existsSync(target) && statSync(target).isFile()) || existsSync(join(target, 'index.html'));
};

const broken = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const refs = [
    ...html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g),
    ...html.matchAll(/http-equiv="refresh" content="\d+;\s*url=(\/(?!\/)[^"]*)"/g),
  ].map((m) => m[1]);
  for (const ref of refs) {
    if (!resolves(ref)) broken.push(`${file.slice(dist.length)} -> ${ref}`);
  }
}

if (broken.length > 0) {
  console.error(`Broken internal links:\n${broken.join('\n')}`);
  process.exit(1);
}
console.log(`Checked ${htmlFiles.length} pages: every internal link resolves.`);
```

- [ ] **Step 2: Run the tests, build, and link check**

Run: `npm test && npm run build && npm run check:links`
Expected: tests PASS; build lists `/`, `/projects`, four `/projects/<slug>`, `/404`, and the redirect pages; the link check prints "every internal link resolves".

- [ ] **Step 3: Check every page in the browser**

At 320, 390, 768, and 1280px wide, for `/`, `/projects`, each `/projects/<slug>`, and `/nope`:
- run the broken-word check (walk every text node, flag any word whose characters land on two lines) and confirm none and no sideways scrolling;
- confirm the role lines are one line each;
- on `/`, scroll to the bottom and confirm the About link is bold;
- open `/writing/csv-schema-mapper-at-catalogit` and confirm it lands on `/projects/csv-schema-mapper-at-catalogit`.

Save screenshots of `/`, `/projects`, one case study, and `/nope` at 390 and 1280px to `.pr-proof/redesign/`, numbered in reading order.

- [ ] **Step 4: Propose the commit**: "Add an internal link check".

---

### Task 7: Cards, ink links, and impact lines (design changes after review of the built site)

Requested by the user after seeing the built home page: follow the Sidebar mockup more closely. The spec's Visual system, Home page, Case study, and data sections were updated to match.

**Files:**
- Modify: `src/styles/global.css`, `src/components/ProjectFeature.astro`, `src/components/ProjectRows.astro`, `src/components/Facts.astro`, `src/layouts/CaseStudy.astro`, `src/data/projects.ts`, `src/data/projects.test.ts`

**Interfaces:**
- `Project` loses `resultLead`; `result` is the impact line shown on cards and rows, and the Result fact on the case study.

- [ ] **Step 1: Tokens and links in `src/styles/global.css`**

Replace the color tokens with:

```css
  --paper: #f3f5f8;
  --surface: #ffffff;
  --ink: #1d1e20;
  --ink-soft: #565b62;
  --rule: #e2e4e8;
  --line: #d6dbe4;
```

Remove `--link` and `--visited`. Links become ink and keep their underline:

```css
a { color: var(--ink); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { text-decoration-thickness: 2px; }
a:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; border-radius: 2px; }
```

(No `a:visited` rule.) Search `src/` for any other use of `--link` or `--visited` and switch it to `--ink`.

- [ ] **Step 2: Data**

In `src/data/projects.ts`, remove `resultLead` from the interface and from every project. Change the Adjust Plan wizard's `result` to `'Every plan change charges exactly what the preview showed'`. In `src/data/projects.test.ts`, delete the test "each result starts with the part set in bold".

- [ ] **Step 3: Featured card, `src/components/ProjectFeature.astro`**

```astro
---
// src/components/ProjectFeature.astro
import { getEntry } from 'astro:content';
import type { Project } from '../data/projects.ts';
import { keepHyphenatedWords } from '../lib/keep-hyphenated-words.mjs';

interface Props {
  project: Project;
}

const { project } = Astro.props;
const href = `/projects/${project.slug}`;
const post = await getEntry('writing', project.slug);
const readTime = post?.data.readTime;
---

<article class="feature">
  <a href={href} class="figure" aria-hidden="true" tabindex="-1">
    <img src={project.diagram} alt="" />
  </a>
  <div class="text">
    <h3><a href={href} set:html={keepHyphenatedWords(project.name)} /></h3>
    <p class="summary" set:html={keepHyphenatedWords(project.summary)} />
    <p class="impact" set:html={keepHyphenatedWords(project.result)} />
    <a href={href} class="read">Read the case study{readTime && ` (${readTime})`}</a>
  </div>
</article>

<style>
  .feature { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; }
  .figure { display: block; border-bottom: 1px solid var(--line); }
  .figure img { width: 100%; }
  .text { padding: clamp(20px, 3vw, 36px); }
  h3 { margin: 0 0 10px; font-size: clamp(28px, 3.4vw, 40px); font-weight: 800; line-height: 1.08; letter-spacing: -0.02em; }
  .summary { margin: 0 0 16px; max-width: 62ch; font-family: var(--text); font-size: 18px; line-height: 1.6; }
  .impact { margin: 0 0 18px; font-size: 16.5px; font-weight: 600; }
  .read { font-weight: 700; }
</style>
```

- [ ] **Step 4: Project rows, `src/components/ProjectRows.astro`**

Each row: the thumbnail on the left in a white frame, then title, summary, and impact line. No dates.

```astro
<ul class="rows">
  {projects.map((project) => {
    const href = `/projects/${project.slug}`;
    return (
      <li>
        <a href={href} class="thumb" aria-hidden="true" tabindex="-1">
          <img src={project.diagram} alt="" loading="lazy" />
        </a>
        <div>
          <h3><a href={href} set:html={keepHyphenatedWords(project.name)} /></h3>
          <p class="summary" set:html={keepHyphenatedWords(project.summary)} />
          <p class="impact" set:html={keepHyphenatedWords(project.result)} />
        </div>
      </li>
    );
  })}
</ul>

<style>
  .rows { list-style: none; margin: 44px 0 0; padding: 0; display: grid; gap: 44px; }
  li { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 28px; align-items: start; }
  .thumb { display: block; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 8px; }
  h3 { margin: 0 0 8px; font-size: 24px; font-weight: 800; line-height: 1.15; letter-spacing: -0.01em; }
  .summary { margin: 0 0 10px; font-family: var(--text); font-size: 17px; line-height: 1.6; }
  .impact { margin: 0; font-size: 15.5px; font-weight: 600; }

  @media (max-width: 640px) {
    li { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  }
</style>
```

Remove the `projectWhen` import; keep the `Project` type import and the frontmatter as before.

- [ ] **Step 5: Case study facts and code blocks**

In `src/layouts/CaseStudy.astro`, the facts become Result, Built with, When, Reading time:

```ts
const facts = [
  { label: 'Result', value: project.result },
  { label: 'Built with', value: project.builtWith.join(', ') },
  { label: 'When', value: projectWhen(project) },
  ...(post.readTime ? [{ label: 'Reading time', value: post.readTime }] : []),
];
```

In its global `.prose` styles, code sits on the white surface so it reads on the gray page: `.prose code { background: var(--surface); }` and `.prose pre { background: var(--surface); border: 1px solid var(--line); }` (replace the two hard-coded `#f4f5f7`).

In `src/components/Facts.astro`, show the facts two by two: `grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 28px;` (one column under 640px, as now).

- [ ] **Step 6: Build and test**

Run: `npm test && npm run build && npm run check:links`
Expected: tests pass (one fewer, 12), build clean, link check passes. `grep -c "1a4fd0\|6a3d9a" dist/index.html` returns 0.
