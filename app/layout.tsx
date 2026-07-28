import type { Metadata } from 'next';
import './globals.css';
import { href, SITE_TAGLINE, SITE_TITLE } from '@/lib/site';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: `${SITE_TITLE} of the ${SITE_TAGLINE}`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      {/* The background image URL is set here rather than in globals.css because
          it has to carry `basePath`, which a stylesheet cannot read. */}
      <body
        className="site-bg text-slate-700 antialiased"
        style={
          {
            '--site-bg-image': `url('${href('/images/AIG_bg_2.png')}')`,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
