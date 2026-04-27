# Portfolio Site (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a redesigned personal portfolio site at dchoiboi00.github.io using Astro, replacing the existing plain-HTML template with the editorial design from the spec.

**Architecture:** Astro static site with content collections for writing posts. Shared `Masthead` component used across all pages. CSS uses custom properties (design tokens) defined in `global.css`. Deployed to GitHub Pages via GitHub Actions on push to `main`.

**Tech Stack:** Astro 4, TypeScript, plain CSS (no Tailwind), GitHub Actions, GitHub Pages.

**Spec:** `2026-04-27-portfolio-and-github-design.md` (move to `docs/superpowers/specs/` in this repo after cloning)

---

## File Map

```
dchoiboi00.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions → GitHub Pages
├── public/
│   └── photo.jpg                  # your portrait (44px circle in masthead, rect in about)
├── src/
│   ├── components/
│   │   └── Masthead.astro         # shared nav strip (photo + name + links)
│   ├── content/
│   │   ├── config.ts              # Astro content collections schema
│   │   └── writing/
│   │       └── csv-schema-mapper-at-catalogit.md  # first case study
│   ├── layouts/
│   │   ├── Base.astro             # HTML shell, <head>, imports global.css
│   │   └── Post.astro             # article layout (wraps Base + Masthead + article)
│   ├── pages/
│   │   ├── index.astro            # /  homepage
│   │   ├── work.astro             # /work  project list
│   │   ├── about.astro            # /about
│   │   └── writing/
│   │       ├── index.astro        # /writing  list
│   │       └── [slug].astro       # /writing/<slug>  individual post
│   └── styles/
│       └── global.css             # CSS custom properties + reset + typography
├── astro.config.mjs
└── package.json
```

---

## Task 1: Initialize Astro project

**Files:**
- Delete: `index.html`, `portfolio-item.html`, `css/`, `js/`, `img/`
- Create: `astro.config.mjs`, `package.json` (via `npm create astro`)

> Note: Run these commands after cloning `dchoiboi00.github.io` into `~/projects/dchoiboi00.github.io` and `cd`-ing into it.

- [ ] **Step 1: Clone the repo and enter it**

```bash
git clone git@github.com:dchoiboi00/dchoiboi00.github.io.git ~/projects/dchoiboi00.github.io
cd ~/projects/dchoiboi00.github.io
```

- [ ] **Step 2: Remove old files**

```bash
rm -rf index.html portfolio-item.html css js img
```

- [ ] **Step 3: Initialize Astro**

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

When prompted: no to install dependencies now, no to git init (already a git repo).

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Update `astro.config.mjs`**

Replace the generated file with:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dchoiboi00.github.io',
});
```

- [ ] **Step 6: Verify the dev server starts**

```bash
npm run dev
```

Expected: `astro dev` starts on `http://localhost:4321` with no errors. Opening it shows Astro's minimal starter page.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "init: fresh Astro project, remove old HTML template"
```

---

## Task 2: GitHub Actions deploy pipeline

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow file**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write the workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 3: Enable GitHub Pages in repository settings**

Go to `https://github.com/dchoiboi00/dchoiboi00.github.io/settings/pages` and set **Source** to **GitHub Actions**. (Do this once, manually — not a code step.)

- [ ] **Step 4: Commit and verify the Action runs**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy to GitHub Pages"
git push origin main
```

Expected: the Action appears at `https://github.com/dchoiboi00/dchoiboi00.github.io/actions` and deploys successfully (green checkmark). Site at `https://dchoiboi00.github.io` shows the Astro starter page.

---

## Task 3: Design tokens and global CSS

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
/* src/styles/global.css */

/* ── Design tokens ── */
:root {
  --bg:           #f7f4ee;
  --text-primary: #1a1a1a;
  --text-secondary: #3d3a35;
  --text-muted:   #5d574e;
  --text-meta:    #7a7368;
  --accent:       #8b3a2f;
  --rule:         #d8d2c2;
  --callout-bg:   #f1ebdc;
  --code-bg:      #1f1d1a;
  --code-text:    #e8e3d6;

  --serif: Georgia, 'Times New Roman', serif;
  --sans:  -apple-system, 'Inter', system-ui, sans-serif;

  --col-width: 640px;
  --col-pad: 40px;
}

/* ── Reset ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { font-size: 16px; }

body {
  background: var(--bg);
  color: var(--text-primary);
  font-family: var(--sans);
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; }

a { color: inherit; text-decoration: none; }
a:hover { color: var(--accent); }

/* ── Column wrapper ── */
.col {
  max-width: var(--col-width);
  margin: 0 auto;
  padding: 48px var(--col-pad) 72px;
}

/* ── Hairline rule ── */
.rule { border: none; border-top: 1px solid var(--rule); }

/* ── Metadata strip ── */
.meta {
  font-family: var(--sans);
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-meta);
}

/* ── Prose (used inside Post layout) ── */
.prose {
  font-family: var(--serif);
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-secondary);
}
.prose p { margin-bottom: 18px; }
.prose h3 {
  font-family: var(--serif);
  font-size: 19px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 32px 0 12px;
}
.prose em { color: var(--accent); font-style: italic; }
.prose pre {
  background: var(--code-bg);
  color: var(--code-text);
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 12px;
  line-height: 1.55;
  padding: 14px 16px;
  border-radius: 4px;
  overflow-x: auto;
  margin: 0 0 24px;
}
.prose code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875em; }
.prose pre code { font-size: inherit; }
.prose blockquote {
  border-left: 3px solid var(--accent);
  background: var(--callout-bg);
  padding: 4px 16px;
  margin: 0 0 24px;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text-muted);
}
.prose blockquote strong { color: var(--text-primary); }

/* ── Responsive ── */
@media (max-width: 680px) {
  :root { --col-pad: 20px; }
  .prose { font-size: 15px; }
}
```

- [ ] **Step 2: Verify build still passes**

```bash
npm run build
```

Expected: `dist/` created, no errors. (CSS isn't imported anywhere yet — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add design tokens and global CSS"
```

---

## Task 4: Base layout

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
// src/layouts/Base.astro
import '../styles/global.css';

interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = 'Engineer turning AI into shipped products.',
} = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — Daniel Choi</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Add a minimal favicon**

Create `public/favicon.svg` with a simple text-based icon:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#f7f4ee"/>
  <text x="6" y="24" font-family="Georgia,serif" font-size="20" fill="#1a1a1a">D</text>
</svg>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro public/favicon.svg
git commit -m "feat: add Base layout and favicon"
```

---

## Task 5: Masthead component

**Files:**
- Create: `src/components/Masthead.astro`

The masthead is the shared strip at the top of every page: `[photo] Daniel Choi / Engineer · LA  ·····  WORK · WRITING · ABOUT`

On post pages it shows a "← Back" link on the right instead of the standard nav.

- [ ] **Step 1: Add your portrait photo**

Copy your portrait photo to `public/photo.jpg`. Optimal: square crop, minimum 200×200px. Can be added later — the component renders gracefully without it.

- [ ] **Step 2: Create `src/components/Masthead.astro`**

```astro
---
// src/components/Masthead.astro
interface Props {
  backTo?: { href: string; label: string };
}

const { backTo } = Astro.props;
const currentPath = Astro.url.pathname;
---

<header class="masthead">
  <a href="/" class="masthead-identity">
    <img src="/photo.jpg" alt="Daniel Choi" class="masthead-photo" />
    <div class="masthead-text">
      <span class="masthead-name">Daniel Choi</span>
      <span class="masthead-role">Engineer · Los Angeles</span>
    </div>
  </a>

  <nav class="masthead-nav">
    {backTo ? (
      <>
        <a href={backTo.href}>← {backTo.label}</a>
        <span class="dot">·</span>
        <a href="/work">WORK</a>
      </>
    ) : (
      <>
        <a href="/work" class={currentPath.startsWith('/work') ? 'active' : ''}>WORK</a>
        <span class="dot">·</span>
        <a href="/writing" class={currentPath.startsWith('/writing') ? 'active' : ''}>WRITING</a>
        <span class="dot">·</span>
        <a href="/about" class={currentPath === '/about' ? 'active' : ''}>ABOUT</a>
      </>
    )}
  </nav>
</header>

<hr class="rule" style="margin-bottom: 36px;" />

<style>
  .masthead {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 0 14px;
  }
  .masthead-identity {
    display: flex;
    gap: 12px;
    align-items: center;
    text-decoration: none;
  }
  .masthead-photo {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    background: #c9b89a;
  }
  .masthead-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .masthead-name {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.2;
  }
  .masthead-role {
    font-family: var(--sans);
    font-size: 11px;
    color: var(--text-meta);
    line-height: 1.2;
  }
  .masthead-nav {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--sans);
    font-size: 10px;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    color: var(--text-meta);
  }
  .masthead-nav a { color: var(--text-meta); }
  .masthead-nav a:hover, .masthead-nav a.active { color: var(--text-primary); }
  .dot { color: var(--rule); }

  @media (max-width: 480px) {
    .masthead-role { display: none; }
    .masthead-nav { font-size: 9px; letter-spacing: 1.2px; }
  }
</style>
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Masthead.astro
git commit -m "feat: add Masthead component"
```

---

## Task 6: Homepage

**Files:**
- Modify: `src/pages/index.astro`

Per spec §4.1: masthead → hero → intro paragraph → `RECENT WRITING` list. No `FEATURED PROJECT` block until `schema-mapper` ships.

- [ ] **Step 1: Replace `src/pages/index.astro`**

```astro
---
// src/pages/index.astro
import Base from '../layouts/Base.astro';
import Masthead from '../components/Masthead.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('writing'))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
  .slice(0, 3);

const formatYear = (date: Date) => date.getFullYear().toString();
---

<Base title="Daniel Choi">
  <div class="col">
    <Masthead />

    <section class="hero">
      <h1 class="hero-line">Engineer turning AI</h1>
      <h1 class="hero-line hero-accent">into shipped products.</h1>
    </section>

    <p class="intro">
      I'm a full-stack engineer at CatalogIt, where I build LLM-powered features
      for collection management software. I'm most interested in the messy work
      of turning AI demos into reliable, shipped products.
    </p>

    {posts.length > 0 && (
      <section class="writing-list">
        <p class="meta" style="margin-bottom: 14px;">RECENT WRITING</p>
        <hr class="rule" />
        {posts.map((post) => (
          <a href={`/writing/${post.slug}`} class="writing-row">
            <span class="writing-title">{post.data.title}</span>
            <span class="writing-year">{formatYear(post.data.date)}</span>
          </a>
        ))}
      </section>
    )}
  </div>
</Base>

<style>
  .hero { margin-bottom: 28px; }
  .hero-line {
    font-family: var(--serif);
    font-size: 38px;
    font-weight: 400;
    line-height: 1.15;
    color: var(--text-primary);
  }
  .hero-accent {
    font-style: italic;
    color: var(--accent);
  }
  .intro {
    font-family: var(--sans);
    font-size: 15px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 92%;
    margin-bottom: 56px;
  }
  .writing-list { margin-top: 8px; }
  .writing-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 12px 0;
    border-bottom: 1px solid var(--rule);
    font-family: var(--sans);
    font-size: 13px;
    color: var(--text-secondary);
    text-decoration: none;
  }
  .writing-row:hover .writing-title { color: var(--accent); }
  .writing-year { color: var(--text-meta); font-size: 11px; flex-shrink: 0; margin-left: 16px; }

  @media (max-width: 480px) {
    .hero-line { font-size: 28px; }
  }
</style>
```

- [ ] **Step 2: Set up content collections so the `getCollection` import works**

Content collections are needed before this page builds. Astro requires `src/content/config.ts` to exist. Create it now even if no posts exist yet:

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const writing = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
    date: z.coerce.date(),
    type: z.enum(['CASE STUDY', 'ESSAY', 'NOTE']),
    readTime: z.string().optional(),
  }),
});

export const collections = { writing };
```

Also create the writing directory:

```bash
mkdir -p src/content/writing
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: build succeeds. No posts yet, so the writing section is hidden (guarded by `posts.length > 0`).

- [ ] **Step 4: Run dev and verify homepage visually**

```bash
npm run dev
```

Open `http://localhost:4321`. Verify:
- Masthead renders (placeholder grey circle if no photo yet)
- Hero text: "Engineer turning AI" then italic terracotta "*into shipped products.*"
- Intro paragraph visible
- No broken layout

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/content/config.ts
git commit -m "feat: homepage with hero and writing list"
```

---

## Task 7: /work page

**Files:**
- Create: `src/pages/work.astro`

Phase 1 includes 2 entries: CatalogIt auto-mapper (CLOSED-SOURCE) and WGAN (ARCHIVED).

- [ ] **Step 1: Create `src/pages/work.astro`**

```astro
---
// src/pages/work.astro
import Base from '../layouts/Base.astro';
import Masthead from '../components/Masthead.astro';

const projects = [
  {
    name: 'CatalogIt auto-mapper',
    description: 'Production LLM pipeline that parses incoming CSVs and maps columns to the appropriate fields in a collection management CMS. Served real customers.',
    tags: '2024–PRESENT · TYPESCRIPT · CLOSED-SOURCE',
    links: [{ label: 'Case study', href: '/writing/csv-schema-mapper-at-catalogit' }],
    status: 'CLOSED-SOURCE',
  },
  {
    name: 'WGAN-Image-Generation',
    description: 'Fashion item generation using a Wasserstein GAN trained on the Fashion-MNIST dataset.',
    tags: '2022 · PYTHON · PYTORCH · ARCHIVED',
    links: [{ label: '↗ GitHub', href: 'https://github.com/dchoiboi00/WGAN-Image-Generation' }],
    status: 'ARCHIVED',
  },
] as const;
---

<Base title="Work">
  <div class="col">
    <Masthead />

    <h1 class="page-title">Work</h1>
    <p class="page-dek">Selected projects, mostly around production AI.</p>

    <div class="project-list">
      {projects.map((p) => (
        <div class="project-row">
          <div class="project-main">
            <span class="project-name">{p.name}</span>
            <div class="project-links">
              {p.links.map((l) => (
                <a href={l.href} class="project-link">{l.label}</a>
              ))}
            </div>
          </div>
          <p class="project-description">{p.description}</p>
          <p class="meta project-tags">{p.tags}</p>
        </div>
      ))}
    </div>
  </div>
</Base>

<style>
  .page-title {
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  .page-dek {
    font-family: var(--serif);
    font-size: 15px;
    font-style: italic;
    color: var(--text-muted);
    margin-bottom: 32px;
  }
  .project-list { border-top: 1px solid var(--rule); }
  .project-row {
    padding: 18px 0;
    border-bottom: 1px solid var(--rule);
  }
  .project-main {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .project-name {
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
  .project-links { display: flex; gap: 12px; }
  .project-link {
    font-family: var(--sans);
    font-size: 11px;
    color: var(--accent);
  }
  .project-link:hover { text-decoration: underline; }
  .project-description {
    font-family: var(--sans);
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.55;
    margin-bottom: 6px;
  }
  .project-tags { font-size: 9px; letter-spacing: 0.5px; }
</style>
```

- [ ] **Step 2: Verify build and visual check**

```bash
npm run build && npm run dev
```

Open `http://localhost:4321/work`. Verify both project rows render with correct metadata and links.

- [ ] **Step 3: Commit**

```bash
git add src/pages/work.astro
git commit -m "feat: /work page with phase 1 projects"
```

---

## Task 8: /writing index page

**Files:**
- Create: `src/pages/writing/index.astro`

- [ ] **Step 1: Create `src/pages/writing/index.astro`**

```astro
---
// src/pages/writing/index.astro
import Base from '../../layouts/Base.astro';
import Masthead from '../../components/Masthead.astro';
import { getCollection } from 'astro:content';

const posts = (await getCollection('writing'))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
---

<Base title="Writing">
  <div class="col">
    <Masthead />

    <h1 class="page-title">Writing</h1>
    <p class="page-dek">Notes on shipping AI, engineering practice, and things I'm figuring out.</p>

    <div class="post-list">
      {posts.map((post) => (
        <a href={`/writing/${post.slug}`} class="post-row">
          <p class="meta post-meta">{post.data.type} · {formatDate(post.data.date)}</p>
          <p class="post-title">{post.data.title}</p>
          {post.data.dek && <p class="post-dek">{post.data.dek}</p>}
        </a>
      ))}
    </div>

    {posts.length === 0 && (
      <p class="empty">First post coming soon.</p>
    )}
  </div>
</Base>

<style>
  .page-title {
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 6px;
  }
  .page-dek {
    font-family: var(--serif);
    font-size: 15px;
    font-style: italic;
    color: var(--text-muted);
    margin-bottom: 32px;
  }
  .post-list { border-top: 1px solid var(--rule); }
  .post-row {
    display: block;
    padding: 18px 0;
    border-bottom: 1px solid var(--rule);
    text-decoration: none;
  }
  .post-row:hover .post-title { color: var(--accent); }
  .post-meta { color: var(--accent); margin-bottom: 6px; }
  .post-title {
    font-family: var(--serif);
    font-size: 17px;
    color: var(--text-primary);
    line-height: 1.3;
    margin-bottom: 4px;
  }
  .post-dek {
    font-family: var(--serif);
    font-size: 13px;
    font-style: italic;
    color: var(--text-muted);
    line-height: 1.4;
  }
  .empty { font-family: var(--sans); font-size: 13px; color: var(--text-meta); padding-top: 20px; }
</style>
```

- [ ] **Step 2: Verify build and visual check**

```bash
npm run build && npm run dev
```

Open `http://localhost:4321/writing`. Verify: "First post coming soon." is displayed (no posts yet). No broken layout.

- [ ] **Step 3: Commit**

```bash
git add src/pages/writing/index.astro
git commit -m "feat: /writing index page"
```

---

## Task 9: Post layout

**Files:**
- Create: `src/layouts/Post.astro`

- [ ] **Step 1: Create `src/layouts/Post.astro`**

```astro
---
// src/layouts/Post.astro
import Base from './Base.astro';
import Masthead from '../components/Masthead.astro';

interface Props {
  title: string;
  dek?: string;
  type: string;
  date: Date;
  readTime?: string;
}

const { title, dek, type, date, readTime } = Astro.props;

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

const metaParts = [type, formatDate(date), readTime].filter(Boolean).join(' · ');
---

<Base title={title} description={dek}>
  <div class="col">
    <Masthead backTo={{ href: '/writing', label: 'WRITING' }} />

    <article>
      <p class="meta post-meta">{metaParts}</p>
      <h1 class="post-title">{title}</h1>
      {dek && <p class="post-dek">{dek}</p>}

      <div class="prose">
        <slot />
      </div>

      <footer class="post-footer">
        <hr class="rule" style="margin-bottom: 20px;" />
        <a href="/writing" class="back-link">← All writing</a>
      </footer>
    </article>
  </div>
</Base>

<style>
  .post-meta { color: var(--accent); margin-bottom: 14px; }
  .post-title {
    font-family: var(--serif);
    font-size: 32px;
    font-weight: 500;
    line-height: 1.18;
    color: var(--text-primary);
    margin-bottom: 12px;
  }
  .post-dek {
    font-family: var(--serif);
    font-size: 17px;
    font-style: italic;
    color: var(--text-muted);
    line-height: 1.4;
    margin-bottom: 36px;
  }
  .post-footer { margin-top: 48px; }
  .back-link {
    font-family: var(--sans);
    font-size: 12px;
    color: var(--text-meta);
    letter-spacing: 0.5px;
  }
  .back-link:hover { color: var(--accent); }

  @media (max-width: 480px) {
    .post-title { font-size: 24px; }
    .post-dek { font-size: 15px; }
  }
</style>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Post.astro
git commit -m "feat: Post layout for case studies and essays"
```

---

## Task 10: Dynamic post route

**Files:**
- Create: `src/pages/writing/[slug].astro`

- [ ] **Step 1: Create `src/pages/writing/[slug].astro`**

```astro
---
// src/pages/writing/[slug].astro
import { getCollection } from 'astro:content';
import Post from '../../layouts/Post.astro';

export async function getStaticPaths() {
  const posts = await getCollection('writing');
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();
---

<Post
  title={post.data.title}
  dek={post.data.dek}
  type={post.data.type}
  date={post.data.date}
  readTime={post.data.readTime}
>
  <Content />
</Post>
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

Expected: no errors. No post files yet, so no routes are generated — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/pages/writing/[slug].astro
git commit -m "feat: dynamic post route for writing collection"
```

---

## Task 11: First case study — CatalogIt CSV mapper

**Files:**
- Create: `src/content/writing/csv-schema-mapper-at-catalogit.md`

This task creates the post file with frontmatter and a structural outline. **You write the body.** The outline below is the narrative structure to follow.

- [ ] **Step 1: Create the post file**

```markdown
---
title: Building a CSV-to-schema mapper with LLMs at CatalogIt
dek: How we turned a fragile prompt into a reliable ingest pipeline serving real customers.
date: 2026-04-27
type: CASE STUDY
readTime: 8 min
---

Most CatalogIt customers arrive with a spreadsheet.
Sometimes well-formatted, often not.
Our job is to land that data into the right places in the system — and we wanted to do it without a 30-minute onboarding call.

## The problem

[Describe the customer pain: messy CSVs, inconsistent column names, manual mapping was a bottleneck.]

## The naive approach

[Describe the first prompt: hand the model the schema + CSV header, ask for a mapping. Worked ~70% of the time. Show a simplified code snippet of the initial approach.]

## What broke it

[Edge cases: columns with ambiguous names, multi-language headers, columns that match multiple fields. The model didn't know what it didn't know.]

## Adding confidence scores and explanations

[How you modified the output schema to include `confidence` (0–1) and `explanation` (string). Show the Zod/JSON schema.]

## The eval loop

[How you built a test set of known-good mappings and measured accuracy. What the pass rate looked like before/after.]

## What's in production today

[Current state: accuracy, customer impact, edge cases still handled manually. What you'd do differently.]

## Open-sourcing the core

[Segue to schema-mapper: the production experience led to an open-source library — link when available.]
```

- [ ] **Step 2: Verify the post renders**

```bash
npm run dev
```

Open `http://localhost:4321/writing`. Verify the post appears in the list with the correct type/date label. Click through to `http://localhost:4321/writing/csv-schema-mapper-at-catalogit` and verify the layout renders with title, dek, metadata, and the outline content.

- [ ] **Step 3: Verify homepage shows the post**

Open `http://localhost:4321`. Verify the post appears in the `RECENT WRITING` list.

- [ ] **Step 4: Write the post body**

Fill in each `[...]` section above with the real content. Aim for 1,500–2,500 words. No placeholder content in the published post.

- [ ] **Step 5: Commit**

```bash
git add src/content/writing/csv-schema-mapper-at-catalogit.md
git commit -m "content: add CatalogIt CSV mapper case study"
```

---

## Task 12: /about page

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: Create `src/pages/about.astro`**

```astro
---
// src/pages/about.astro
import Base from '../layouts/Base.astro';
import Masthead from '../components/Masthead.astro';
---

<Base title="About">
  <div class="col">
    <Masthead />

    <div class="about-header">
      <img src="/photo.jpg" alt="Daniel Choi" class="about-photo" />
      <div>
        <h1 class="page-title">About</h1>
        <p class="page-dek">Daniel Choi · Los Angeles · Full-stack engineer, currently at CatalogIt.</p>
      </div>
    </div>

    <div class="prose about-body">
      <p>
        I'm an engineer focused on the messy work of turning AI into shipped products —
        evals, prompt design, error handling, the parts that don't fit in demo videos.
        Currently building LLM-powered features for collection management software at CatalogIt.
      </p>
      <p>
        Outside of work, I play poker, build things on weekends, and read more than I write
        (working on it).
      </p>
    </div>

    <div class="strips">
      <div class="strip">
        <p class="meta strip-label">ELSEWHERE</p>
        <div class="strip-links">
          <a href="https://github.com/dchoiboi00">GitHub</a>
          <span class="dot">·</span>
          <a href="https://linkedin.com/in/danielyoochoi">LinkedIn</a>
          <span class="dot">·</span>
          <a href="mailto:dchoiboi00@gmail.com">Email</a>
          <span class="dot">·</span>
          <a href="/rss.xml">RSS</a>
        </div>
      </div>

      <div class="strip">
        <p class="meta strip-label">CURRENTLY</p>
        <p class="strip-content">
          Shipping AI features at CatalogIt. Building
          <a href="https://github.com/dchoiboi00/schema-mapper">schema-mapper</a> (OSS).
          Reading <em>Designing Data-Intensive Applications</em>.
        </p>
      </div>
    </div>
  </div>
</Base>

<style>
  .about-header {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    margin-bottom: 28px;
  }
  .about-photo {
    width: 92px;
    height: 110px;
    object-fit: cover;
    flex-shrink: 0;
    background: #c9b89a;
  }
  .page-title {
    font-family: var(--serif);
    font-size: 26px;
    font-weight: 400;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .page-dek {
    font-family: var(--serif);
    font-size: 13px;
    font-style: italic;
    color: var(--text-muted);
    line-height: 1.5;
  }
  .about-body {
    margin-bottom: 36px;
    font-size: 14px;
  }
  .strips { border-top: 1px solid var(--rule); }
  .strip {
    padding: 16px 0;
    border-bottom: 1px solid var(--rule);
  }
  .strip-label { margin-bottom: 8px; }
  .strip-links {
    display: flex;
    gap: 8px;
    align-items: center;
    font-family: var(--sans);
    font-size: 13px;
    color: var(--text-primary);
    flex-wrap: wrap;
  }
  .strip-links a:hover { color: var(--accent); }
  .dot { color: var(--rule); }
  .strip-content {
    font-family: var(--sans);
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.55;
  }
  .strip-content a { color: var(--accent); }
  .strip-content a:hover { text-decoration: underline; }

  @media (max-width: 480px) {
    .about-header { flex-direction: column; }
    .about-photo { width: 72px; height: 86px; }
  }
</style>
```

- [ ] **Step 2: Verify build and visual check**

```bash
npm run build && npm run dev
```

Open `http://localhost:4321/about`. Verify photo, bio paragraphs, ELSEWHERE links, and CURRENTLY block.

- [ ] **Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: /about page with bio, elsewhere, and currently blocks"
```

---

## Task 13: RSS feed

**Files:**
- Create: `src/pages/rss.xml.ts`

- [ ] **Step 1: Install the Astro RSS integration**

```bash
npm install @astrojs/rss
```

- [ ] **Step 2: Create `src/pages/rss.xml.ts`**

```ts
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('writing');
  return rss({
    title: 'Daniel Choi',
    description: 'Engineer turning AI into shipped products.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.dek ?? '',
        link: `/writing/${post.slug}/`,
      })),
  });
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: `dist/rss.xml` exists in the build output.

- [ ] **Step 4: Commit**

```bash
git add src/pages/rss.xml.ts package.json package-lock.json
git commit -m "feat: RSS feed for writing collection"
```

---

## Task 14: Final build, push, and verify live site

- [ ] **Step 1: Full build check**

```bash
npm run build
```

Expected: clean build, no errors or warnings.

- [ ] **Step 2: Spot-check all routes in dev**

```bash
npm run dev
```

Verify each route manually:
- `http://localhost:4321/` — homepage: masthead, hero, writing list
- `http://localhost:4321/work` — project list, 2 entries
- `http://localhost:4321/writing` — writing index, case study visible
- `http://localhost:4321/writing/csv-schema-mapper-at-catalogit` — post renders
- `http://localhost:4321/about` — photo, bio, elsewhere, currently
- `http://localhost:4321/rss.xml` — valid XML

- [ ] **Step 3: Push to main**

```bash
git push origin main
```

- [ ] **Step 4: Verify GitHub Actions deploy**

Watch the deploy at `https://github.com/dchoiboi00/dchoiboi00.github.io/actions`. Confirm green.

- [ ] **Step 5: Verify live site**

Open `https://dchoiboi00.github.io` and spot-check all 5 routes live.

---

## Task 15: GitHub profile README

**This task is in a different repo: `dchoiboi00/dchoiboi00`.**

- [ ] **Step 1: Create or clone the profile repo**

```bash
# If the dchoiboi00/dchoiboi00 repo doesn't exist yet, create it at:
# https://github.com/new  →  name it exactly "dchoiboi00"  →  public  →  add README
# Then:
git clone git@github.com:dchoiboi00/dchoiboi00.git ~/projects/dchoiboi00-profile
cd ~/projects/dchoiboi00-profile
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Daniel Choi

Full-stack engineer focused on the messy work of turning AI into shipped products.
Currently at [CatalogIt](https://catalogit.com), building LLM-powered features for collection management software.

## Currently

- Shipping production AI features at CatalogIt
- Building [schema-mapper](https://github.com/dchoiboi00/schema-mapper) — open-source CSV→schema mapping
- Writing about evals and shipping LLM apps

## Elsewhere

[Site](https://dchoiboi00.github.io) · [Writing](https://dchoiboi00.github.io/writing) · [LinkedIn](https://linkedin.com/in/danielyoochoi)
```

- [ ] **Step 3: Commit and push**

```bash
git add README.md
git commit -m "profile: editorial README with currently and elsewhere blocks"
git push origin main
```

- [ ] **Step 4: Verify**

Open `https://github.com/dchoiboi00`. Confirm the README renders on the profile page.

---

## Task 16: Move spec and plan into portfolio repo

Once the portfolio repo is live, commit the design doc and this plan as project reference.

- [ ] **Step 1: Create the docs directory in the portfolio repo**

```bash
mkdir -p ~/projects/dchoiboi00.github.io/docs/superpowers/specs
mkdir -p ~/projects/dchoiboi00.github.io/docs/superpowers/plans
```

- [ ] **Step 2: Copy the files**

```bash
cp /Users/danielchoi/cit/.superpowers/brainstorm/35651-1777305711/2026-04-27-portfolio-and-github-design.md \
   ~/projects/dchoiboi00.github.io/docs/superpowers/specs/

cp /Users/danielchoi/cit/.superpowers/brainstorm/35651-1777305711/2026-04-27-portfolio-site-plan.md \
   ~/projects/dchoiboi00.github.io/docs/superpowers/plans/
```

- [ ] **Step 3: Add `docs/` to `.gitignore` or commit it**

If you want the design docs versioned with the site: commit them. If you prefer to keep them private, add `docs/superpowers/` to `.gitignore`.

```bash
# To commit them:
git add docs/
git commit -m "docs: add design spec and implementation plan"
git push origin main
```

---

## Self-Review Checklist

- [x] **Spec §4.1 homepage** → Task 6 (hero, intro, writing list; no featured project block per spec §6.1)
- [x] **Spec §4.2 post template** → Tasks 9–11 (Post layout, dynamic route, first case study)
- [x] **Spec §4.3 /work** → Task 7
- [x] **Spec §4.4 /writing** → Task 8
- [x] **Spec §4.5 /about** → Task 12 (photo, bio, ELSEWHERE with correct LinkedIn URL, CURRENTLY block, no Twitter)
- [x] **Spec §5.1 GitHub README** → Task 15
- [x] **Spec §5.2 pinned repos (B state)** → Manual step in spec (user does this in GitHub settings)
- [x] **Spec §7 tech stack** → Astro 4, GitHub Actions deploy → Tasks 1–2
- [x] **RSS feed** → Task 13 (needed for /about ELSEWHERE RSS link)
- [x] **Deploy verified before building out pages** → Task 2 deploys early with minimal content
- [x] **LinkedIn URL** → `linkedin.com/in/danielyoochoi` in Task 12 and Task 15
- [x] **No Twitter** → Absent from all tasks
- [x] **No "available for hire" language** → Absent from all tasks
