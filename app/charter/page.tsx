import ContentPage, { metadataFor } from '@/components/ContentPage';

const URL = '/charter/';
const FILE = 'charter.md';

export const generateMetadata = () => metadataFor(FILE);
export default function Page() {
  return <ContentPage url={URL} file={FILE} />;
}
