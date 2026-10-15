// Browsers break lines at hyphens and en dashes, which splits words like
// "CSV-to-schema" or "15–30" across two lines. Wrapping each hyphenated word
// in a `.nowrap` span keeps it whole.

const HYPHENATED_WORD = /\S+[-–]\S+/g;
const SKIP_TAGS = new Set(['code', 'pre', 'script', 'style']);

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** For plain strings rendered in templates with `set:html`. */
export const keepHyphenatedWords = (text) =>
  escapeHtml(text).replace(HYPHENATED_WORD, (word) => `<span class="nowrap">${word}</span>`);

/** The same rule for Markdown content, as a rehype plugin. */
export function rehypeKeepHyphenatedWords() {
  return (tree) => {
    wrapHyphenatedWords(tree);
  };
}

function wrapHyphenatedWords(node) {
  if (!node.children) return;
  if (node.type === 'element' && SKIP_TAGS.has(node.tagName)) return;
  node.children = node.children.flatMap((child) => {
    if (child.type === 'text') return splitText(child.value);
    wrapHyphenatedWords(child);
    return [child];
  });
}

function splitText(value) {
  const nodes = [];
  let last = 0;
  for (const match of value.matchAll(HYPHENATED_WORD)) {
    if (match.index > last) nodes.push({ type: 'text', value: value.slice(last, match.index) });
    nodes.push({
      type: 'element',
      tagName: 'span',
      properties: { className: ['nowrap'] },
      children: [{ type: 'text', value: match[0] }],
    });
    last = match.index + match[0].length;
  }
  if (last < value.length) nodes.push({ type: 'text', value: value.slice(last) });
  return nodes.length > 0 ? nodes : [{ type: 'text', value }];
}
