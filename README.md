# dchoiboi00.github.io

Source for my personal site: projects, case studies, and how to reach me. It's built with [Astro](https://astro.build) and deploys to GitHub Pages on every push to `main`.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in ./dist
```

## Where things live

- `src/data/projects.ts`: one record per project (name, summary, result, dates, diagram). Change a date or result here.
- `src/content/writing/`: the case studies, as Markdown. Each file's name is the project's slug.
- `src/pages/`: the home page, `/projects`, `/projects/<slug>`, and 404. Old URLs forward through `redirects` in `astro.config.mjs`.
- `src/layouts/` and `src/components/`: the sidebar layout, the case study layout, and their parts.
- `public/work/`: the project diagrams.

Run the tests with `npm test` and check internal links after a build with `npm run check:links`.
