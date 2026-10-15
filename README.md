# dchoiboi00.github.io

Source for my personal site: projects, case studies, and how to reach me. It's built with [Astro](https://astro.build) and deploys to GitHub Pages on every push to `main`.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in ./dist
```

## Where things live

- `src/pages/`: one file per page. `writing/[slug].astro` renders each case study.
- `src/content/writing/`: the case studies, as Markdown.
- `src/layouts/` and `src/components/`: the shared page shell and header.
- `public/work/`: the diagrams used on the Work page and in the case studies.
