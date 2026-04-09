import { ForAgroPage } from '@/config/for-agro/_ForAgroPage';
import { forAgroMetadata } from '@/config/for-agro/forAgroMetadata';

/**
 * Metadata for the agronomy landing page route.
 */
export const metadata = forAgroMetadata;

/**
 * Route entry for `/for-agro`.
 */
export default function ForAgroRoute() {
    return <ForAgroPage />;
}

