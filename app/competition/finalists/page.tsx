import ContentPage, { metadataFor } from '@/components/ContentPage';

const URL = '/competition/finalists/';
const FILE = 'competition/finalists.md';

export const generateMetadata = () => metadataFor(FILE);
export default function Page() {
  return <ContentPage url={URL} file={FILE} />;
}
