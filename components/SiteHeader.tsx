import { href, SITE_TAGLINE, SITE_TITLE } from '@/lib/site';
import { mainNav, sectionFor } from '@/lib/nav';

/**
 * The old site's header was a single wide bitmap with the group name baked
 * into it, which could not reflow on small screens and was invisible to screen
 * readers. The mark is now an image and the wordmark is real text.
 *
 * The section (second-level) navigation is deliberately not here -- it belongs
 * to the page it describes and is rendered at the top of the content instead.
 * See components/ContentPage.tsx.
 */
export default function SiteHeader({ url }: { url: string }) {
  const active = sectionFor(url);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <a
          href={href('/')}
          className="inline-flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          {/* The original site's ASA / star / AIG lockup, cropped from the old
              banner. Decorative: the group name is spelled out in the adjacent
              text, so a screen reader would otherwise hear it twice. */}
          <img
            src={href('/images/asa-aig-lockup.png')}
            alt=""
            width={884}
            height={160}
            className="h-8 w-auto shrink-0 sm:h-10"
          />
          {/* Below 640px the lockup, this wordmark and the Join AIG button do
              not fit on one line -- the wordmark ran under the button. The
              lockup carries the branding there on its own, so the wordmark is
              hidden visually but kept for screen readers, which is also what
              gives the link its accessible name. */}
          <span className="sr-only leading-tight sm:not-sr-only">
            <span className="block text-lg font-bold tracking-tight text-brand-blue-dark sm:text-xl">
              {SITE_TITLE}
            </span>
            <span className="block text-xs font-semibold tracking-wide text-brand-green-dark uppercase sm:text-sm">
              {SITE_TAGLINE}
            </span>
          </span>
        </a>

        {/* Primary call to action. Kept out of the nav row and given a solid
            fill on every page, so it reads as an action rather than one
            destination among several. Green rather than the blue used for the
            current nav item, so the two are never confused. */}
        <a
          href={href('/join/')}
          aria-current={active === 'join' ? 'page' : undefined}
          className="shrink-0 rounded-lg bg-brand-green-dark px-4 py-2.5 text-sm font-semibold text-white
                     shadow-sm transition hover:bg-brand-green-dark/90
                     focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
        >
          Join AIG
        </a>
      </div>

      <nav aria-label="Main" className="border-t border-slate-200">
        <div className="mx-auto flex max-w-5xl flex-wrap gap-1.5 px-4 py-2.5 sm:px-6">
          {mainNav().map((item) => {
            const current = item.section === active;
            return (
              <a
                key={item.url}
                href={href(item.url)}
                aria-current={current ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium transition
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue
                            ${
                              current
                                ? 'bg-brand-blue-dark text-white'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
