import { PavolPage } from '@/businesses/pavol/_PavolPage';
import { getPavolMetadata } from '@/businesses/pavol/pavolMetadata';

export const metadata = getPavolMetadata('en');

export default function PavolEnglishRoute() {
    return <PavolPage language="en" />;
}

