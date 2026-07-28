import ContentPage, { metadataFor } from '@/components/ContentPage';
import OfficerYears from '@/components/OfficerYears';
import { officerYears } from '@/lib/nav';

/** One page per past year of officers, from content/officers/YYYY.md. */
export function generateStaticParams() {
  return officerYears().map((year) => ({ year }));
}

// Only the years present on disk exist; anything else is a build error, not a
// silently generated empty page.
export const dynamicParams = false;

const fileFor = (year: string) => `officers/${year}.md`;

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return metadataFor(fileFor(year));
}

export default async function Page({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const url = `/officers/${year}/`;
  return (
    <ContentPage url={url} file={fileFor(year)}>
      <OfficerYears url={url} />
    </ContentPage>
  );
}
