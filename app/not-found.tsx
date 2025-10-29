import { FooterStatic } from '@/components/footer-static';
import { HeaderStatic } from '@/components/header-static';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col">
            <HeaderStatic />
            <main className="flex-grow container mx-auto px-6 py-8 flex flex-col justify-center items-center text-center">
                <h1 className="text-6xl font-bold text-foreground">404</h1>
                <p className="text-2xl text-muted-foreground mt-4">Page Not Found</p>
                <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
                <Link href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition no-underline">
                    Go to Homepage
                </Link>
            </main>
            <FooterStatic />
        </div>
    );
}
