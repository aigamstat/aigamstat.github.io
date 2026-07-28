import ContentPage, { metadataFor } from '@/components/ContentPage';
import { jsmYears } from '@/lib/nav';

/** One page per meeting, from content/jsm/YYYY.md. */
export function generateStaticParams() {
  return jsmYears().map((year) => ({ year }));
}

// Only the years present on disk exist; anything else is a build error, not a
// silently generated empty page.
export const dynamicParams = false;

const fileFor = (year: string) => `jsm/${year}.md`;

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return metadataFor(fileFor(year));
}

export default async function Page({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return <ContentPage url={`/jsm/${year}/`} file={fileFor(year)} />;
}
