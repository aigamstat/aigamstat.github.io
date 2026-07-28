# Astrostatistics Interest Group Homepage

A React site built with Next.js, deployed to GitHub Pages. Page content is
plain Markdown so it can be edited without touching any React.

**Live site:** <http://astrostat.org/>

---

## Running the site locally

Requires [Node.js](https://nodejs.org) 20 or newer.

```sh
npm install     # first time only
npm run dev
```

Then open **<http://localhost:3000>**.

Edits to anything under `content/` appear immediately — no restart, no rebuild.

Local URLs match the published ones exactly, so `http://localhost:3000/officers/`
is what `astrostat.org/officers/` will be.

To reproduce exactly what gets published:

```sh
npm run build   # writes the finished site to out/
```

### The dev server is slower than the real site

`next dev` compiles each page the first time you open it, so the first visit to
a page takes roughly half a second and feels sluggish. That is the compiler, not
the site. The published pages are pre-built HTML and load in a few milliseconds,
and `npm run build` is the way to check real performance.

### Local URLs match published ones

Every page is a directory URL (`/officers/`, `/jsm/2026/`), which the dev server
and the export produce identically. What you see locally is what gets published,
including the address bar.

Write links between pages from the site root — `/join/`, `/jsm/2022/`,
`/images/photo.jpg` — never as relative paths. The build prefixes `basePath`
for you, and a root path does not change when the page linking to it moves.

### Dependencies and `npm audit`

**Never run `npm audit fix --force` on this project.** npm treats any version
outside an advisory's affected range as a "fix", including older ones — asked to
patch a Next.js dependency it will happily install `next@9.3.3`, six major
versions backwards, which breaks the build completely.

When an advisory appears in a package Next depends on, pin the patched version
in the `overrides` block of `package.json` instead. That repoints the transitive
dependency without touching Next itself:

```json
"overrides": {
  "postcss": "^8.5.23",
  "sharp": "^0.35.3"
}
```

Then `rm -rf node_modules package-lock.json && npm install`, and check
`npm audit` reports zero. Run `npm run build` afterwards — an override forces a
version the parent package never tested against, so the build is the proof it
worked.

Worth keeping in perspective: everything here is a **build-time** dependency.
The published site is static HTML, CSS and images on GitHub Pages, with no
server running any of this. The CSS these tools process is the site's own, not
attacker-supplied.

---

## Editing content

Every page is a Markdown file under `content/`, laid out to mirror its URL:

| URL | File |
|---|---|
| `/` | `content/index.md` |
| `/news/` | `content/news.md` |
| `/charter/` | `content/charter.md` |
| `/officers/2021/` | `content/officers/2021.md` |
| `/competition/winners/2022/` | `content/competition/winners/2022.md` |
| `/jsm/2026/` | `content/jsm/2026.md` |

Ordinary Markdown, plus inline HTML where the original pages used it
(`<p style="text-align: center;">`, `<br>`, `<sup>`). Links between pages and to
images are written from the site root — `/join/`, `/images/photo.jpg` — and the
build prefixes `basePath`.

To break a line without starting a new paragraph, end it with a backslash.
Trailing spaces also work but are invisible and editors strip them on save.

Markdown has no syntax for colour, so wrap the text in a span:

```markdown
<span class="accent-green">Also, check out the sessions at [JSM 2026](/jsm/2026/)!</span>
```

`accent-green` and `accent-blue` are the only two, defined in
[`app/globals.css`](app/globals.css). They are the `-dark` brand variants, the
only ones safe for text — the mark's bright green is 1.99:1 on white. Use the
class rather than an inline colour, so the palette stays changeable in one
place. Links inside a coloured span keep the normal link colour.

Handled automatically at build time, so you do not need to write them:

- **`basePath`** is prefixed to every root-relative link and image.
- **Links to other websites** get `target="_blank"` plus a hidden "(opens in a
  new tab)" note for screen readers.
- **Heading anchors** (`#session-401`) are generated from heading text.

### The browser-tab icon

[`app/icon.png`](app/icon.png) is the favicon. Next picks it up from that
filename alone and adds the `<link rel="icon">` to every page, with `basePath`
applied — there is nothing to wire up. Replace the file to change it.

It is the AIG star, 512x512, with the background outside the disc made
transparent so it does not show as a white square on a dark browser theme. The
white star itself is preserved: the transparency was flood-filled inward from
the edges rather than applied to every white pixel.

### Adding a page

Create the Markdown file, then add a matching route under `app/`. Routes are
three lines — copy `app/join/page.tsx` and change the two constants.

### Session cards

A listing page can render its `###` sections as a grid of cards instead of a run
of headings — the JSM 2026 page does. Mark the heading they sit under, and give
any section that should stand out a style:

```markdown
## Astrostatistics sessions at JSM {: .cards}

### Astrostatistics Interest Group: Student Paper Award {: .featured}
### AIG Business Meeting {: .meeting}
### Contributed Poster Presentations                      <- plain card
```

`{: .x}` is kramdown's inline attribute list, the syntax this content already
used under Jekyll. Anything above the first `###` renders normally and appears
before the grid. Within a card: the `###` is the title, each paragraph is a
detail line (time, room, organisers), and list items are the talks, with any
nested item beneath them treated as the presenter.

Two columns from 640px up, one below. `.featured` spans the full width. A page
without `{: .cards}` is unaffected, so the older JSM pages render as before.
Styling lives in the session-card block of [`app/globals.css`](app/globals.css);
the transform is [`lib/sessionCards.ts`](lib/sessionCards.ts).

### Adding a year

Just add the file. Navigation menus are built by reading `content/`, so:

- `content/officers/2027.md` → appears in **Past Officers**
- `content/competition/winners/2027.md` → appears in **Previous Winners**
- `content/jsm/2027.md` → becomes the current JSM, older years move into
  **Past Years**, and the main "JSM" nav button repoints automatically

The year pages themselves need no route file — `app/jsm/[year]`,
`app/officers/[year]` and `app/competition/winners/[year]` generate one
page per file found.

---

## How deployment works

Push to `master` and [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
builds the site and publishes it. Progress and failures appear under the repo's
**Actions** tab. A failed build leaves the currently published site untouched.

This requires **Settings → Pages → Source** to be set to **GitHub Actions**
(not "Deploy from a branch" — that mode only knows how to run Jekyll).

### The `basePath` setting

`basePath` in [`next.config.mjs`](next.config.mjs) is the equivalent of Jekyll's
old `baseurl`, and it has to match how GitHub Pages serves the repository:

| How the repo is served | `basePath` |
|---|---|
| From a custom domain, or as `<account>.github.io` | `''` (empty) |
| As a project page at `<account>.github.io/<repo>/` | `'/<repo>'` |

The production site runs on a custom domain and is served from the root, so it
needs no `basePath`. A copy deployed to `<account>.github.io/<repo>/` — a test
deployment, for example — must set it, or every stylesheet, image and link will
resolve one level too high and the site will come out unstyled.

**This is the only value that needs changing when the site moves.**

One caveat if you ever set it non-empty to test a fork: `basePath` together with
`trailingSlash` makes the dev server bounce `/<basePath>/` against `/<basePath>`
forever, so the home page will not open locally. Adding
`skipTrailingSlashRedirect: true` to the config stops it. That is not needed here
because `basePath` is empty.

### URL structure

Every URL is a directory path ending in a slash, and the first segment is always
the navigation section it belongs to:

```
/                        /jsm/2026/           /officers/
/join/                   /jsm/2024/           /officers/2021/
/news/                   /competition/        /charter/
                         /competition/finalists/
                         /competition/winners/2024/
```

`trailingSlash: true` in [`next.config.mjs`](next.config.mjs) is what produces
them: the route `/officers` exports to `out/officers/index.html`. There is no
post-build step and no `.html` anywhere.

**These URLs are not the ones the Jekyll site used.** Pages moved out of
`/about/`, the JSM years moved under `/jsm/`, and the `.html` endings went away,
so that the URL of a page matches where it sits in the navigation. Old inbound
links are not redirected — they land on the 404 page, which carries the full
site navigation.

Navigation uses plain `<a href>` rather than `next/link`, so every click is a
real page load at the exact published path. On a site this size the difference
is imperceptible, and it keeps URLs unambiguous.

---

## How the code is organised

```
app/            routes — each is a thin wrapper naming a URL and a content file
components/     SiteHeader, SectionNav, OfficerYears, YearDropdown,
                ContentPage, SiteFooter, navStyles
lib/            markdown pipeline, session cards, navigation model, URL helpers
content/        the Markdown pages, laid out to mirror the URLs
public/         images and PDFs, also mirroring the URLs
```

`app/`, `content/` and `public/` share the same shape, so a page's route, its
Markdown and any file it links to all sit at the same path:

```
/jsm/2026/   ->  app/jsm/[year]/page.tsx   content/jsm/2026.md   public/jsm/2020/*.pdf
/officers/2021/  app/officers/[year]/…     content/officers/2021.md
```

Year-based sections are always a folder of `YYYY.md` files, which is why
`jsmYears()`, `winnerYears()` and `officerYears()` are one shared helper.

Navigation lives only in `components/`:

- **Global row**, every page: Home · Officers · Charter · Student Paper
  Competition · JSM · News.
- **Join AIG** is not in that row. It is the site's call to action, so it sits
  as a solid button in the header on every page (`SiteHeader`).
- **Section row**, chosen from the page's URL: Competition and JSM each get a
  year menu. It renders at the top of the page content rather than as a third
  bar in the header, so it reads as belonging to the page. Every other section
  is a single page and gets no row.

### Styling

Tailwind CSS. Design tokens are declared in the `@theme` block at the top of
[`app/globals.css`](app/globals.css); the styling for Markdown-generated content
is the plain CSS `.prose` block below it.

The two brand colours are sampled from the AIG mark. **The mark's green
(`#9EC54C`) is only 1.99:1 against white and must never be used for text** — it
is for rules and accents. The `-dark` variants are the text-safe versions.

### Accessibility

The build is checked for: a `lang` attribute, landmark elements, a skip link as
the first focusable element, `aria-current` on the active nav item, alt text on
images, no duplicate ids, and AA colour contrast.

Dropdown menus are native `<details>`/`<summary>` elements, so they are keyboard
operable and exposed correctly to screen readers. A small script adds the one
thing `<details>` does not do by itself — closing when you click away or press
Escape, returning focus to the button. Opening and closing still work with
JavaScript disabled.

One known gap, inherited from the original content: **heading levels skip** on
several JSM pages (`#` followed by `####`). Correcting them means renumbering
headings in the Markdown, which changes how those documents are structured.
