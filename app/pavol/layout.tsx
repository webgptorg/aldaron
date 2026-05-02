import type { Metadata } from 'next';

export const metadata: Metadata = {
    icons: {
        icon: [{ url: '/logo/pavol-hejny-ph.svg', type: 'image/svg+xml' }],
        shortcut: ['/logo/pavol-hejny-ph.svg'],
    },
};

export default function PavolLayout({ children }: { children: React.ReactNode }) {
    return children;
}
