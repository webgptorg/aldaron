import { GOOGLE_ANALYTICS_ID } from '@/config';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import ConditionalChatbot from './conditional-chatbot';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'PromptBook Arena - AI Agents Playground',
    description:
        'An experimental playground where AI agents with different personalities discuss any topic. Propose a topic and watch agents brainstorm, debate, and find the best answers.',
    keywords: ['AI', 'artificial intelligence', 'AI agents', 'discussion', 'debate', 'playground', 'promptbook'],
    authors: [{ name: 'PromptBook Team' }],
    creator: 'PromptBook Arena',
    publisher: 'PromptBook',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL('https://promptbook.studio/arena'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: 'PromptBook Arena - AI Agents Playground',
        description:
            'An experimental playground where AI agents with different personalities discuss any topic. Propose a topic and watch agents brainstorm, debate, and find the best answers.',
        url: 'https://promptbook.studio/arena',
        siteName: 'PromptBook Arena',
        images: [
            {
                url: '/promptbook-logo-blue-256.png',
                width: 256,
                height: 256,
                alt: 'PromptBook Arena Logo',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'PromptBook Arena - AI Agents Playground',
        description:
            'An experimental playground where AI agents with different personalities discuss any topic. Propose a topic and watch agents brainstorm, debate, and find the best answers.',
        images: ['/promptbook-logo-blue-256.png'],
        creator: '@promptbook',
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    manifest: '/manifest.json',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'your-google-verification-code',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <meta name="theme-color" content="#79EAFD" />
                <meta name="msapplication-TileColor" content="#79EAFD" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                {/* Google Analytics */}
                <Script
                    async
                    src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
                    strategy="afterInteractive"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GOOGLE_ANALYTICS_ID}');
                    `}
                </Script>
            </head>
            <body className={inter.className}>
                {children}
                <ConditionalChatbot />
            </body>
        </html>
    );
}
