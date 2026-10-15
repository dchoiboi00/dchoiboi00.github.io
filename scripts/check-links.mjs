// Fails if any internal link, image, or redirect in dist/ points at
// something the build didn't produce, or if a redirect page for an old URL
// (/work, /writing, /about, /writing/<slug>) is missing. Run after `npm run build`.
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

// Every old URL must still land on a redirect page.
const writingDir = fileURLToPath(new URL('../src/content/writing/', import.meta.url));
const oldUrls = [
  '/work',
  '/writing',
  '/about',
  ...readdirSync(writingDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => `/writing/${name.replace(/\.md$/, '')}`),
];

const resolves = (href) => {
  const path = decodeURI(href.split('#')[0].split('?')[0]);
  if (path === '' || path === '/') return true;
  const target = join(dist, path);
  return (existsSync(target) && statSync(target).isFile()) || existsSync(join(target, 'index.html'));
};

const broken = [];
for (const url of oldUrls) {
  if (!existsSync(join(dist, url, 'index.html'))) broken.push(`missing redirect page -> ${url}`);
}
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
