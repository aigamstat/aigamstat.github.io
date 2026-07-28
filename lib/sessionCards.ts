import { renderMarkdown } from './markdown';

/**
 * Renders a page's `###` sections as a grid of cards instead of a run of
 * headings, so a listing like the JSM programme reads as tiles.
 *
 * Opted into from the content, by marking the heading the sections sit under:
 *
 *     ## Astrostatistics sessions at JSM {: .cards}
 *
 * and each section keeps its own style marker:
 *
 *     ### AIG Business Meeting {: .meeting}
 *
 * That `{: .x}` is kramdown's inline attribute list -- syntax this content
 * already used under Jekyll, and which the Markdown pipeline strips when it is
 * not recognised. So a page without the marker renders exactly as before, and a
 * mistyped marker degrades to the default card rather than breaking the build.
 *
 * Everything above the first `###` is rendered normally and comes out ahead of
 * the grid.
 */

/** Markers an author may put on a `###` heading. Anything else is a plain card. */
const VARIANTS = new Set(['featured', 'meeting', 'banner']);

const CARDS_MARKER = /\{:\s*\.cards\s*\}/;

/** True when the page has asked for the card layout. */
export function wantsSessionCards(md: string): boolean {
  return CARDS_MARKER.test(md);
}

type Section = { variant: string; md: string };

/**
 * Split on `###`. `####` and deeper are left inside their section: the pattern
 * requires whitespace after the third #, which a fourth # is not.
 *
 * Fenced code blocks are not accounted for -- a `###` inside one would start a
 * card. No content uses them; revisit if that changes.
 */
export function splitSections(md: string): { intro: string; sections: Section[] } {
  const intro: string[] = [];
  const sections: Section[] = [];
  let current: string[] | null = null;
  let variant = 'plain';

  for (const line of md.split('\n')) {
    const heading = line.match(/^###\s+(.*?)\s*(?:\{:\s*\.([\w-]+)\s*\})?\s*$/);
    if (heading) {
      if (current) sections.push({ variant, md: current.join('\n') });
      const marker = heading[2] ?? '';
      variant = VARIANTS.has(marker) ? marker : 'plain';
      // The marker is dropped here, so it never reaches the renderer.
      current = [`### ${heading[1]}`];
    } else if (current) {
      current.push(line);
    } else {
      intro.push(line);
    }
  }
  if (current) sections.push({ variant, md: current.join('\n') });

  return { intro: intro.join('\n'), sections };
}

export async function renderWithSessionCards(md: string): Promise<string> {
  const { intro, sections } = splitSections(md);
  if (sections.length === 0) return renderMarkdown(md);

  const introHtml = intro.trim() ? await renderMarkdown(intro) : '';
  const cards = await Promise.all(
    sections.map(async ({ variant, md: section }) => {
      const inner = await renderMarkdown(section);
      return `<article class="session-card session-card--${variant}">${inner}</article>`;
    }),
  );

  return `${introHtml}<div class="session-grid">${cards.join('')}</div>`;
}
