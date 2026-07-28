import ContentPage, { metadataFor } from '@/components/ContentPage';
import OfficerYears from '@/components/OfficerYears';

const URL = '/officers/';
const FILE = 'officers/index.md';

export const generateMetadata = () => metadataFor(FILE);
export default function Page() {
  return (
    <ContentPage url={URL} file={FILE}>
      <OfficerYears url={URL} />
    </ContentPage>
  );
}
