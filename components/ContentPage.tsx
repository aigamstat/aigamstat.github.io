import type { Metadata } from 'next';
import SiteHeader from './SiteHeader';
import SectionNav from './SectionNav';
import SiteFooter from './SiteFooter';
import { loadPage } from '@/lib/markdown';
import { SITE_TITLE } from '@/lib/site';

type Props = {
  /** Canonical site-root URL of this page, e.g. '/officers/2021/'. */
  url: string;
  /** Path of the Markdown file under content/, e.g. 'officers/2021.md'. */
  file: string;
  /** Optional controls rendered above the Markdown, inside <main>. */
  children?: React.ReactNode;
};

/**
 * Renders one Markdown file inside the site chrome.
 *
 * The canonical `url` is passed in rather than read from a router hook so the
 * navigation state is decided at build time. That keeps the correct
 * `aria-current` in the static HTML and needs no client-side JavaScript.
 */
export default async function ContentPage({ url, file, children }: Props) {
  const { html } = await loadPage(file);

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50
                   focus:rounded-md focus:bg-brand-blue-dark focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader url={url} />

      {/* max-w-5xl matches the header, so the card's edges line up with the
          wordmark and nav row above it. */}
      <main id="content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="content-card p-6 sm:p-9">
          <SectionNav url={url} />
          {children}
          {/* Content is Markdown rendered to HTML at build time; no user input. */}
          <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </main>

      <SiteFooter />
    </>
  );
}

/** Build a <title> for a content page from its first heading. */
export async function metadataFor(file: string): Promise<Metadata> {
  const { title } = await loadPage(file);
  return { title: title ? `${title} | ${SITE_TITLE}` : SITE_TITLE };
}
