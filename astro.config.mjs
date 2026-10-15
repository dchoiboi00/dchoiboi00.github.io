// astro.config.mjs
import { defineConfig } from 'astro/config';
import { rehypeKeepHyphenatedWords } from './src/lib/keep-hyphenated-words.mjs';

export default defineConfig({
  site: 'https://dchoiboi00.github.io',
  markdown: {
    rehypePlugins: [rehypeKeepHyphenatedWords],
  },
});
