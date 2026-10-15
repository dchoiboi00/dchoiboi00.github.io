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
