export default function SiteFooter() {
  return (
    // Translucent so the background reads through, but no lighter than 85%:
    // against the darkest pixel of the artwork, 60% put the footer text at
    // 3.78:1, under the 4.5:1 minimum. 85% gives 5.95:1.
    <footer className="mt-16 border-t border-slate-200/70 bg-white/85 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-slate-600 sm:px-6">
        <p>
          Last updated July 27, 2026.
        </p>
        <p>
          Hosted on{' '}
          <a
            href="https://pages.github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-slate-900"
          >
            GitHub Pages
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
