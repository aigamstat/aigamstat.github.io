import type { Metadata } from 'next';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { href, SITE_TITLE } from '@/lib/site';

export const metadata: Metadata = { title: `Page not found | ${SITE_TITLE}` };

/**
 * Exported as out/404.html, which GitHub Pages serves for unknown URLs.
 * Given the site chrome so a wrong link is still navigable rather than a
 * dead end.
 */
export default function NotFound() {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50
                   focus:rounded-md focus:bg-brand-blue-dark focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader url="/404" />

      <main id="content" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="content-card prose p-6 sm:p-9">
          <h1>Page not found</h1>
          <p>
            That page does not exist. It may have been moved or the link may be out of date. Use the
            navigation above, or <a href={href('/')}>return to the home page</a>.
          </p>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
