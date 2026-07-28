import ContentPage, { metadataFor } from '@/components/ContentPage';
import { winnerYears } from '@/lib/nav';

/** One page per competition year, from content/competition/winners/YYYY.md. */
export function generateStaticParams() {
  return winnerYears().map((year) => ({ year }));
}

export const dynamicParams = false;

const fileFor = (year: string) => `competition/winners/${year}.md`;

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return metadataFor(fileFor(year));
}

export default async function Page({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return <ContentPage url={`/competition/winners/${year}/`} file={fileFor(year)} />;
}
