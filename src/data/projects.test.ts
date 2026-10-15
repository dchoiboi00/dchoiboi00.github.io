import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { findProject, newestFirst, projectWhen, projects } from './projects.ts';

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

test("each diagram's width and height match its SVG", () => {
  for (const project of projects) {
    const svg = readFileSync(new URL(`public${project.diagram}`, root), 'utf8');
    const tag = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
    assert.equal(Number(tag.match(/\swidth="(\d+)"/)?.[1]), project.diagramWidth, `${project.slug} width`);
    assert.equal(Number(tag.match(/\sheight="(\d+)"/)?.[1]), project.diagramHeight, `${project.slug} height`);
  }
});

test('projectWhen keeps the length number and unit together', () => {
  assert.equal(projectWhen(findProject('zero-downtime-billing-migration-at-catalogit')), 'Apr – Jun 2026, 2\u00a0months');
});

test('newestFirst orders by end date', () => {
  const ends = [...projects].sort(newestFirst).map((p) => p.end);
  assert.deepEqual(ends, [...ends].sort().reverse());
});

test('findProject throws for a slug with no project', () => {
  assert.throws(() => findProject('no-such-post'), /No project in src\/data\/projects.ts/);
});
