import type { Metadata } from 'next';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export const metadata: Metadata = {
    title: 'Promptbook administration',
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
};

export default function AdminLayout({ children }: { readonly children: React.ReactNode }) {
    return (
        <>
            <AdminNavigation />
            {children}
        </>
    );
}
