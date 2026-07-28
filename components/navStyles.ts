/**
 * Shared appearance for the pill-shaped navigation controls: the section-row
 * links, the year dropdown's summary, and the Current Officers button.
 *
 * Kept in one place because these sit next to each other and must look
 * identical -- when the styles were duplicated the dropdown drifted to a
 * heavier font weight than the links beside it.
 */
export const pillBase =
  'rounded-md px-3 py-1.5 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue';

/** Unselected. */
export const pillIdle = 'text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900';

/** The page you are currently on. */
export const pillCurrent = 'bg-brand-blue-dark font-semibold text-white ring-1 ring-brand-blue-dark';
