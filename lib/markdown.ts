import fs from 'node:fs';
import path from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Element, Root } from 'hast';
import { href, isExternal } from './site';

export const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Links to other sites open in a new tab. Done at build time (it used to be a
 * client-side script), so it works with JavaScript disabled. The visually
 * hidden suffix is what tells screen-reader users the tab will change --
 * target="_blank" alone gives them no warning.
 */
function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return;
      const url = String(node.properties?.href ?? '');
      // mailto: and tel: are external by the regex but must not open a tab.
      if (!isExternal(url) || /^(mailto|tel):/i.test(url)) return;
      node.properties = {
        ...node.properties,
        target: '_blank',
        rel: ['noopener', 'noreferrer'],
      };
      node.children.push({
        type: 'element',
        tagName: 'span',
        properties: { className: ['sr-only'] },
        children: [{ type: 'text', value: ' (opens in a new tab)' }],
      });
    });
  };
}

/**
 * Content links are written from the site root -- `/jsm/2026/`, `/images/x.jpg`
 * -- and get `basePath` prefixed here.
 *
 * Relative links (`../../jsm/2026/`) would also work, but they encode how deep
 * the linking page happens to sit, so every one of them breaks when a page
 * moves. Root-absolute links say where the target is and nothing about the
 * source. Markdown alone cannot express `basePath`, which is what this adds.
 */
function rehypeBasePath() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      const attr = node.tagName === 'a' ? 'href' : node.tagName === 'img' ? 'src' : null;
      if (!attr) return;
      const url = String(node.properties?.[attr] ?? '');
      // Only site-root paths. Protocol-relative URLs (//host/x) are external.
      if (!url.startsWith('/') || url.startsWith('//')) return;
      node.properties = { ...node.properties, [attr]: href(url) };
    });
  };
}

/**
 * The Markdown came from Jekyll/kramdown, where a trailing `\\` is a hard line
 * break. CommonMark uses a single trailing backslash, so `\\` would otherwise
 * render as a stray backslash. Rewritten here rather than in the content files
 * so the files stay exactly as their authors wrote them.
 */
function normaliseKramdown(md: string): string {
  return (
    md
      .replace(/\\\\[ \t]*$/gm, '<br />')
      // kramdown inline attribute lists ({: .class}) have no CommonMark
      // equivalent. Strip them so they never leak through as visible text;
      // use a plain <img class="..."> where a class is genuinely needed.
      .replace(/\{:[^}\n]*\}/g, '')
  );
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // allowDangerousHtml + rehypeRaw: the content contains hand-written HTML
  // (<p style="...">, <br>, <sup>) that must keep working.
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw)
  .use(rehypeSlug) // heading ids, so existing #anchor links keep resolving
  .use(rehypeBasePath)
  .use(rehypeExternalLinks)
  .use(rehypeStringify, { allowDangerousHtml: true });

export async function renderMarkdown(md: string): Promise<string> {
  const file = await processor.process(normaliseKramdown(md));
  return String(file);
}

/** Read a content file, e.g. contentPath('charter.md'). */
export function readContent(contentPath: string): string {
  return fs.readFileSync(path.join(CONTENT_DIR, contentPath), 'utf8');
}

export function contentExists(contentPath: string): boolean {
  return fs.existsSync(path.join(CONTENT_DIR, contentPath));
}

/** First `# Heading` in the document, used for the browser tab title. */
export function firstHeading(md: string): string | null {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  if (!m) return null;
  // Strip Markdown link syntax: "# [JSM 2022 ...](../..)" -> "JSM 2022 ..."
  return m[1].replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim();
}

export type Page = { html: string; title: string | null };

/** Load and render one content file. */
export async function loadPage(contentPath: string): Promise<Page> {
  const md = readContent(contentPath);
  // Imported here rather than at the top: sessionCards imports renderMarkdown
  // from this module, and a static import both ways is a cycle.
  const { wantsSessionCards, renderWithSessionCards } = await import('./sessionCards');
  const html = wantsSessionCards(md) ? await renderWithSessionCards(md) : await renderMarkdown(md);
  return { html, title: firstHeading(md) };
}
