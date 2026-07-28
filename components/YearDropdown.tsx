'use client';

import { useEffect, useRef } from 'react';
import { href } from '@/lib/site';
import { pillBase, pillCurrent, pillIdle } from './navStyles';

type Props = {
  /** Menu label, e.g. "Past Years". */
  label: string;
  /** Year currently being viewed, appended to the label so it shows when closed. */
  activeYear?: string;
  items: { label: string; url: string; current: boolean }[];
};

/**
 * A disclosure menu built on native <details>/<summary>.
 *
 * Deliberately not a custom widget: <details> is keyboard operable, exposed
 * correctly to screen readers, and still opens and closes with JavaScript
 * disabled. The script below only adds dismissal -- clicking away or pressing
 * Escape -- which <details> does not do on its own.
 */
export default function YearDropdown({ label, activeYear, items }: Props) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const el = ref.current;
      if (el?.open && !el.contains(event.target as Node)) el.open = false;
    }

    function closeOnEscape(event: KeyboardEvent) {
      const el = ref.current;
      if (event.key !== 'Escape' || !el?.open) return;
      el.open = false;
      // Focus would otherwise be left on a hidden menu item.
      el.querySelector('summary')?.focus();
    }

    // pointerdown rather than click so the menu closes on touch as well, and
    // before any link under the pointer activates.
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <details ref={ref} className="group relative">
      <summary
        /* Blue once a year is chosen, matching how any other selected control
           in these rows looks. */
        className={`${pillBase} ${activeYear ? pillCurrent : pillIdle}
                    flex cursor-pointer list-none items-center gap-1.5
                    group-open:bg-brand-blue-dark group-open:text-white group-open:ring-brand-blue-dark
                    [&::-webkit-details-marker]:hidden`}
      >
        {/* Label and year are one flex item so the row `gap` does not open a
            space before the colon. */}
        <span>
          {label}
          {activeYear ? `: ${activeYear}` : null}
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="h-3 w-3 transition-transform group-open:rotate-180"
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <ul
        className="absolute left-0 z-30 mt-1.5 flex max-h-72 min-w-[9rem] flex-col gap-0.5 overflow-y-auto
                   rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg"
      >
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={href(item.url)}
              aria-current={item.current ? 'page' : undefined}
              className={`block rounded px-3 py-1.5 text-sm whitespace-nowrap transition
                          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue
                          ${
                            item.current
                              ? 'bg-brand-blue-dark font-semibold text-white'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
