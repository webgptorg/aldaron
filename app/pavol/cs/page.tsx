import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { getPavolMetadata } from '@/businesses/pavol/pavolMetadata';

export const metadata = getPavolMetadata('cs');

export default function PavolCzechRoute() {
    return <PavolPage language="cs" />;
}

