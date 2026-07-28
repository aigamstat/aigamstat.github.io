import ContentPage, { metadataFor } from '@/components/ContentPage';

const URL = '/';
const FILE = 'index.md';

export const generateMetadata = () => metadataFor(FILE);
export default function Page() {
  return <ContentPage url={URL} file={FILE} />;
}
