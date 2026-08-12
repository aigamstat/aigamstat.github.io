#!/usr/bin/env node
/**
 * Checks content/*.md for the mistakes this site fails *silently* on.
 *
 * The Markdown pipeline is deliberately forgiving: lib/markdown.ts strips any
 * `{: ...}` it does not understand, and lib/sessionCards.ts degrades an
 * unrecognised marker to a plain card. That is the right behaviour at render
 * time -- a typo should not break the build for a reader -- but it means a
 * content mistake produces a quietly wrong page instead of an error. This
 * script is where those mistakes are supposed to be caught.
 *
 *   npm run lint:content
 *
 * The valid names are read out of the source that defines them, not listed
 * here, so adding `.accent-purple` to globals.css or a new variant to
 * sessionCards.ts makes it valid with no edit to this file. Same reasoning as
 * lib/nav.ts deriving the menu from disk.
 *
 * Exit codes: 0 clean, 1 content problems found, 2 the script could not
 * work out what the valid names are (which would otherwise pass everything).
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
// resolve, not join: an absolute path passed as the argument must win.
const CONTENT_DIR = path.resolve(ROOT, process.argv[2] ?? 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CSS_FILE = path.join(ROOT, 'app', 'globals.css');
const CARDS_FILE = path.join(ROOT, 'lib', 'sessionCards.ts');

/** Read the source of truth, or stop. Returning an empty set would pass everything. */
function derive(file, label, fn) {
  let src;
  try {
    src = fs.readFileSync(file, 'utf8');
  } catch {
    console.error(`lint-content: cannot read ${path.relative(ROOT, file)}, which defines ${label}.`);
    process.exit(2);
  }
  const found = fn(src);
  if (found.length === 0) {
    console.error(
      `lint-content: found no ${label} in ${path.relative(ROOT, file)}. ` +
        `The file's shape probably changed; update this script rather than ignoring it.`,
    );
    process.exit(2);
  }
  return new Set(found);
}

/** `.prose .accent-green { ... }` -> 'accent-green' */
const accentClasses = derive(CSS_FILE, 'accent-* classes', (src) =>
  [...src.matchAll(/\.prose\s+\.(accent-[\w-]+)\s*\{/g)].map((m) => m[1]),
);

/** The `{: .x}` markers the renderer acts on: the card variants, plus `.cards` itself. */
const markers = derive(CARDS_FILE, 'session-card markers', (src) => {
  const set = src.match(/const VARIANTS\s*=\s*new Set\(\[([\s\S]*?)\]/);
  const variants = set ? [...set[1].matchAll(/['"]([\w-]+)['"]/g)].map((m) => m[1]) : [];
  // CARDS_MARKER is a regex literal, so read the word out of it.
  const cards = src.match(/const CARDS_MARKER\s*=\s*\/\\\{:\\s\*\\\.(\w+)/);
  return cards ? [...variants, cards[1]] : variants;
});

/** Every .md under the content dir, sorted for stable output. */
function markdownFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out.sort();
}

const problems = [];
const report = (file, lineNo, msg, hint) =>
  problems.push({ file: path.relative(ROOT, file), lineNo, msg, hint });

/** A site-root path like /images/x.jpg resolves inside public/. */
function missingAsset(url) {
  if (!url.startsWith('/') || url.startsWith('//')) return false; // external or protocol-relative
  const clean = decodeURIComponent(url.split(/[?#]/)[0]);
  if (!/\.\w{2,5}$/.test(clean)) return false; // a page URL, not a file
  return !fs.existsSync(path.join(PUBLIC_DIR, clean));
}

function lint(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, i) => {
    const lineNo = i + 1;

    // 1. Inline attribute lists. Anything here is stripped before parsing, so
    //    an unknown one is invisible in the output rather than an error.
    for (const [, inner] of line.matchAll(/\{:([^}\n]*)\}/g)) {
      const shape = inner.match(/^\s*\.([\w-]+)\s*$/);
      if (!shape) {
        report(file, lineNo, `inline attribute {:${inner}} is not a {: .class} marker`,
          'It is stripped before parsing, so it has no effect on the page.');
      } else if (!markers.has(shape[1])) {
        report(file, lineNo, `unknown marker {: .${shape[1]}}`,
          `Known markers: ${[...markers].sort().join(', ')}.`);
      }
    }

    // 2. A heading whose only content was a marker renders as <h2 id=""></h2>:
    //    invisible in the source, an empty heading in the output.
    const bare = line.replace(/\{:[^}\n]*\}/g, '');
    if (/^#{1,6}\s*$/.test(bare.trimEnd()) && /^#{1,6}/.test(line)) {
      report(file, lineNo, 'heading is empty once its marker is stripped',
        'Put the marker on its own line instead -- it works anywhere in the file.');
    }

    // 3. Accent classes, which only work if globals.css defines them.
    for (const [, attr] of line.matchAll(/class\s*=\s*["']([^"']*)["']/g)) {
      for (const cls of attr.split(/\s+/).filter(Boolean)) {
        if (cls.startsWith('accent-') && !accentClasses.has(cls)) {
          report(file, lineNo, `unknown class "${cls}"`,
            `Defined in app/globals.css: ${[...accentClasses].sort().join(', ')}.`);
        }
      }
    }

    // 4. Colour written as an HTML attribute. There is no such attribute on any
    //    element; it parses and does nothing.
    for (const [, tag, attr] of line.matchAll(/<(\w+)\b[^>]*?\b(fontcolor|color)\s*=/gi)) {
      report(file, lineNo, `<${tag} ${attr}=...> is not valid HTML`,
        `Use one of the accent classes: ${[...accentClasses].sort().join(', ')}.`);
    }

    // 5. Images that point at nothing. These 404 on the published site.
    const srcs = [
      ...[...line.matchAll(/<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]),
      ...[...line.matchAll(/!\[[^\]]*\]\(([^)\s]+)/g)].map((m) => m[1]),
    ];
    for (const src of srcs) {
      if (missingAsset(src)) {
        report(file, lineNo, `image not found: ${src}`,
          `No such file at public${src}.`);
      }
    }
  });
}

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`lint-content: no such directory ${path.relative(ROOT, CONTENT_DIR)}`);
  process.exit(2);
}

const files = markdownFiles(CONTENT_DIR);
files.forEach(lint);

if (problems.length === 0) {
  console.log(`lint-content: ${files.length} files, no problems.`);
  process.exit(0);
}

let last = null;
for (const { file, lineNo, msg, hint } of problems) {
  if (file !== last) {
    console.error(`\n${file}`);
    last = file;
  }
  console.error(`  ${String(lineNo).padStart(4)}:  ${msg}`);
  console.error(`        ${hint}`);
}
console.error(`\nlint-content: ${problems.length} problem(s) in ${files.length} files.`);
process.exit(1);
