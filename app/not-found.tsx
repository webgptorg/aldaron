import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { WaitlistPopup } from '@/components/waitlist-popup';
import Link from 'next/link';
import { Suspense } from 'react';

export default function NotFound() {
    return (
        <main className="min-h-screen">
            <Suspense>
                <WaitlistPopup placeName="NotFound" />
            </Suspense>
            <Header isBare />
            <div className="min-h-screen flex-grow container mx-auto px-6 py-8 flex flex-col justify-center items-center text-center">
                <h1 className="text-6xl font-bold text-foreground">404</h1>
                <p className="text-2xl text-muted-foreground mt-4">Page Not Found</p>
                <p className="text-muted-foreground mt-2">
                    The page you are looking for cannot be found in this universe,
                    <br />
                    but our <strong>AI agent can generate</strong> it for you.
                </p>

                <Link
                    href="/"
                    className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition no-underline"
                >
                    Go Home to AI Agents
                </Link>
            </div>
            <Footer />
        </main>
    );
}
