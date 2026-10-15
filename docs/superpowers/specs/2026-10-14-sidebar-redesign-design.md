# Sidebar redesign — design spec

**Date:** 2026-10-14
**Owner:** Daniel Choi
**Replaces:** the visual system and page layouts in `2026-04-27-portfolio-and-github-design.md`. Positioning, audience, and the GitHub profile sections of that spec still apply.
**Builds on:** the `content-fixes` branch (names, numbers, diagrams, link previews, 404, keeping hyphenated words whole).

## Why

The current site uses the default look of AI-generated pages: cream background, serif display with an italic rust-colored phrase, small letter-spaced uppercase labels, middle dots, and arrows on links. madrona.app uses the same body font, nearly the same background, and the same headline treatment. The redesign drops that whole set and uses a plain, readable style that puts the projects first.

The look was chosen from three mockups. It combines the Sidebar mockup's layout and fonts with the Plain index mockup's colors and case study page, without the highlighter or the visual timeline. The approved mockup is `chosen.html` on the audit artifact.

## Pages and URLs

| URL | What it is |
| --- | --- |
| `/` | Home: sidebar plus Featured projects and About |
| `/projects` | All projects, one list (replaces Work and Writing) |
| `/projects/<slug>` | A case study |
| `/404` | Not found page, same style |

Old URLs forward to the new ones with Astro's `redirects` setting, which writes meta refresh pages on a static build:

| Old | New |
| --- | --- |
| `/work` | `/projects` |
| `/writing` | `/projects` |
| `/writing/[slug]` | `/projects/[slug]` |
| `/about` | `/#about` |

Case study slugs stay the same (`csv-schema-mapper-at-catalogit`, …), so a shared link to `/writing/<slug>` lands on the same post.

## Visual system

**Colors**

| Token | Value | Used for |
| --- | --- | --- |
| `--paper` | `#f3f5f8` | Page background (light gray) |
| `--surface` | `#ffffff` | Cards, thumbnail frames, code blocks |
| `--ink` | `#1d1e20` | Text, headings, links, the current nav item |
| `--ink-soft` | `#565b62` | Secondary text and labels |
| `--rule` | `#e2e4e8` | Dividers |
| `--line` | `#d6dbe4` | Card and frame borders |

All text colors pass 4.5:1 contrast on the page and on cards. No accent colors on the page; the diagrams bring their own.

**Fonts** (Google Fonts)

- Schibsted Grotesk, 400–900: name, headings, nav, labels, and facts.
- Literata, 400 and 600 with italic: bio, project summaries, About, and case study body text.
- Both draw plain zeros. Drop Lora, Newsreader, and Source Sans 3.

**Rules that apply everywhere**

- Links are ink-colored and underlined, and don't change color once visited. Hover makes the underline thicker. No hover-only cues.
- No uppercase letter-spaced labels, no middle-dot strings, no arrows appended to links, no paper grain, no double rules.
- Left-aligned text. Headings use `text-wrap: balance`; body text uses `text-wrap: pretty`.
- No word may split across lines, including at hyphens. Keep `keepHyphenatedWords` for template strings and the rehype plugin for Markdown.
- Visible keyboard focus on every link. Smooth scrolling only when the reader hasn't asked for reduced motion.

## Home page

Two columns on wide screens: a 320px sidebar and a main column up to 760px. Below 960px the sidebar stacks above the main column and stops being sticky.

**Sidebar** (stays in place while the main column scrolls)

1. Photo, 80px square, 8px corner radius.
2. Name, Schibsted Grotesk 800. Links to `/`.
3. Role on two lines, each forced to stay on one line: "Full Stack Software Engineer at CatalogIt", then "Los Angeles".
4. Bio, Literata: "I take product features from idea to production, lately with a lot of AI in them."
5. Section nav: Projects, About. The item for the section in view turns ink and bold (an `IntersectionObserver`, about 15 lines of inline script). Without JavaScript the links still jump to each section.
6. Contact: GitHub, LinkedIn, and email as labeled rows. The email shows as text so people can copy it.

**Main column**

1. **Featured projects.** The CSV auto-mapper first and largest, as a white card with a thin border and rounded corners: the diagram across the top, then the title, the summary, the impact line, and a link to the case study. Then the other three as rows: diagram thumbnail on the left in a white frame (whole diagram, not cropped), then the title, a one-sentence summary, and the impact line. The list shows no dates and no technology; those are on the case study. No highlighted text.
2. **About.** The two About paragraphs.
3. Footer: "Daniel Choi, 2026".

## Projects page

The home page's sidebar and the same project rows as Featured projects, for all projects, newest first. With four projects it matches the home list. It's there so the page can grow and so the breadcrumb on a case study has somewhere to go.

## Case study page

One reading column, no sidebar.

1. Breadcrumb: Daniel Choi / Projects / project name. The first two are links.
2. Title (Schibsted Grotesk 800) and dek (Literata).
3. Four facts in a two-by-two grid: Result, Built with, When (dates and length), Reading time.
4. The diagram, up to 1040px wide so its labels can be read.
5. Body in Literata at 19px, line height 1.7, about 66 characters per line. Headings in Schibsted Grotesk.
6. Footer with the same "Daniel Choi, 2026" line.

## Diagrams

Keep the four SVGs in their current style (cream background, colored header bars, letter badges, soft background shapes, italic captions). They sit on the white page as framed images. No restyling.

## Where the data lives

- **Project facts** move into one file, `src/data/projects.ts`: slug, name, summary, impact (the result line), built-with list, start date, end date, diagram path, and whether it's featured. The impact line says what the project did for the company: the wizard's is "Every plan change charges exactly what the preview showed". The home page, Projects page, and case study facts all read from it, so a date or result is written once.
- **Case study text** stays as Markdown in `src/content/writing/`, matched to a project by slug.
- Each project stores start and end dates. Its length is computed from them: weeks when it's under six weeks ("3 weeks"), months otherwise ("4 months"). Dates and length show together, e.g. "Apr – Jun 2026, 2 months".

Verified project dates, from the PRs, counting only substantial work and not later small fixes:

| Project | When | Length |
| --- | --- | --- |
| CSV auto-mapper | Oct 8, 2025 – Feb 5, 2026 | about 4 months |
| Billing migration | Apr 14 – Jun 5, 2026 | about 2 months |
| Adjust Plan wizard | Jun 26 – Jul 8, 2026 | about 2 weeks |
| Plan limit enforcement | Sep 8 – Sep 30, 2026 | about 3 weeks |

## Other changes

- Favicon redrawn in the new colors.
- `Masthead.astro` and the old page styles in `global.css` go away; the layouts are rebuilt on the new tokens.
- The share image (`public/og.png`) already uses the new style and fonts; no change.

## How it's checked

- `npm run build` succeeds, and every internal link and redirect resolves to a built page.
- Screenshots of home, Projects, one case study, and 404 at 320, 390, 768, and 1280px, saved to `.pr-proof/<branch>/`.
- The broken-word script from the content fixes reports no split words and no sideways scrolling at those widths.
- The sidebar nav highlights Projects, then About, while scrolling, checked in the browser.

## Decisions after review

- The plan limits case study keeps "two weeks, start to finish". Its end date is Sep 21, 2026, the day the last substantial PR was opened (it merged Sep 30 after review), so the computed length is 2 weeks.
- The auto-mapper's impact line is "Cut the import backlog from 16 weeks to 4, with over 85% of suggestions accepted".
- The wizard's impact line is "Every plan change charges exactly what the preview showed".
