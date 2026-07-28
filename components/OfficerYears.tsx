import { officerYears } from '@/lib/nav';
import { href } from '@/lib/site';
import { pillBase, pillCurrent, pillIdle } from './navStyles';
import YearDropdown from './YearDropdown';

/**
 * Officer-list controls, shown on the Officers page and on each past year's
 * page rather than in the main nav -- past years belong to Officers, not
 * beside it. Repeating them on the year pages means you can move between years,
 * or back to the current list, without going up to the Officers tab first.
 */
export default function OfficerYears({ url }: { url: string }) {
  const years = officerYears();
  const active = years.find((y) => url.includes(y));

  return (
    // `flex` so the <details>, a block element, shrinks to its label instead of
    // stretching the width of the content column.
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <a
        href={href('/officers/')}
        aria-current={active ? undefined : 'page'}
        className={`${pillBase} ${active ? pillIdle : pillCurrent}`}
      >
        Current Officers
      </a>

      {years.length > 0 ? (
        <YearDropdown
          label="Past Officers"
          activeYear={active}
          items={years.map((y) => ({
            label: y,
            url: `/officers/${y}/`,
            current: y === active,
          }))}
        />
      ) : null}
    </div>
  );
}
