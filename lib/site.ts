/** Site-wide constants and URL helpers. */

/**
 * Set from next.config.mjs. Empty string in tests/dev fallbacks so that
 * href('/news/') degrades to '/news/' rather than 'undefined/news/'.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const SITE_TITLE = 'Astrostatistics Interest Group';
export const SITE_TAGLINE = 'American Statistical Association';

/** True for anything that should leave the site (or isn't a page navigation). */
export function isExternal(url: string): boolean {
  return /^[a-z]+:/i.test(url) || url.startsWith('//');
}

/**
 * Prefix a site-root-relative path with the base path.
 * Leaves external URLs, mailto: and in-page anchors untouched.
 */
export function href(path: string): string {
  if (isExternal(path) || path.startsWith('#')) return path;
  return `${BASE_PATH}${path}`;
}
