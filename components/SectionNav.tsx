import { href } from '@/lib/site';
import { currentJsmYear, jsmYears, winnerYears } from '@/lib/nav';
import { pillBase, pillCurrent, pillIdle } from './navStyles';
import YearDropdown from './YearDropdown';

/**
 * Rendered at the top of the page content rather than as a bar under the main
 * nav, so it reads as belonging to the page it applies to. Hence no full-width
 * background or container of its own -- it sits inside the content card and is
 * separated from the text by a rule.
 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <nav
      aria-label={label}
      className="mb-7 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-6"
    >
      {children}
    </nav>
  );
}

function Item({ label, url, current }: { label: string; url: string; current: boolean }) {
  return (
    <a
      href={href(url)}
      aria-current={current ? 'page' : undefined}
      className={`${pillBase} ${current ? pillCurrent : pillIdle}`}
    >
      {label}
    </a>
  );
}

/**
 * The second navigation row. Which row appears is decided by the page's URL,
 * so a new page in the right folder picks up the right sub-navigation.
 * Home, Join AIG and News are single pages and get no row.
 */
export default function SectionNav({ url }: { url: string }) {
  // Officers and Charter are top-level sections in their own right, so they get
  // no row here. Officers still offers past years, but from its own page
  // content -- see components/OfficerYears.tsx.

  if (url.startsWith('/competition')) {
    const years = winnerYears();
    const active = years.find((y) => url.includes(y));
    return (
      <Row label="Student Paper Competition sections">
        <Item
          label={`${currentJsmYear()} Finalists`}
          url="/competition/finalists/"
          current={url.startsWith('/competition/finalists')}
        />
        <Item
          label={`${currentJsmYear()} Competition (closed)`}
          url="/competition/"
          current={url === '/competition/'}
        />
        <YearDropdown
          label="Previous Winners"
          activeYear={active}
          items={years.map((y) => ({
            label: y,
            url: `/competition/winners/${y}/`,
            current: y === active,
          }))}
        />
      </Row>
    );
  }

  if (url.startsWith('/jsm')) {
    const current = currentJsmYear();
    const past = jsmYears().filter((y) => y !== current);
    const active = past.find((y) => url.includes(y));
    return (
      <Row label="JSM years">
        <Item label={`JSM ${current}`} url={`/jsm/${current}/`} current={url.includes(current)} />
        <YearDropdown
          label="Past Years"
          activeYear={active}
          items={past.map((y) => ({ label: `JSM ${y}`, url: `/jsm/${y}/`, current: y === active }))}
        />
      </Row>
    );
  }

  return null;
}
