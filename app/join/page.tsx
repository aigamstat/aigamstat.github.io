import ContentPage, { metadataFor } from '@/components/ContentPage';

const URL = '/join/';
const FILE = 'join.md';

export const generateMetadata = () => metadataFor(FILE);
export default function Page() {
  return <ContentPage url={URL} file={FILE} />;
}
