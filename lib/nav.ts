import fs from 'node:fs';
import path from 'node:path';
import { CONTENT_DIR } from './markdown';

/**
 * Navigation is derived from what is on disk, not from a config list. Drop a
 * new file into content/ and it appears in the right menu automatically --
 * under Jekyll this needed a matching edit in _config.yml, which was easy to
 * forget and left pages unreachable.
 */

function yearsFromFiles(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .map((f) => f.match(/^(\d{4})\.md$/)?.[1])
    .filter((y): y is string => Boolean(y))
    .sort()
    .reverse();
}

/**
 * Every year-based section is a folder of YYYY.md files, so they all read the
 * same way. Newest first.
 */
export const jsmYears = () => yearsFromFiles('jsm');
export const winnerYears = () => yearsFromFiles('competition/winners');
export const officerYears = () => yearsFromFiles('officers');

/** The newest JSM year is the current meeting. */
export function currentJsmYear(): string {
  return jsmYears()[0];
}

export type Section =
  | 'home'
  | 'officers'
  | 'charter'
  | 'join'
  | 'competition'
  | 'jsm'
  | 'news';

/**
 * Which top-level section a URL belongs to, for highlighting the nav. Each
 * section is the first path segment, so this mirrors the URL structure exactly.
 */
export function sectionFor(url: string): Section {
  if (url === '/') return 'home';
  if (url.startsWith('/officers')) return 'officers';
  if (url.startsWith('/charter')) return 'charter';
  if (url.startsWith('/join')) return 'join';
  if (url.startsWith('/competition')) return 'competition';
  if (url.startsWith('/jsm')) return 'jsm';
  if (url.startsWith('/news')) return 'news';
  return 'home';
}

export type NavItem = { label: string; url: string; section: Section };

/**
 * The nav row. Join AIG is deliberately absent: it is the site's call to
 * action and lives as a standalone button in the header (see SiteHeader), so
 * the 'join' section still exists for highlighting purposes.
 */
export function mainNav(): NavItem[] {
  return [
    { label: 'Home', url: '/', section: 'home' },
    // Label follows the content, so adding content/jsm/2027.md moves both the
    // link and the year shown on it.
    { label: `JSM ${currentJsmYear()}`, url: `/jsm/${currentJsmYear()}/`, section: 'jsm' },
    { label: 'Officers', url: '/officers/', section: 'officers' },
    { label: 'Charter', url: '/charter/', section: 'charter' },
    // Points at the first item of the section row, not at /competition/, so the
    // tab opens on whatever that row shows first.
    { label: 'Student Paper Competition', url: '/competition/finalists/', section: 'competition' },
    { label: 'News', url: '/news/', section: 'news' },
  ];
}
